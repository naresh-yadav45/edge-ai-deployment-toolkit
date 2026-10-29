from typing import Optional
from pydantic import BaseModel, Field

class Base(BaseModel):
    model: str = "MobileNetV2"
    params_m: Optional[float] = Field(None, gt=0)
    gflops: Optional[float] = Field(None, gt=0)
    accuracy: Optional[float] = Field(None, ge=0, le=100)

class AnalyzeIn(Base):
    reference_device: str = "Raspberry Pi 5"

class SimulateIn(Base):
    device: str = "Raspberry Pi 5"
    method: Optional[str] = None

class OptimizeIn(Base):
    method: str = "Quantization"
    device: str = "Raspberry Pi 5"

class EnergyIn(Base):
    device: str = "Jetson Nano"
    epochs: int = Field(10, ge=1, le=1000)
    batch_size: int = Field(32, ge=1, le=4096)
    dataset_size: int = Field(50000, ge=1)
    price_per_kwh: float = Field(0.12, ge=0)

class RecommendIn(Base):
    device: Optional[str] = None
    method: Optional[str] = None
    priority: str = "balanced"
    units: int = Field(1, ge=1)
    hours_per_day: float = Field(24, gt=0, le=24)

class BenchmarkIn(Base):
    compare_with: str = "YOLOv8"
    device: str = "Raspberry Pi 5"

class ReportIn(Base):
    report_type: str = "deployment"   # deployment | optimization | benchmark
    format: str = "pdf"               # pdf | csv
    compare_with: str = "YOLOv8"
    device: str = "Raspberry Pi 5"
    method: Optional[str] = "Quantization"

class RegisterIn(BaseModel):
    name: str = Field(min_length=2)
    email: str
    password: str = Field(min_length=6)

class LoginIn(BaseModel):
    email: str
    password: str

class ForgotIn(BaseModel):
    email: str

class ResetIn(BaseModel):
    token: str
    password: str = Field(min_length=6)
