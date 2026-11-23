from typing import Optional, List
from pydantic import BaseModel

class CostOut(BaseModel):
    id: int
    crop_id: int
    crop_name: str
    region: str
    year: int
    seed_cost_ha: float
    fertilizer_cost_ha: float
    pesticide_cost_ha: float
    labor_cost_ha: float
    irrigation_cost_ha: float
    machinery_cost_ha: float
    land_prep_cost_ha: float
    harvesting_cost_ha: float
    processing_transport_ha: float
    other_operational_cost_ha: float
    total_cost_ha: float
    cost_per_quintal: Optional[float] = None

    class Config:
        from_attributes = True

class CostBreakdownItem(BaseModel):
    category: str
    amount_ha: float
    percentage: float

class CostSummaryResponse(BaseModel):
    crop_name: str
    region: str
    year: int
    total_cost_ha: float
    cost_per_quintal: Optional[float] = None
    cost_per_kg: float
    breakdown: List[CostBreakdownItem]
    historical_trend: List[dict]
    data_source: str
    source_url: str
