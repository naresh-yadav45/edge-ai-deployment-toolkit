# Edge AI Deployment Toolkit

> **Analyze, optimize, simulate, and plan AI model deployment on edge devices.**

<p align="center">
  <a href="https://frontend-nine-eosin-pkny6pdtel.vercel.app/"><strong>Live Website</strong></a>
  ·
  <a href="https://edge-ai-backend-3.onrender.com"><strong>Live API</strong></a>
  ·
  <a href="https://edge-ai-backend-3.onrender.com/docs"><strong>API Documentation</strong></a>
</p>

## Overview

Edge AI Deployment Toolkit is a full-stack web application designed to help students, researchers, AI engineers, and embedded developers evaluate whether an AI model may be suitable for edge hardware before deploying it to a physical device.

The toolkit provides analytical estimates for latency, memory use, power, thermal behaviour, and energy. It also compares optimization approaches, benchmarks models, recommends deployment options, and exports reports. These results are planning estimates and should be validated on real hardware.

## Live deployment

- **Frontend:** https://frontend-nine-eosin-pkny6pdtel.vercel.app/
- **Backend API:** https://edge-ai-backend-3.onrender.com
- **API docs:** https://edge-ai-backend-3.onrender.com/docs (when enabled by the backend deployment)

The frontend uses the `VITE_API_URL` environment variable to select the backend. The production value is:

```env
VITE_API_URL=https://edge-ai-backend-3.onrender.com
```

Set this value in the frontend hosting provider and rebuild/redeploy after changing it. The backend must allow requests from the deployed frontend domain through its CORS configuration.

## Features

- **Dashboard:** KPI cards, charts, insights, and recent activity.
- **Model Analyzer:** estimates for supported models, custom model inputs, and readiness scoring.
- **Device Simulator:** estimates RAM, CPU/GPU performance, energy, latency, and thermal behaviour across device targets.
- **Optimization Lab:** compare quantization, pruning, distillation, compression, and conversion strategies.
- **Energy Predictor:** estimates energy use, cost, and carbon impact.
- **Recommendation Engine:** suggests a device and optimization approach based on selected priorities.
- **Benchmark Center:** compare model pairs across performance metrics.
- **Research Hub:** learning topics, paper collection, and research resources.
- **Reports:** export PDF and CSV reports.
- **Authentication:** registration, login, password reset flow, profile, and saved history.

## Technology stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide, Axios
- **Backend:** FastAPI, Python, SQLite, ReportLab
- **Deployment:** Vercel for the frontend, Render for the backend; Docker configuration is also included

## Run locally for development

### Frontend

Requirements: Node.js 18 or newer.

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend folder and set the API URL you want to use. For the deployed backend, use:

```env
VITE_API_URL=https://edge-ai-backend-3.onrender.com
```

Start the Vite development server:

```bash
npm run dev
```

### Backend

Requirements: Python 3.10 or newer.

```bash
cd backend
python -m venv .venv
```

Activate the environment, then install dependencies and start FastAPI:

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS/Linux
source .venv/bin/activate

python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Tests

```bash
cd backend
python -m pytest -q tests_smoke.py
```

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/analyze-model` | Model metrics, memory, latency, and readiness estimates |
| POST | `/simulate-device` | Device performance and resource estimates |
| POST | `/optimize-model` | Before/after optimization estimates |
| POST | `/predict-energy` | Energy, cost, and carbon estimates |
| POST | `/benchmark` | Two-model comparison |
| POST | `/recommend-device` | Device and optimization recommendation |
| POST | `/generate-report` | PDF or CSV report generation |
| GET | `/history` | Saved activity and dashboard summary |
| GET | `/research-content` | Research topics and learning content |
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Authenticate a user |
| POST | `/auth/forgot-password` | Start password-reset flow |
| POST | `/auth/reset-password` | Complete password-reset flow |
| GET | `/auth/me` | Current authenticated user (Bearer token) |

Authenticated endpoints use `Authorization: Bearer <token>`. Custom model inputs may use a payload such as:

```json
{
  "model": "Custom Model",
  "params_m": 10,
  "gflops": 5,
  "accuracy": 75
}
```

## Configuration and deployment notes

- Configure `VITE_API_URL` in the frontend hosting provider. Vite variables are embedded during the build, so redeploy after changing them.
- Configure backend `CORS_ORIGINS` to include the exact deployed frontend origin.
- Set a strong `SECRET_KEY` for production and keep secrets out of source control.
- Use HTTPS for public services.
- The password-reset flow currently returns a reset token in its response for demo purposes. Connect a real email service before production use.
- Estimates are analytical approximations based on model specifications and typical device throughput. Calibrate the backend engine with measurements from target hardware before making deployment decisions.

## Roadmap

- Dark/light appearance toggle
- AI assistant/chatbot
- ONNX/TFLite upload with real profiling
- Project sharing
- Live device benchmarks and MLPerf Tiny integration

## Author

<div align="center">

### Naresh Yadav
**B.Tech Student · Electronic Instrumentation and Control (EIC)**

*Building at the intersection of AI, edge computing, and thoughtful web experiences.*

`AI & Edge Computing` · `Frontend Development` · `UI/UX Design` · `Cybersecurity` · `C++ & DSA`

</div>

I enjoy learning through hands-on projects and turning technical ideas into usable applications. This toolkit reflects my interest in edge AI, practical engineering, and clean user interfaces.

---

<p align="center"><sub>Built as a learning and engineering project. Validate all model and device estimates on real hardware before production deployment.</sub></p>
