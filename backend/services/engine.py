"""First-order analytical performance model for Edge AI deployment.
Numbers are estimates derived from published model specs and typical sustained device throughput,
not on-device measurements. Replace DEVICES/MODELS values with your own benchmarks for precision."""
from math import log2, log10

def clamp(x, lo=0.0, hi=100.0): return max(lo, min(hi, x))
def r(x, n=2): return round(float(x), n)

MODELS = {
    "MobileNetV2": dict(params_m=3.5, gflops=0.6, size_mb=14.0, acc=71.9, task="Image classification (ImageNet top-1 %)"),
    "YOLOv8": dict(params_m=3.2, gflops=8.7, size_mb=12.8, acc=37.3, task="Object detection (YOLOv8n, COCO mAP)"),
    "ResNet50": dict(params_m=25.6, gflops=8.2, size_mb=102.4, acc=76.1, task="Image classification (ImageNet top-1 %)"),
    "EfficientNet": dict(params_m=5.3, gflops=0.78, size_mb=21.2, acc=77.1, task="Image classification (B0, top-1 %)"),
    "BERT": dict(params_m=110.0, gflops=22.0, size_mb=440.0, acc=84.0, task="NLP (BERT-base, seq 128, GLUE avg)"),
    "DistilBERT": dict(params_m=66.0, gflops=11.0, size_mb=264.0, acc=82.0, task="NLP (seq 128, GLUE avg)"),
}
# gflops = sustained effective GFLOPs for NN inference; power in W (peak/idle); rth = thermal resistance C/W
DEVICES = {
    "Raspberry Pi 4": dict(gflops=8, ram_mb=4096, power=6.4, idle=2.7, gpu=False, rth=6.0, cost=55),
    "Raspberry Pi 5": dict(gflops=25, ram_mb=8192, power=8.0, idle=3.0, gpu=False, rth=6.0, cost=80),
    "Jetson Nano": dict(gflops=100, ram_mb=4096, power=10.0, idle=2.0, gpu=True, rth=4.5, cost=99),
    "Jetson Xavier": dict(gflops=600, ram_mb=8192, power=15.0, idle=5.0, gpu=True, rth=3.5, cost=399),
    "Android Smartphone": dict(gflops=80, ram_mb=6144, power=5.0, idle=0.8, gpu=True, rth=4.0, cost=300),
    "ESP32": dict(gflops=0.05, ram_mb=0.5, power=0.5, idle=0.1, gpu=False, rth=20.0, cost=10),
    "STM32": dict(gflops=0.1, ram_mb=0.5, power=0.3, idle=0.05, gpu=False, rth=25.0, cost=15),
}
# multiplicative factors relative to the FP32 baseline
OPT = {
    "Quantization": dict(size=.25, acc=1.2, lat=.45, mem=.40, pw=.70, label="INT8 Quantization"),
    "Pruning": dict(size=.60, acc=1.8, lat=.70, mem=.70, pw=.80, label="Structured Pruning (40%)"),
    "Knowledge Distillation": dict(size=.50, acc=2.5, lat=.50, mem=.50, pw=.65, label="Knowledge Distillation"),
    "Weight Compression": dict(size=.45, acc=.8, lat=.95, mem=.60, pw=.95, label="Weight Compression"),
    "Model Conversion": dict(size=.90, acc=.1, lat=.75, mem=.85, pw=.85, label="ONNX / TFLite Conversion"),
}
NOOPT = dict(size=1, acc=0, lat=1, mem=1, pw=1, label="FP32 (no optimization)")

def norm_method(m):
    if m in (None, "", "None", "none", "Any"): return None
    if m not in OPT: raise ValueError(f"Unknown optimization method: {m}")
    return m

def dev(name):
    if name not in DEVICES: raise ValueError(f"Unknown device: {name}")
    return name

def get_model(name, params_m=None, gflops=None, accuracy=None):
    if name == "Custom Model":
        p = float(params_m or 10); g = float(gflops or p * 0.5)
        return dict(name=name, params_m=p, gflops=g, size_mb=p * 4, acc=float(accuracy or 75), task="Custom model")
    if name not in MODELS: raise ValueError(f"Unknown model: {name}")
    return dict(name=name, **MODELS[name])

def evaluate(m, dname, method=None):
    d = DEVICES[dev(dname)]; f = OPT.get(norm_method(method), NOOPT)
    mem = (m["size_mb"] * 1.3 + m["gflops"] * 6 + 20) * f["mem"]
    compute_s = m["gflops"] * f["lat"] / d["gflops"]
    lat = max(1.0, compute_s * 1000) + (3 if d["gpu"] else 1)
    sat = min(1.0, compute_s / 0.1)
    util = 0.5 + 0.5 * sat
    power = d["idle"] + (d["power"] - d["idle"]) * util * f["pw"]
    return dict(
        device=dname, fits=bool(mem <= d["ram_mb"] * 0.8), latency_ms=r(lat, 1), fps=r(1000 / lat, 1),
        size_mb=r(m["size_mb"] * f["size"]), ram_mb=r(mem, 1), ram_pct=r(min(999, mem / d["ram_mb"] * 100), 1),
        cpu_pct=r(15 + 25 * sat if d["gpu"] else 35 + 60 * sat, 1), gpu_pct=r(30 + 65 * sat if d["gpu"] else 0, 1),
        power_w=r(power), energy_mj=r(power * lat, 1), thermal_c=r(25 + power * d["rth"], 1),
        accuracy=r(m["acc"] - f["acc"], 1), cost_usd=d["cost"])

def readiness(m, method=None):
    ev = [evaluate(m, d, method) for d in DEVICES]
    fits = sum(e["fits"] for e in ev) / len(ev)
    rt = sum(e["fits"] and e["latency_ms"] <= 100 for e in ev) / len(ev)
    return r(100 * (0.45 * fits + 0.35 * rt + 0.2 * ev[0]["accuracy"] / 100), 1), ev

def lat_score(ms): return clamp(100 - 100 * log10(max(ms, 1)) / 3)

def analyze(m, ref="Raspberry Pi 5"):
    base = evaluate(m, ref); score, ev = readiness(m)
    best = max(OPT, key=lambda k: readiness(m, k)[0]); opt_score = readiness(m, best)[0]
    radar = [dict(metric="Speed", score=r(lat_score(base["latency_ms"]), 0)),
             dict(metric="Memory", score=r(clamp(100 - base["ram_pct"]), 0)),
             dict(metric="Power", score=r(clamp(100 - base["power_w"] * 6), 0)),
             dict(metric="Accuracy", score=r(clamp(m["acc"]), 0)),
             dict(metric="Size", score=r(clamp(100 - m["size_mb"] / 5), 0))]
    verdict = "Ready" if score >= 70 else "Deployable with optimization" if score >= 40 else "Needs major changes"
    return dict(model=m["name"], task=m["task"], reference_device=ref, params_m=r(m["params_m"]), gflops=r(m["gflops"]),
                size_mb=r(m["size_mb"]), mem_mb=base["ram_mb"], latency_ms=base["latency_ms"], accuracy=r(m["acc"], 1),
                readiness=score, readiness_optimized=opt_score, best_optimization=best, verdict=verdict,
                devices=ev, radar=radar,
                summary=(f"{m['name']} ({r(m['params_m'],1)}M params, {r(m['gflops'],1)} GFLOPs) needs about {base['ram_mb']:.0f} MB of RAM "
                         f"and runs in ~{base['latency_ms']} ms on {ref}. Deployment readiness is {score}%; applying "
                         f"{OPT[best]['label']} lifts it to {opt_score}%."))

def simulate(m, dname, method=None):
    sel = evaluate(m, dname, method); notes = []
    if not sel["fits"]: notes.append("Model does not fit in usable RAM (80% of total). Use a smaller model or stronger optimization.")
    if sel["thermal_c"] > 80: notes.append("Sustained load may cause thermal throttling; add a heatsink or reduce duty cycle.")
    if sel["latency_ms"] > 1000: notes.append("Latency above 1 s: not suitable for interactive use on this device.")
    if not notes: notes.append("Within comfortable operating limits for continuous inference.")
    return dict(model=m["name"], device=dname, method=method, selected=sel,
                comparison=[evaluate(m, d, method) for d in DEVICES], notes=notes)

def _gains(m, dname, meth):
    b, a = evaluate(m, dname), evaluate(m, dname, meth)
    g = lambda x, y: r((x - y) / x * 100, 1) if x else 0.0
    gains = dict(size=g(b["size_mb"], a["size_mb"]), latency=g(b["latency_ms"], a["latency_ms"]),
                 memory=g(b["ram_mb"], a["ram_mb"]), power=g(b["power_w"], a["power_w"]),
                 accuracy_drop=r(b["accuracy"] - a["accuracy"], 1))
    score = r(clamp(1.25 * (0.3 * gains["size"] + 0.3 * gains["latency"] + 0.2 * gains["power"] + 0.2 * gains["memory"])
                    - 4 * gains["accuracy_drop"]), 1)
    return b, a, gains, score

def optimize(m, method, dname):
    method = norm_method(method) or "Quantization"
    b, a, gains, score = _gains(m, dname, method)
    allm = []
    for k in OPT:
        g, s = _gains(m, dname, k)[2:]
        allm.append(dict(method=k, **g, score=s))
    return dict(model=m["name"], device=dname, method=method, label=OPT[method]["label"], before=b, after=a,
                gains=gains, score=score, all_methods=allm)

def predict_energy(m, dname, epochs=10, batch=32, n=50000, price=0.12, grid=0.475):
    d = DEVICES[dev(dname)]
    eff = 0.35 + 0.65 * min(1, log2(max(batch, 1)) / 7)
    def kwh_for(dn, ep):
        dd = DEVICES[dn]
        secs = m["gflops"] * 3 * n * ep / (dd["gflops"] * eff)
        return secs, secs * dd["power"] / 3.6e6
    secs, kwh = kwh_for(dname, epochs); co2 = kwh * grid
    curve = [dict(epoch=e, kwh=r(kwh_for(dname, e)[1], 5), co2=r(kwh_for(dname, e)[1] * grid, 5)) for e in range(1, int(epochs) + 1)]
    return dict(model=m["name"], device=dname, epochs=epochs, batch_size=batch, hours=r(secs / 3600, 2), energy_kwh=r(kwh, 4),
                cost_usd=r(kwh * price, 4), co2_kg=r(co2, 4),
                sustainability=r(clamp(100 - 25 * log10(1 + co2 * 1000)), 1),
                equivalents=dict(km_driven=r(co2 / 0.12, 2), phone_charges=r(kwh / 0.012, 1)),
                by_device=[dict(device=dn, kwh=r(kwh_for(dn, epochs)[1], 4), co2=r(kwh_for(dn, epochs)[1] * grid, 4)) for dn in DEVICES],
                curve=curve[:: max(1, len(curve) // 20)],
                assumptions=f"{n:,} training samples, forward+backward = 3x forward FLOPs, grid {grid} kgCO2/kWh, ${price}/kWh.")

def recommend(m, device=None, method=None, priority="balanced", units=1, hours=24):
    device = dev(device) if device not in (None, "", "Any") else None
    method = norm_method(method)
    w = dict(balanced=(.4, .3, .2, .1), latency=(.6, .15, .15, .1), power=(.2, .55, .15, .1), cost=(.25, .2, .15, .4)).get(priority, (.4, .3, .2, .1))
    cands = []
    for dn in ([device] if device else DEVICES):
        for me in ([method] if method else [None] + list(OPT)):
            e = evaluate(m, dn, me)
            if not e["fits"]: continue
            s = (w[0] * lat_score(e["latency_ms"]) + w[1] * clamp(100 - e["power_w"] * 6) + w[2] * clamp(100 - (m["acc"] - e["accuracy"]) * 10)
                 + w[3] * clamp(100 - e["cost_usd"] / 4))
            cands.append(dict(device=dn, method=me, label=OPT.get(me, NOOPT)["label"], score=r(s, 1), metrics=e))
    if not cands:
        return dict(model=m["name"], feasible=False, headline=f"No feasible deployment found for {m['name']} with the selected constraints.",
                    reasoning=["The model exceeds usable RAM on every candidate. Try a stronger optimization, a smaller model, or a larger device."])
    cands.sort(key=lambda c: -c["score"]); best = cands[0]; e = best["metrics"]
    kwh_year = e["power_w"] * hours * 365 / 1000 * units
    reasons = [f"Latency of {e['latency_ms']} ms ({e['fps']} FPS) on {best['device']}.",
               f"Estimated power draw {e['power_w']} W and {e['energy_mj']} mJ per inference.",
               f"Memory footprint {e['ram_mb']:.0f} MB ({min(e['ram_pct'], 100):.0f}% of device RAM).",
               f"Expected accuracy {e['accuracy']} (baseline {m['acc']}).",
               f"Priority '{priority}' ranked it first among {len(cands)} feasible device/optimization combinations."]
    return dict(model=m["name"], feasible=True, recommended_device=best["device"], recommended_method=best["label"],
                headline=(f"{m['name']} deployed on {best['device']} with {best['label']} is recommended due to "
                          f"{'lower latency and reduced power consumption' if best['method'] else 'meeting all constraints without optimization'}."),
                estimated_performance=dict(latency_ms=e["latency_ms"], fps=e["fps"], accuracy=e["accuracy"]),
                expected_power_w=e["power_w"], reasoning=reasons, alternatives=cands[1:4],
                cost=dict(units=units, hours_per_day=hours, hardware_usd=r(e["cost_usd"] * units),
                          energy_kwh_year=r(kwh_year), energy_cost_year_usd=r(kwh_year * 0.12), tco_3y_usd=r(e["cost_usd"] * units + kwh_year * 0.12 * 3)))

def benchmark(a, b, dname):
    ea, eb = evaluate(a, dname), evaluate(b, dname)
    spec = [("Accuracy", "accuracy", True, ""), ("Model Size", "size_mb", False, "MB"), ("Speed", "fps", True, "FPS"),
            ("Memory Usage", "ram_mb", False, "MB"), ("Power Usage", "power_w", False, "W")]
    table, norm = [], []
    for label, k, hi, unit in spec:
        x, y = ea[k], eb[k]
        sa = 100 * x / max(x, y) if hi else 100 * min(x, y) / x
        sb = 100 * y / max(x, y) if hi else 100 * min(x, y) / y
        table.append(dict(metric=label, a=x, b=y, unit=unit, winner=a["name"] if sa > sb else b["name"] if sb > sa else "Tie"))
        norm.append(dict(metric=label, a=r(sa, 0), b=r(sb, 0)))
    oa, ob = r(sum(n["a"] for n in norm) / 5, 1), r(sum(n["b"] for n in norm) / 5, 1)
    ranking = sorted([dict(name=a["name"], score=oa), dict(name=b["name"], score=ob)], key=lambda x: -x["score"])
    for i, x in enumerate(ranking): x["rank"] = i + 1
    return dict(device=dname, a=dict(name=a["name"], **ea), b=dict(name=b["name"], **eb), table=table, normalized=norm,
                scores=dict(a=oa, b=ob), ranking=ranking, winner=ranking[0]["name"],
                note="Accuracy figures use each model's own task metric (top-1, mAP, GLUE) and are only comparable within the same task.")
