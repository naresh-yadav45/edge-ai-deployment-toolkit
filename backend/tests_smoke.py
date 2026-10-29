import os, tempfile
os.environ["DB_PATH"] = os.path.join(tempfile.mkdtemp(), "t.db")
from fastapi.testclient import TestClient
from main import app

def test_all():
    with TestClient(app) as c:
        assert c.post("/analyze-model", json={"model": "MobileNetV2"}).json()["readiness"] > 0
        assert c.post("/simulate-device", json={"model": "ResNet50", "device": "Jetson Nano", "method": "Quantization"}).status_code == 200
        assert c.post("/optimize-model", json={"model": "BERT", "method": "Pruning"}).json()["score"] >= 0
        assert c.post("/predict-energy", json={"model": "YOLOv8", "epochs": 5}).json()["energy_kwh"] > 0
        assert c.post("/benchmark", json={"model": "BERT", "compare_with": "DistilBERT"}).json()["winner"]
        assert c.post("/recommend-device", json={"model": "MobileNetV2"}).json()["feasible"]
        assert c.post("/analyze-model", json={"model": "Nope"}).status_code == 400
        assert c.post("/analyze-model", json={"model": "Custom Model", "params_m": 2, "gflops": 1}).status_code == 200
        for t in ("deployment", "optimization", "benchmark"):
            for f in ("pdf", "csv"):
                assert c.post("/generate-report", json={"report_type": t, "format": f}).status_code == 200
        assert len(c.get("/research-content").json()["topics"]) == 9
        h = c.get("/history").json(); assert h["summary"]["models_analyzed"] >= 5
        tok = c.post("/auth/register", json={"name": "Test", "email": "a@b.co", "password": "secret1"}).json()["token"]
        H = {"Authorization": f"Bearer {tok}"}
        assert c.get("/auth/me", headers=H).json()["email"] == "a@b.co"
        r = c.post("/analyze-model", json={"model": "ResNet50"}, headers=H).json(); assert r["saved"]
        assert c.post("/auth/login", json={"email": "a@b.co", "password": "secret1"}).status_code == 200
        rt = c.post("/auth/forgot-password", json={"email": "a@b.co"}).json()["reset_token"]
        assert c.post("/auth/reset-password", json={"token": rt, "password": "newpass1"}).status_code == 200
