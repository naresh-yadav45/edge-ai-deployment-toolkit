"""Seeds demo records (user_id NULL) so the dashboard is populated on first run."""
import random
from datetime import datetime, timedelta
from database import db
from services import engine as E

def run():
    if db.count("Analyses") > 0:
        return
    rnd = random.Random(7)
    ts = lambda: (datetime.utcnow() - timedelta(days=rnd.uniform(0, 6.8))).strftime("%Y-%m-%d %H:%M:%S")
    names = ["MobileNetV2", "YOLOv8", "ResNet50", "EfficientNet", "BERT"]
    devs = ["Raspberry Pi 4", "Raspberry Pi 5", "Jetson Nano", "Jetson Xavier", "Android Smartphone"]
    for n in names:
        m = E.get_model(n)
        db.save("Analyses", None, "model", n, {"model": n}, E.analyze(m), ts())
    for _ in range(18):
        n, d = rnd.choice(names), rnd.choice(devs)
        meth = rnd.choice([None, "Quantization", "Pruning"])
        db.save("DeviceSimulations", None, "simulation", f"{n} on {d}", {"model": n, "device": d, "method": meth}, E.simulate(E.get_model(n), d, meth), ts())
    for n in names[:4]:
        meth = rnd.choice(list(E.OPT))
        db.save("OptimizationHistory", None, "optimization", f"{n} · {meth}", {"model": n, "method": meth}, E.optimize(E.get_model(n), meth, "Raspberry Pi 5"), ts())
    for n in names[:3]:
        db.save("Analyses", None, "energy", f"{n} energy", {"model": n}, E.predict_energy(E.get_model(n), "Jetson Nano", 10, 32), ts())
    for a, b in [("MobileNetV2", "YOLOv8"), ("ResNet50", "EfficientNet"), ("BERT", "DistilBERT")]:
        db.save("Benchmarks", None, "benchmark", f"{a} vs {b}", {"model": a, "compare_with": b}, E.benchmark(E.get_model(a), E.get_model(b), "Raspberry Pi 5"), ts())
