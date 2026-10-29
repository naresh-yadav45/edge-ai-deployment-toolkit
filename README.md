# Edge AI Deployment Toolkit

> Analyze, Optimize, Simulate and Deploy AI Models Efficiently on Edge Devices.

## Project Overview
A full-stack SaaS-style platform that helps AI engineers, ECE students, researchers and embedded developers judge whether a model can run on edge hardware (Raspberry Pi 4/5, Jetson Nano/Xavier, Android, ESP32, STM32). It estimates latency, memory, power, thermal behaviour and energy, compares optimization techniques, benchmarks models, recommends a deployment and exports PDF/CSV reports.

## Problem Statement
Choosing hardware and optimization for an edge model usually means trial and error on physical boards. This toolkit gives a fast, explainable first estimate so you can shortlist options before buying or flashing hardware.

## Features
- **Dashboard**: KPI cards with sparklines, bar/area/line/pie/radar charts, insights and recent activity
- **Model Analyzer**: MobileNetV2, YOLOv8, ResNet50, EfficientNet, BERT, DistilBERT, Custom Model; readiness score; PDF report
- **Device Simulator**: RAM, CPU, GPU, energy, latency and thermal estimates with cross-device charts
- **Optimization Lab**: quantization, pruning, distillation, weight compression, conversion; before/after and score
- **Energy Predictor**: energy, cost, CO2, sustainability score
- **Recommendation Engine**: best device + method by priority, reasoning, alternatives, **cost calculator**
- **Benchmark Center**: MobileNetV2 vs YOLOv8, ResNet50 vs EfficientNet, BERT vs DistilBERT, rankings
- **Research Hub**: 9 topics (incl. IBM analog acceleration), paper collection, learning center
- **Reports**: PDF and CSV exports
- **Auth**: register, login, forgot/reset password, profile, saved analyses/reports, history

Not included yet (see roadmap): dark mode toggle, AI chatbot, project sharing.

## Screenshots
Add your screenshots to `docs/screenshots/` and link them here.

## Architecture
See [docs/architecture.md](docs/architecture.md) for the diagram.

## Installation Guide
**Backend** (Python 3.10+)
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API docs: http://localhost:8000/docs. The SQLite DB is created and seeded with demo data on first start.

**Frontend** (Node 18+)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev        # http://localhost:5173
```

**Tests**: `cd backend && python -m pytest -q tests_smoke.py`

## API Documentation
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/analyze-model` | params, FLOPs, size, memory, latency, readiness |
| POST | `/simulate-device` | RAM/CPU/GPU/energy/latency/thermal + all-device comparison |
| POST | `/optimize-model` | before/after metrics, gains, score |
| POST | `/predict-energy` | kWh, cost, CO2, sustainability |
| POST | `/benchmark` | two-model comparison and ranking |
| POST | `/recommend-device` | best device + strategy + cost estimate |
| POST | `/generate-report` | PDF or CSV file |
| GET | `/history` | saved activity and dashboard summary |
| GET | `/research-content` | topics, papers, learning cards |
| POST | `/auth/register`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password` | accounts |
| GET | `/auth/me` | current user (Bearer token) |

Results are saved to the database only for signed-in users (send `Authorization: Bearer <token>`). Custom models: `{"model":"Custom Model","params_m":10,"gflops":5,"accuracy":75}`.

## Technology Stack
React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide, Axios, FastAPI, SQLite, ReportLab, Docker.

## Deployment Instructions
```bash
SECRET_KEY=$(openssl rand -hex 32) docker compose up --build
```
Frontend: http://localhost:3000, API: http://localhost:8000. For production set `SECRET_KEY`, `CORS_ORIGINS`, build the frontend with your public `VITE_API_URL`, and put both behind HTTPS.
Note: forgot-password returns the reset token in the response (demo mode). Wire it to an email service before going live.

## Accuracy of estimates
Outputs come from an analytical model built on published model specs and typical device throughput. Treat them as planning estimates and calibrate `backend/services/engine.py` with measurements from your own hardware.

## Future Roadmap
Dark/light toggle, AI assistant chatbot, ONNX/TFLite upload with real profiling, project sharing, live device benchmarks, MLPerf Tiny integration.

## Author
**Naresh Yadav**
Electronic Instrumentation and control Engineer (EIC) Student
AI • Edge Computing • Web Development • UI & UX designer • Cyber Security
