from typing import Optional, List
from pydantic import BaseModel

class MarketPriceOut(BaseModel):
    id: int
    crop_id: int
    crop_name: str
    region: str
    year: int
    msp_price_quintal: Optional[float] = None
    wholesale_avg_price_quintal: float
    min_price_quintal: Optional[float] = None
    max_price_quintal: Optional[float] = None
    price_per_kg: float
    unit: str

    class Config:
        from_attributes = True

class PriceTrendResponse(BaseModel):
    crop_name: str
    region: Optional[str] = None
    historical_series: List[dict]
    latest_msp: Optional[float] = None
    latest_wholesale: float
    latest_price_per_kg: float
    price_volatility_pct: float
    data_source: str
    source_url: str
