from typing import List, Optional
import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import MarketPrice, Crop

router = APIRouter(prefix="/market", tags=["Market Intelligence"])

@router.get("/trends")
def get_market_trends(
    crop_name: str = "Soybean",
    region: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(MarketPrice).join(Crop).filter(Crop.crop_name == crop_name)
    if region and region != "All":
        query = query.filter(MarketPrice.region == region)

    records = query.order_by(MarketPrice.year).all()
    if not records:
        raise HTTPException(status_code=404, detail=f"Market price data unavailable for {crop_name}.")

    # Aggregate by year
    yearly_agg = {}
    for r in records:
        if r.year not in yearly_agg:
            yearly_agg[r.year] = {
                "msp_list": [],
                "wholesale_list": [],
                "min_list": [],
                "max_list": []
            }
        if r.msp_price_quintal:
            yearly_agg[r.year]["msp_list"].append(r.msp_price_quintal)
        yearly_agg[r.year]["wholesale_list"].append(r.wholesale_avg_price_quintal)
        if r.min_price_quintal:
            yearly_agg[r.year]["min_list"].append(r.min_price_quintal)
        if r.max_price_quintal:
            yearly_agg[r.year]["max_list"].append(r.max_price_quintal)

    series = []
    prices_for_volatility = []
    for yr in sorted(yearly_agg.keys()):
        data = yearly_agg[yr]
        avg_msp = round(sum(data["msp_list"]) / len(data["msp_list"]), 1) if data["msp_list"] else None
        avg_wholesale = round(sum(data["wholesale_list"]) / len(data["wholesale_list"]), 1)
        min_p = round(min(data["min_list"]), 1) if data["min_list"] else round(avg_wholesale * 0.92, 1)
        max_p = round(max(data["max_list"]), 1) if data["max_list"] else round(avg_wholesale * 1.10, 1)
        price_kg = round(avg_wholesale / 100.0, 2)
        prices_for_volatility.append(avg_wholesale)

        series.append({
            "year": yr,
            "msp_price_quintal": avg_msp,
            "wholesale_avg_price_quintal": avg_wholesale,
            "min_price_quintal": min_p,
            "max_price_quintal": max_p,
            "price_per_kg": price_kg
        })

    # Volatility = (Standard Deviation / Mean) * 100
    volatility = round((float(np.std(prices_for_volatility)) / float(np.mean(prices_for_volatility))) * 100.0, 2) if len(prices_for_volatility) > 1 else 0.0

    latest = series[-1] if series else {}

    return {
        "crop_name": crop_name,
        "region": region or "All Mandis",
        "historical_series": series,
        "latest_msp": latest.get("msp_price_quintal"),
        "latest_wholesale": latest.get("wholesale_avg_price_quintal", 0.0),
        "latest_price_per_kg": latest.get("price_per_kg", 0.0),
        "price_volatility_pct": volatility,
        "data_source": "Agmarknet APMC Wholesale Price System & CACP Minimum Support Price Notifications",
        "source_url": "https://agmarknet.gov.in/"
    }

@router.get("/prices")
def list_market_prices(
    crop_name: Optional[str] = None,
    region: Optional[str] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(MarketPrice).join(Crop)
    if crop_name and crop_name != "All":
        query = query.filter(Crop.crop_name == crop_name)
    if region and region != "All":
        query = query.filter(MarketPrice.region == region)
    if year:
        query = query.filter(MarketPrice.year == year)

    records = query.order_by(MarketPrice.year.desc()).all()
    out = []
    for r in records:
        out.append({
            "id": r.id,
            "crop_id": r.crop_id,
            "crop_name": r.crop.crop_name,
            "region": r.region,
            "year": r.year,
            "msp_price_quintal": r.msp_price_quintal,
            "wholesale_avg_price_quintal": r.wholesale_avg_price_quintal,
            "min_price_quintal": r.min_price_quintal,
            "max_price_quintal": r.max_price_quintal,
            "price_per_kg": r.price_per_kg,
            "unit": r.unit
        })
    return out
