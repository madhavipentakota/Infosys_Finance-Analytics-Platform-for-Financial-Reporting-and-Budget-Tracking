from typing import Optional
from pydantic import BaseModel

class SeedParameterOut(BaseModel):
    id: int
    crop_id: int
    recommended_seed_rate_kg_ha: float
    min_seed_rate_kg_ha: Optional[float] = None
    max_seed_rate_kg_ha: Optional[float] = None
    sowing_spacing: Optional[str] = None
    source: str
    source_url: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class OilParameterOut(BaseModel):
    id: int
    crop_id: int
    typical_oil_content_pct: float
    extraction_rate_pct: float
    cake_meal_yield_pct: float
    extraction_method: str
    primary_fatty_acids: Optional[str] = None
    source: str
    source_url: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class CropOut(BaseModel):
    id: int
    crop_name: str
    botanical_name: Optional[str] = None
    category: str
    description: Optional[str] = None
    standard_unit: str
    seed_parameters: Optional[SeedParameterOut] = None
    oil_parameters: Optional[OilParameterOut] = None

    class Config:
        from_attributes = True
