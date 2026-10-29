from collections import Counter, defaultdict
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.responses import FileResponse
from database import db
from schemas import schemas as S
from services import engine as E, auth, reports
from utils.helpers import mean, half_delta
from utils.research_content import TOPICS, PAPERS, LEARNING

router = APIRouter()

def optional_user(authorization: Optional[str] = Header(None)):
    if authorization and authorization.lower().startswith("bearer "):
        return auth.read_token(authorization[7:])
    return None

def required_user(uid=Depends(optional_user)):
    if not uid or not db.user_by_id(uid):
        raise HTTPException(401, "Please sign in")
    return uid

def _persist(table, uid, kind, label, inp, res):
    res = dict(res)
    res["saved"] = bool(uid)
    if uid:
        res["record_id"] = db.save(table, uid, kind, label, inp, res)
    return res

def _model(b): return E.get_model(b.model, b.params_m, b.gflops, b.accuracy)

# ---------------- auth ----------------
def _public(u): return dict(id=u["id"], name=u["name"], email=u["email"], created_at=u["created_at"])

@router.post("/auth/register", tags=["auth"])
def register(b: S.RegisterIn):
    if "@" not in b.email: raise HTTPException(422, "Enter a valid email address")
    if db.user_by_email(b.email): raise HTTPException(409, "An account with this email already exists")
    h, salt = auth.hash_pw(b.password)
    uid = db.create_user(b.email, b.name, h, salt)
    return dict(token=auth.make_token(uid), user=_public(db.user_by_id(uid)))

@router.post("/auth/login", tags=["auth"])
def login(b: S.LoginIn):
    u = db.user_by_email(b.email)
    if not u or not auth.verify_pw(b.password, u["password_hash"], u["salt"]): raise HTTPException(401, "Incorrect email or password")
    return dict(token=auth.make_token(u["id"]), user=_public(u))

@router.post("/auth/forgot-password", tags=["auth"])
def forgot(b: S.ForgotIn):
    u = db.user_by_email(b.email)
    out = dict(message="If that email exists, a reset token has been generated.")
    # Demo mode: no mail server, so the token is returned. Replace with an email in production.
    if u: out["reset_token"] = auth.make_token(u["id"], "reset", 3600)
    return out

@router.post("/auth/reset-password", tags=["auth"])
def reset(b: S.ResetIn):
    uid = auth.read_token(b.token, "reset")
    if not uid: raise HTTPException(400, "Reset token is invalid or expired")
    h, salt = auth.hash_pw(b.password); db.set_password(uid, h, salt)
    return dict(message="Password updated. You can sign in now.")

@router.get("/auth/me", tags=["auth"])
def me(uid=Depends(required_user)):
    return _public(db.user_by_id(uid))

# ---------------- core endpoints ----------------
@router.post("/analyze-model", tags=["analysis"])
def analyze_model(b: S.AnalyzeIn, uid=Depends(optional_user)):
    res = E.analyze(_model(b), E.dev(b.reference_device))
    return _persist("Analyses", uid, "model", b.model, b.model_dump(), res)

@router.post("/simulate-device", tags=["analysis"])
def simulate_device(b: S.SimulateIn, uid=Depends(optional_user)):
    res = E.simulate(_model(b), E.dev(b.device), E.norm_method(b.method))
    return _persist("DeviceSimulations", uid, "simulation", f"{b.model} on {b.device}", b.model_dump(), res)

@router.post("/optimize-model", tags=["analysis"])
def optimize_model(b: S.OptimizeIn, uid=Depends(optional_user)):
    res = E.optimize(_model(b), b.method, E.dev(b.device))
    return _persist("OptimizationHistory", uid, "optimization", f"{b.model} · {b.method}", b.model_dump(), res)

@router.post("/predict-energy", tags=["analysis"])
def predict_energy(b: S.EnergyIn, uid=Depends(optional_user)):
    res = E.predict_energy(_model(b), b.device, b.epochs, b.batch_size, b.dataset_size, b.price_per_kwh)
    return _persist("Analyses", uid, "energy", f"{b.model} energy", b.model_dump(), res)

@router.post("/benchmark", tags=["analysis"])
def benchmark(b: S.BenchmarkIn, uid=Depends(optional_user)):
    res = E.benchmark(_model(b), E.get_model(b.compare_with), E.dev(b.device))
    return _persist("Benchmarks", uid, "benchmark", f"{b.model} vs {b.compare_with}", b.model_dump(), res)

@router.post("/recommend-device", tags=["analysis"])
def recommend_device(b: S.RecommendIn, uid=Depends(optional_user)):
    res = E.recommend(_model(b), b.device, b.method, b.priority, b.units, b.hours_per_day)
    return _persist("Analyses", uid, "recommendation", f"{b.model} recommendation", b.model_dump(), res)

@router.post("/generate-report", tags=["reports"])
def generate_report(b: S.ReportIn, uid=Depends(optional_user)):
    path, name, c = reports.generate(b.report_type, b.format, _model(b), E.get_model(b.compare_with), E.dev(b.device), E.norm_method(b.method))
    if uid: db.save("Reports", uid, b.report_type, c["title"], b.model_dump(), dict(file=name, format=b.format, summary=c["summary"]))
    return FileResponse(path, filename=name, media_type="application/pdf" if b.format == "pdf" else "text/csv")

@router.get("/research-content", tags=["research"])
def research_content():
    return dict(topics=TOPICS, papers=PAPERS, learning=LEARNING)

@router.get("/catalog", tags=["research"])
def catalog():
    return dict(models=list(E.MODELS) + ["Custom Model"], devices=list(E.DEVICES), methods=list(E.OPT))

# ---------------- history & dashboard summary ----------------
TYPE_NAMES = dict(Analyses="Analysis", DeviceSimulations="Simulation", OptimizationHistory="Optimization", Benchmarks="Benchmark", Reports="Report")

@router.get("/history", tags=["history"])
def history(uid=Depends(optional_user)):
    data = {t: db.rows(t, uid) for t in TYPE_NAMES}
    items = sorted([dict(id=r["id"], type=TYPE_NAMES[t], kind=r["kind"], label=r["label"], created_at=r["created_at"], mine=r["user_id"] is not None)
                    for t, rs in data.items() for r in rs], key=lambda x: x["created_at"], reverse=True)
    chrono = lambda rs: list(reversed(rs))
    models = [r for r in chrono(data["Analyses"]) if r["kind"] == "model"]
    sims = [r["result"]["selected"] for r in chrono(data["DeviceSimulations"]) if r["result"]["selected"]["fits"]]
    ready = [r["result"]["readiness"] for r in models]; lats = [s["latency_ms"] for s in sims]; pw = [s["power_w"] for s in sims]
    today = datetime.utcnow().date(); days = [(today - timedelta(days=i)) for i in range(6, -1, -1)]
    cnt = Counter(x["created_at"][:10] for x in items)
    activity = [dict(day=d.strftime("%d %b"), runs=cnt.get(d.isoformat(), 0)) for d in days]
    by_dev = defaultdict(list)
    for s in sims: by_dev[s["device"]].append(s)
    lat_dev = [dict(name=k, latency=round(mean(x["latency_ms"] for x in v), 1), energy=round(mean(x["energy_mj"] for x in v), 1)) for k, v in by_dev.items()]
    radar = defaultdict(list)
    for r in models:
        for p in r["result"]["radar"]: radar[p["metric"]].append(p["score"])
    runs = [a["runs"] for a in activity]
    insights, recs = [], ["Quantize CNNs to INT8 first: typically the largest latency and power win for the smallest accuracy cost.",
                          "Keep peak RAM below 80% of device memory to avoid swapping and throttling.",
                          "Validate accuracy on-device after conversion, since runtimes can differ from your training framework."]
    if lat_dev:
        f = min(lat_dev, key=lambda x: x["latency"]); e = min(lat_dev, key=lambda x: x["energy"])
        insights += [f"{f['name']} has the lowest average latency ({f['latency']} ms).", f"{e['name']} is the most energy-efficient ({e['energy']} mJ per inference)."]
    if ready: insights.append(f"Average deployment readiness across {len(ready)} analysed models is {round(mean(ready))}%.")
    summary = dict(models_analyzed=len(models), simulations=len(data["DeviceSimulations"]), avg_latency=round(mean(lats), 1), avg_power=round(mean(pw), 2),
                   success_score=round(mean(ready), 1),
                   deltas=dict(models=half_delta(runs), sims=half_delta(runs), latency=half_delta(lats), power=half_delta(pw), success=half_delta(ready)),
                   sparks=dict(models=ready, sims=lats, latency=lats, power=pw, success=ready),
                   latency_by_device=lat_dev, activity=activity, power_trend=[dict(name=str(i + 1), power=p) for i, p in enumerate(pw[-10:])],
                   model_mix=[dict(name=k, value=v) for k, v in Counter(r["label"] for r in models).items()],
                   radar=[dict(metric=k, score=round(mean(v))) for k, v in radar.items()], insights=insights, recommendations=recs)
    return dict(items=items[:100], summary=summary)
