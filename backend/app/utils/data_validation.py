"""
Data validation and data quality auditing tools for OilCrop Intelligence.
Evaluates dataset completeness, duplicates, and statistical outliers using IQR.
"""

from typing import Dict, Any, List
import pandas as pd
import numpy as np

def detect_outliers_iqr(series: pd.Series) -> int:
    """Calculates number of outliers via Interquartile Range (IQR = Q3 - Q1)."""
    cleaned = series.dropna()
    if len(cleaned) < 4:
        return 0
    q25, q75 = np.percentile(cleaned, 25), np.percentile(cleaned, 75)
    iqr = q75 - q25
    if iqr == 0:
        return 0
    lower_bound = q25 - (1.5 * iqr)
    upper_bound = q75 + (1.5 * iqr)
    return int(((cleaned < lower_bound) | (cleaned > upper_bound)).sum())

def audit_dataframe(df: pd.DataFrame, dataset_name: str, source: str, source_url: str) -> Dict[str, Any]:
    """Generates complete data quality metrics for a DataFrame."""
    total_records = len(df)
    total_columns = len(df.columns)
    
    missing_cells = int(df.isna().sum().sum())
    total_cells = total_records * total_columns if total_records > 0 else 1
    missing_pct = round((missing_cells / total_cells) * 100.0, 2)
    
    duplicate_rows = int(df.duplicated().sum())
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    total_outliers = 0
    for col in numeric_cols:
        total_outliers += detect_outliers_iqr(df[col])
        
    date_range = "N/A"
    if "year" in df.columns:
        date_range = f"{df['year'].min()} - {df['year'].max()}"
        
    geo_coverage = "India"
    if "region" in df.columns:
        unique_regions = df["region"].nunique()
        geo_coverage = f"{unique_regions} States/Regions"
        
    quality_status = "EXCELLENT"
    if missing_pct > 10.0 or duplicate_rows > 0:
        quality_status = "WARNING"
    elif missing_pct > 2.0 or total_outliers > (total_records * 0.1):
        quality_status = "GOOD"

    return {
        "dataset_name": dataset_name,
        "source": source,
        "source_url": source_url,
        "total_records": total_records,
        "total_columns": total_columns,
        "missing_values_count": missing_cells,
        "missing_pct": missing_pct,
        "duplicate_rows_count": duplicate_rows,
        "detected_outliers_count": total_outliers,
        "date_range": date_range,
        "geographic_coverage": geo_coverage,
        "last_updated": "2025-01-15",
        "quality_status": quality_status
    }
