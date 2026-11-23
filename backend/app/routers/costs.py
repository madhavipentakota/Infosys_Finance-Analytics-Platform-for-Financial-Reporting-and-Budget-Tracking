from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import InputCost, Crop, ProductionData

router = APIRouter(prefix="/costs", tags=["Production Costs"])

@router.get("/summary")
def get_cost_summary(
    crop_name: str = "Soybean",
    region: str = "Madhya Pradesh",
    year: Optional[int] = 2024,
    db: Session = Depends(get_db)
):
    query = db.query(InputCost).join(Crop).filter(
        Crop.crop_name == crop_name,
        InputCost.region == region
    )
    if year:
        cost_record = query.filter(InputCost.year == year).first()
    else:
        cost_record = query.order_by(InputCost.year.desc()).first()

    if not cost_record:
        # Fallback to any region for this crop
        cost_record = db.query(InputCost).join(Crop).filter(Crop.crop_name == crop_name).order_by(InputCost.year.desc()).first()

    if not cost_record:
        raise HTTPException(status_code=404, detail=f"Cost data unavailable for {crop_name} in {region}.")

    tot = cost_record.total_cost_ha if cost_record.total_cost_ha > 0 else 1.0

    breakdown = [
        {"category": "Human Labor", "amount_ha": cost_record.labor_cost_ha, "percentage": round((cost_record.labor_cost_ha / tot) * 100, 1)},
        {"category": "Machinery & Equipment", "amount_ha": cost_record.machinery_cost_ha, "percentage": round((cost_record.machinery_cost_ha / tot) * 100, 1)},
        {"category": "Seed & Planting Material", "amount_ha": cost_record.seed_cost_ha, "percentage": round((cost_record.seed_cost_ha / tot) * 100, 1)},
        {"category": "Fertilizer & Manure", "amount_ha": cost_record.fertilizer_cost_ha, "percentage": round((cost_record.fertilizer_cost_ha / tot) * 100, 1)},
        {"category": "Harvesting & Threshing", "amount_ha": cost_record.harvesting_cost_ha, "percentage": round((cost_record.harvesting_cost_ha / tot) * 100, 1)},
        {"category": "Land Preparation", "amount_ha": cost_record.land_prep_cost_ha, "percentage": round((cost_record.land_prep_cost_ha / tot) * 100, 1)},
        {"category": "Plant Protection Chemicals", "amount_ha": cost_record.pesticide_cost_ha, "percentage": round((cost_record.pesticide_cost_ha / tot) * 100, 1)},
        {"category": "Irrigation Charges", "amount_ha": cost_record.irrigation_cost_ha, "percentage": round((cost_record.irrigation_cost_ha / tot) * 100, 1)},
        {"category": "Transportation & Marketing", "amount_ha": cost_record.processing_transport_ha, "percentage": round((cost_record.processing_transport_ha / tot) * 100, 1)},
        {"category": "Other Operational Overheads", "amount_ha": cost_record.other_operational_cost_ha, "percentage": round((cost_record.other_operational_cost_ha / tot) * 100, 1)},
    ]

    # Historical trend for this crop and region
    hist_records = db.query(InputCost).join(Crop).filter(
        Crop.crop_name == crop_name,
        InputCost.region == cost_record.region
    ).order_by(InputCost.year).all()

    historical_trend = [
        {
            "year": h.year,
            "total_cost_ha": h.total_cost_ha,
            "cost_per_quintal": h.cost_per_quintal
        }
        for h in hist_records
    ]

    # Estimate cost per kg based on regional yield
    prod_rec = db.query(ProductionData).join(Crop).filter(
        Crop.crop_name == crop_name,
        ProductionData.region == cost_record.region,
        ProductionData.year == cost_record.year
    ).first()
    
    yield_val = prod_rec.yield_per_ha if prod_rec and prod_rec.yield_per_ha > 0 else 1.2
    cost_per_kg = round(cost_record.total_cost_ha / (yield_val * 1000.0), 2)

    return {
        "crop_name": crop_name,
        "region": cost_record.region,
        "year": cost_record.year,
        "total_cost_ha": cost_record.total_cost_ha,
        "cost_per_quintal": cost_record.cost_per_quintal,
        "cost_per_kg": cost_per_kg,
        "breakdown": breakdown,
        "historical_trend": historical_trend,
        "data_source": "Commission for Agricultural Costs and Prices (CACP), Ministry of Agriculture & Farmers Welfare",
        "source_url": "https://cacp.dacnet.nic.in/ViewReports.aspx?Input=2&DocId=1&PageId=39"
    }

@router.get("")
def list_costs(
    crop_name: Optional[str] = None,
    region: Optional[str] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(InputCost).join(Crop)
    if crop_name and crop_name != "All":
        query = query.filter(Crop.crop_name == crop_name)
    if region and region != "All":
        query = query.filter(InputCost.region == region)
    if year:
        query = query.filter(InputCost.year == year)

    records = query.order_by(InputCost.year.desc()).all()
    out = []
    for r in records:
        out.append({
            "id": r.id,
            "crop_id": r.crop_id,
            "crop_name": r.crop.crop_name,
            "region": r.region,
            "year": r.year,
            "total_cost_ha": r.total_cost_ha,
            "cost_per_quintal": r.cost_per_quintal,
            "seed_cost_ha": r.seed_cost_ha,
            "fertilizer_cost_ha": r.fertilizer_cost_ha,
            "labor_cost_ha": r.labor_cost_ha,
            "machinery_cost_ha": r.machinery_cost_ha,
            "harvesting_cost_ha": r.harvesting_cost_ha
        })
    return out
