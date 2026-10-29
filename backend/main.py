import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from api.routes import router
from database import db, seed

@asynccontextmanager
async def lifespan(app):
    db.init(); seed.run()
    yield

app = FastAPI(title="Edge AI Deployment Toolkit API", version="1.0.0",
              description="Analyze, optimize, simulate and deploy AI models on edge devices.", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=os.getenv("CORS_ORIGINS", "*").split(","), allow_methods=["*"],
                   allow_headers=["*"], expose_headers=["Content-Disposition"])

@app.exception_handler(ValueError)
async def value_error(_: Request, exc: ValueError):
    return JSONResponse(status_code=400, content={"detail": str(exc)})

@app.get("/", tags=["meta"])
def root():
    return {"name": "Edge AI Deployment Toolkit", "docs": "/docs"}

@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok"}

app.include_router(router)
