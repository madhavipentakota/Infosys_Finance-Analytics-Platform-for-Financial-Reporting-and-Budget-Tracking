from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.connection import get_db
from app.database.models import ProductionData, Crop, InputCost, MarketPrice, OilParameter

router = APIRouter(prefix="/production", tags=["Production & Yield"])

@router.get("/regions", response_model=List[str])
def get_available_regions(db: Session = Depends(get_db)):
    regions = db.query(ProductionData.region).distinct().order_by(ProductionData.region).all()
    return [r[0] for r in regions]

@router.get("/years", response_model=List[int])
def get_available_years(db: Session = Depends(get_db)):
    years = db.query(ProductionData.year).distinct().order_by(ProductionData.year).all()
    return [y[0] for y in years]

@router.get("/summary-kpis")
def get_dashboard_kpis(
    crop_name: Optional[str] = None,
    region: Optional[str] = None,
    year: Optional[int] = None,
    land_area: float = 10.0,
    db: Session = Depends(get_db)
):
    query = db.query(ProductionData).join(Crop)
    cost_q = db.query(InputCost).join(Crop)
    price_q = db.query(MarketPrice).join(Crop)

    if crop_name and crop_name != "All":
        query = query.filter(Crop.crop_name == crop_name)
        cost_q = cost_q.filter(Crop.crop_name == crop_name)
        price_q = price_q.filter(Crop.crop_name == crop_name)
    if region and region != "All":
        query = query.filter(ProductionData.region == region)
        cost_q = cost_q.filter(InputCost.region == region)
        price_q = price_q.filter(MarketPrice.region == region)
    if year:
        query = query.filter(ProductionData.year == year)
        cost_q = cost_q.filter(InputCost.year == year)
        price_q = price_q.filter(MarketPrice.year == year)

    records = query.all()
    if not records:
        return {
            "total_crops_analyzed": 0,
            "total_cultivated_area_ha": 0.0,
            "total_production_tonnes": 0.0,
            "average_yield_t_ha": 0.0,
            "estimated_oil_tonnes": 0.0,
            "average_production_cost_ha": 0.0,
            "average_market_price_kg": 0.0,
            "average_revenue_ha": 0.0,
            "average_profit_ha": 0.0,
            "average_roi_pct": 0.0,
            "record_count": 0
        }

    total_area = sum(r.cultivated_area for r in records)
    total_prod = sum(r.production for r in records)
    avg_yield = round(total_prod / total_area, 3) if total_area > 0 else 0.0
    crops_count = len(set(r.crop_id for r in records))

    # Average extraction rate for selected crops (~35% weighted average across oilseeds)
    oil_params = db.query(OilParameter).all()
    ext_rates = {op.crop_id: op.extraction_rate_pct for op in oil_params}
    
    total_oil = sum(r.production * (ext_rates.get(r.crop_id, 35.0) / 100.0) for r in records)

    # Average costs and market prices
    costs = cost_q.all()
    avg_cost_ha = round(sum(c.total_cost_ha for c in costs) / len(costs), 2) if costs else 42000.0

    prices = price_q.all()
    avg_price_kg = round(sum(p.price_per_kg for p in prices) / len(prices), 2) if prices else 52.0

    avg_revenue_ha = round(avg_yield * 1000.0 * avg_price_kg, 2)
    avg_profit_ha = round(avg_revenue_ha - avg_cost_ha, 2)
    avg_roi = round((avg_profit_ha / avg_cost_ha) * 100.0, 2) if avg_cost_ha > 0 else 0.0

    return {
        "total_crops_analyzed": crops_count,
        "total_cultivated_area_ha": round(total_area, 1),
        "total_production_tonnes": round(total_prod, 1),
        "average_yield_t_ha": avg_yield,
        "estimated_oil_tonnes": round(total_oil, 1),
        "average_production_cost_ha": avg_cost_ha,
        "average_market_price_kg": avg_price_kg,
        "average_revenue_ha": avg_revenue_ha,
        "average_profit_ha": avg_profit_ha,
        "average_roi_pct": avg_roi,
        "record_count": len(records),
        "data_source": "Directorate of Economics and Statistics (DES), Ministry of Agriculture & Farmers Welfare",
        "source_url": "https://eands.dacnet.nic.in/"
    }

@router.get("/trends")
def get_production_trends(
    crop_name: str = "Soybean",
    region: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ProductionData).join(Crop).filter(Crop.crop_name == crop_name)
    if region and region != "All":
        query = query.filter(ProductionData.region == region)

    records = query.order_by(ProductionData.year).all()

    # Group by year
    yearly_agg = {}
    for r in records:
        if r.year not in yearly_agg:
            yearly_agg[r.year] = {"area": 0.0, "production": 0.0}
        yearly_agg[r.year]["area"] += r.cultivated_area
        yearly_agg[r.year]["production"] += r.production

    series = []
    sorted_years = sorted(yearly_agg.keys())
    for yr in sorted_years:
        area = yearly_agg[yr]["area"]
        prod = yearly_agg[yr]["production"]
        yld = round(prod / area, 3) if area > 0 else 0.0
        series.append({
            "year": yr,
            "cultivated_area_ha": round(area, 1),
            "production_tonnes": round(prod, 1),
            "yield_t_ha": yld
        })

    # Growth rate from first to last year
    growth_rate = 0.0
    if len(series) >= 2 and series[0]["production_tonnes"] > 0:
        first_prod = series[0]["production_tonnes"]
        last_prod = series[-1]["production_tonnes"]
        growth_rate = round(((last_prod - first_prod) / first_prod) * 100.0, 2)

    latest = series[-1] if series else {"cultivated_area_ha": 0, "production_tonnes": 0, "yield_t_ha": 0}

    return {
        "crop_name": crop_name,
        "region": region or "All Major Producing Regions",
        "historical_series": series,
        "total_area_latest": latest["cultivated_area_ha"],
        "total_production_latest": latest["production_tonnes"],
        "avg_yield_latest": latest["yield_t_ha"],
        "growth_rate_pct": growth_rate,
        "data_source": "Directorate of Economics and Statistics (DES), Ministry of Agriculture & Farmers Welfare",
        "source_url": "https://eands.dacnet.nic.in/Advance_Estimate.htm"
    }

@router.get("/by-region")
def get_production_by_region(
    crop_name: str = "Soybean",
    year: Optional[int] = 2024,
    db: Session = Depends(get_db)
):
    query = db.query(ProductionData).join(Crop).filter(Crop.crop_name == crop_name)
    if year:
        query = query.filter(ProductionData.year == year)

    records = query.all()
    # Group by region
    reg_map = {}
    for r in records:
        if r.region not in reg_map:
            reg_map[r.region] = {"area": 0.0, "production": 0.0}
        reg_map[r.region]["area"] += r.cultivated_area
        reg_map[r.region]["production"] += r.production

    result = []
    for reg, vals in reg_map.items():
        area = vals["area"]
        prod = vals["production"]
        yld = round(prod / area, 3) if area > 0 else 0.0
        result.append({
            "region": reg,
            "cultivated_area": round(area, 1),
            "production": round(prod, 1),
            "yield_per_ha": yld
        })

    result.sort(key=lambda x: x["yield_per_ha"], reverse=True)
    for idx, item in enumerate(result, 1):
        item["rank"] = idx

    return result

@router.get("")
def list_production_records(
    crop_name: Optional[str] = None,
    region: Optional[str] = None,
    year: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(ProductionData).join(Crop)
    if crop_name and crop_name != "All":
        query = query.filter(Crop.crop_name == crop_name)
    if region and region != "All":
        query = query.filter(ProductionData.region == region)
    if year:
        query = query.filter(ProductionData.year == year)

    records = query.order_by(ProductionData.year.desc()).limit(limit).all()
    out = []
    for r in records:
        out.append({
            "id": r.id,
            "crop_id": r.crop_id,
            "crop_name": r.crop.crop_name,
            "country": r.country,
            "region": r.region,
            "district": r.district,
            "year": r.year,
            "season": r.season,
            "cultivated_area": r.cultivated_area,
            "production": r.production,
            "yield_per_ha": r.yield_per_ha
        })
    return out
