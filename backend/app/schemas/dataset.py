from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel

class DatasetOut(BaseModel):
    id: int
    name: str
    source: str
    source_url: str
    description: str
    date_range: str
    country_region: str
    units: str
    data_fields: str
    record_count: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class DataQualityMetric(BaseModel):
    dataset_name: str
    source: str
    source_url: str
    total_records: int
    total_columns: int
    missing_values_count: int
    missing_pct: float
    duplicate_rows_count: int
    detected_outliers_count: int
    date_range: str
    geographic_coverage: str
    last_updated: str
    quality_status: str  # "EXCELLENT", "GOOD", "WARNING"

class DataQualityReport(BaseModel):
    overall_health: str
    total_datasets: int
    total_records_ingested: int
    datasets: List[DataQualityMetric]
