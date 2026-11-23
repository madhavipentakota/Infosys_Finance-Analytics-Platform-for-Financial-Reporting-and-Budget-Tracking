from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# 1. Land & Seed Calculator
class SeedCalculationRequest(BaseModel):
    crop_name: str
    land_area: float = Field(..., gt=0, description="Land area in selected unit")
    unit: str = Field(default="hectare", description="hectare, acre, bigha, guntha, cent, sq_m, sq_ft, or percentage")
    farm_total_area: Optional[float] = Field(default=None, description="Total farm area when unit is percentage")
    farm_total_unit: Optional[str] = Field(default="hectare", description="Unit of total farm land")
    region: Optional[str] = None

class SeedCalculationResponse(BaseModel):
    crop_name: str
    region: Optional[str] = None
    input_area: float
    input_unit: str
    standard_area_ha: float
    seed_rate_kg_ha: Optional[float] = None
    total_seed_required_kg: Optional[float] = None
    historical_avg_yield_t_ha: Optional[float] = None
    expected_production_tonnes: Optional[float] = None
    
    # Extended percentage and multi-unit metrics
    seed_to_harvest_pct: Optional[float] = None
    seed_multiplication_factor: Optional[float] = None
    farm_land_share_pct: Optional[float] = None
    yield_benchmark_pct: Optional[float] = None
    unit_conversions: Optional[Dict[str, Any]] = None

    data_status: str  # "AVAILABLE" or "UNAVAILABLE"
    data_source: str
    source_url: Optional[str] = None
    notes: Optional[str] = None

# 2. Oil Production Calculator
class OilCalculationRequest(BaseModel):
    crop_name: str
    land_area: float = Field(..., gt=0)
    land_unit: str = "hectare"
    production_tonnes: Optional[float] = None  # If not provided, estimated from historical yield
    custom_extraction_rate: Optional[float] = None  # User assumption if overridden

class OilCalculationResponse(BaseModel):
    crop_name: str
    land_area_ha: float
    crop_production_tonnes: float
    extraction_rate_pct: float
    is_custom_assumption: bool
    estimated_oil_tonnes: float
    estimated_oil_litres: float
    estimated_oil_kg_per_ha: float
    estimated_cake_meal_tonnes: float
    extraction_method: str
    data_source: str
    source_url: Optional[str] = None
    notes: Optional[str] = None

# 3. Comprehensive Profitability Calculation
class ProfitabilityRequest(BaseModel):
    crop_name: str
    region: str
    year: Optional[int] = None
    land_area: float = Field(..., gt=0)
    land_unit: str = "hectare"
    custom_yield_t_ha: Optional[float] = None
    custom_price_per_kg: Optional[float] = None
    custom_cost_per_ha: Optional[float] = None

class ProfitabilityResponse(BaseModel):
    crop_name: str
    region: str
    year: int
    land_area_ha: float
    
    # Agronomic metrics
    yield_t_ha: float
    is_yield_assumed: bool
    crop_production_tonnes: float
    seed_required_kg: Optional[float] = None
    estimated_oil_tonnes: float
    
    # Financial metrics
    cost_per_ha: float
    total_cost: float
    is_cost_assumed: bool
    
    market_price_per_kg: float
    market_price_per_quintal: float
    is_price_assumed: bool
    
    gross_revenue: float
    net_profit: float
    roi_percentage: float
    
    profit_per_ha: float
    profit_per_kg: float
    cost_per_kg: float
    break_even_price_per_kg: float
    break_even_production_tonnes: float
    
    # Transparency Metadata
    data_sources: Dict[str, str]

# 4. Break-Even Analysis
class BreakEvenResponse(BaseModel):
    crop_name: str
    region: str
    total_cost: float
    crop_production_tonnes: float
    market_price_per_kg: float
    break_even_price_per_kg: float
    break_even_price_per_quintal: float
    break_even_production_tonnes: float
    break_even_revenue: float
    current_revenue: float
    margin_of_safety_pct: float
    chart_points: List[dict]

# 5. Sensitivity & Risk Analysis
class SensitivityRequest(BaseModel):
    crop_name: str
    region: str
    land_area: float = 10.0
    price_change_pcts: List[float] = [-20.0, -10.0, -5.0, 0.0, 5.0, 10.0, 20.0]
    yield_change_pcts: List[float] = [-20.0, -10.0, 0.0, 10.0, 20.0]
    cost_change_pcts: List[float] = [-10.0, 0.0, 10.0, 20.0]

class SensitivityResponse(BaseModel):
    crop_name: str
    region: str
    base_case: dict
    price_sensitivity: List[dict]
    yield_sensitivity: List[dict]
    cost_sensitivity: List[dict]
    tornado_factors: List[dict]

# 6. Crop Comparison
class CropComparisonItem(BaseModel):
    crop_name: str
    category: str
    avg_yield_t_ha: float
    oil_extraction_pct: float
    cost_per_ha: float
    price_per_kg: float
    revenue_per_ha: float
    profit_per_ha: float
    roi_percentage: float
    seed_rate_kg_ha: Optional[float] = None
    data_availability: str

class CropComparisonResponse(BaseModel):
    selected_region: str
    year: int
    crops: List[CropComparisonItem]
    top_by_roi: Optional[str] = None
    top_by_profit: Optional[str] = None
    top_by_oil: Optional[str] = None

# 7. Scenario Persistence
class ScenarioCreate(BaseModel):
    name: str
    crop_name: str
    region: str
    year: int
    land_area: float
    land_unit: str = "hectare"
    notes: Optional[str] = None

class ScenarioOut(BaseModel):
    id: int
    user_id: int
    name: str
    crop_id: int
    crop_name: str
    region: str
    year: int
    land_area: float
    land_unit: str
    calculated_yield: float
    expected_production: float
    seed_required: float
    estimated_oil: float
    total_cost: float
    expected_revenue: float
    net_profit: float
    roi_percentage: float
    break_even_price: float
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
