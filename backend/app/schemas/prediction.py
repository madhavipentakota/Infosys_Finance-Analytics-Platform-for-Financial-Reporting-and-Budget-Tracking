from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class YieldPredictionRequest(BaseModel):
    crop_name: str
    region: str
    cultivated_area: float = Field(..., gt=0)
    rainfall_mm: Optional[float] = None
    temperature_c: Optional[float] = None
    irrigation_coverage_pct: Optional[float] = None
    year: int = 2025

class YieldPredictionResponse(BaseModel):
    crop_name: str
    region: str
    model_name: str
    predicted_yield_t_ha: float
    predicted_total_production_tonnes: float
    confidence_interval_lower: float
    confidence_interval_upper: float
    model_metrics: Dict[str, float]  # MAE, RMSE, R2
    feature_importance: List[Dict[str, Any]]
    historical_benchmark_yield: float
    yield_delta_pct: float
    is_sufficient_data: bool
    status_message: str

class PricePredictionRequest(BaseModel):
    crop_name: str
    region: str
    target_year: int = Field(default=2025, ge=2024, le=2030)
    inflation_assumption_pct: Optional[float] = 5.0

class PricePredictionResponse(BaseModel):
    crop_name: str
    region: str
    model_name: str
    target_year: int
    predicted_wholesale_price_quintal: float
    predicted_price_per_kg: float
    prediction_interval_low: float
    prediction_interval_high: float
    historical_trend: List[dict]
    model_metrics: Dict[str, float]
    disclaimer: str

class ModelPerformanceResponse(BaseModel):
    models: List[Dict[str, object]]
    total_training_records: int
    last_trained: str
