# Architecture

```mermaid
flowchart LR
  UI[React + TS + Tailwind<br/>Recharts · Framer Motion] -->|Axios / JSON| API[FastAPI]
  API --> ENG[Engine<br/>analyze · simulate · optimize<br/>energy · recommend · benchmark]
  API --> REP[Report service<br/>ReportLab PDF · CSV]
  API --> AUTH[Auth<br/>PBKDF2 + signed tokens]
  ENG --> DB[(SQLite)]
  AUTH --> DB
  REP --> DB
```

**Engine model.** Latency = GFLOPs / sustained device GFLOPs (+ fixed overhead). Memory = 1.3 x model size + activation estimate.
Optimization methods apply multiplicative factors to size, latency, memory and power and subtract an accuracy penalty.
All numbers are first-order estimates; edit `backend/services/engine.py` (`MODELS`, `DEVICES`, `OPT`) to calibrate with your own measurements.
