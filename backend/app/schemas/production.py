from typing import Optional, List
from pydantic import BaseModel

class ProductionOut(BaseModel):
    id: int
    crop_id: int
    crop_name: str
    country: str
    region: str
    district: Optional[str] = None
    year: int
    season: str
    cultivated_area: float
    production: float
    yield_per_ha: float

    class Config:
        from_attributes = True

class ProductionTrendsResponse(BaseModel):
    crop_name: str
    region: Optional[str] = None
    historical_series: List[dict]
    total_area_latest: float
    total_production_latest: float
    avg_yield_latest: float
    growth_rate_pct: float
    data_source: str
    source_url: str

class RegionalYieldSummary(BaseModel):
    region: str
    cultivated_area: float
    production: float
    yield_per_ha: float
    rank: int
