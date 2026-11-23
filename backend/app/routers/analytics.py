from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.connection import get_db
from app.database.models import (
    Crop, ProductionData, SeedParameter, OilParameter, InputCost, MarketPrice,
    AnalysisScenario, User
)
from app.routers.auth import get_current_user
from app.schemas.analysis import (
    SeedCalculationRequest, SeedCalculationResponse,
    OilCalculationRequest, OilCalculationResponse,
    ProfitabilityRequest, ProfitabilityResponse,
    BreakEvenResponse, SensitivityRequest, SensitivityResponse,
    CropComparisonResponse, ScenarioCreate, ScenarioOut
)
from app.utils.units import (
    convert_area_to_hectares, convert_oil_tonnes_to_litres,
    get_all_area_units, get_all_weight_units
)
from app.utils.calculations import (
    calculate_crop_production, calculate_seed_requirement,
    calculate_oil_production, calculate_financial_summary,
    calculate_break_even_price, calculate_break_even_production
)
from app.services.insight_service import insight_engine

router = APIRouter(prefix="/analytics", tags=["Analytics & Calculations"])

# 1. Land & Seed Requirement Calculator
@router.post("/seed-requirement", response_model=SeedCalculationResponse)
def calculate_seed(req: SeedCalculationRequest, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.crop_name == req.crop_name).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found.")

    farm_total_ha = None
    if req.farm_total_area and req.farm_total_area > 0:
        farm_total_ha = convert_area_to_hectares(req.farm_total_area, req.farm_total_unit or "hectare")

    area_ha = convert_area_to_hectares(req.land_area, req.unit, req.farm_total_area, req.farm_total_unit or "hectare")
    seed_param = crop.seed_parameters

    if not seed_param:
        return SeedCalculationResponse(
            crop_name=crop.crop_name,
            region=req.region,
            input_area=req.land_area,
            input_unit=req.unit,
            standard_area_ha=round(area_ha, 3),
            seed_rate_kg_ha=None,
            total_seed_required_kg=None,
            data_status="UNAVAILABLE",
            data_source="Seed requirement data unavailable for this crop in official registry.",
            notes="Please consult local agricultural extension officers for seed rate recommendation."
        )

    tot_seed = calculate_seed_requirement(area_ha, seed_param.recommended_seed_rate_kg_ha)

    # Historical average yield for this crop
    yield_q = db.query(ProductionData).filter(ProductionData.crop_id == crop.id)
    if req.region and req.region != "All":
        yield_q = yield_q.filter(ProductionData.region == req.region)
    records = yield_q.all()
    avg_yield = round(sum(r.yield_per_ha for r in records) / len(records), 3) if records else 1.25
    expected_prod = round(area_ha * avg_yield, 2)
    expected_prod_kg = expected_prod * 1000.0

    # Percentage Metrics Calculations
    seed_to_harvest_pct = round((tot_seed / expected_prod_kg * 100.0), 2) if expected_prod_kg > 0 else 0.0
    seed_multiplication_factor = round((expected_prod_kg / tot_seed), 1) if tot_seed > 0 else 0.0
    farm_land_share_pct = round((area_ha / farm_total_ha * 100.0), 2) if farm_total_ha and farm_total_ha > 0 else (round(req.land_area, 2) if req.unit in ["percentage", "%", "percent"] else round((area_ha / 10.0 * 100.0), 2))
    yield_benchmark_pct = round((avg_yield / 1.25 * 100.0), 1)

    # Detailed Multi-Unit Conversions
    area_units = get_all_area_units(area_ha, farm_total_ha)
    seed_weight_units = get_all_weight_units(tot_seed)
    seed_weight_units["grams_per_sqm"] = round((tot_seed / (area_ha * 10000.0)) * 1000.0, 2) if area_ha > 0 else 0.0

    prod_weight_units = get_all_weight_units(expected_prod_kg)

    yield_units = {
        "t_per_ha": avg_yield,
        "q_per_acre": round(avg_yield * 10.0 / 2.47105, 2),
        "kg_per_acre": round(avg_yield * 1000.0 / 2.47105, 1),
        "kg_per_ha": round(avg_yield * 1000.0, 1)
    }

    unit_conversions = {
        "land_area": area_units,
        "seed_required": seed_weight_units,
        "expected_production": prod_weight_units,
        "yield_rates": yield_units
    }

    return SeedCalculationResponse(
        crop_name=crop.crop_name,
        region=req.region,
        input_area=req.land_area,
        input_unit=req.unit,
        standard_area_ha=round(area_ha, 3),
        seed_rate_kg_ha=seed_param.recommended_seed_rate_kg_ha,
        total_seed_required_kg=tot_seed,
        historical_avg_yield_t_ha=avg_yield,
        expected_production_tonnes=expected_prod,
        seed_to_harvest_pct=seed_to_harvest_pct,
        seed_multiplication_factor=seed_multiplication_factor,
        farm_land_share_pct=farm_land_share_pct,
        yield_benchmark_pct=yield_benchmark_pct,
        unit_conversions=unit_conversions,
        data_status="AVAILABLE",
        data_source=seed_param.source,
        source_url=seed_param.source_url,
        notes=seed_param.notes
    )

# 2. Crop-to-Oil Production Calculator
@router.post("/oil-production", response_model=OilCalculationResponse)
def calculate_oil(req: OilCalculationRequest, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.crop_name == req.crop_name).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found.")

    area_ha = convert_area_to_hectares(req.land_area, req.land_unit)
    oil_param = crop.oil_parameters

    is_custom = req.custom_extraction_rate is not None
    if is_custom:
        ext_rate = req.custom_extraction_rate
        source_desc = "User-Provided Assumption"
        source_url = None
        notes = "User custom extraction rate override."
    elif oil_param:
        ext_rate = oil_param.extraction_rate_pct
        source_desc = oil_param.source
        source_url = oil_param.source_url
        notes = oil_param.notes
    else:
        ext_rate = 35.0
        source_desc = "Standard Industry Estimate"
        source_url = None
        notes = "General benchmark."

    # Production tonnes: either provided or estimated from regional average yield
    if req.production_tonnes is not None and req.production_tonnes > 0:
        prod_tonnes = req.production_tonnes
    else:
        records = db.query(ProductionData).filter(ProductionData.crop_id == crop.id).all()
        avg_yield = sum(r.yield_per_ha for r in records) / len(records) if records else 1.2
        prod_tonnes = round(area_ha * avg_yield, 2)

    oil_res = calculate_oil_production(prod_tonnes, ext_rate)
    oil_tonnes = oil_res["oil_tonnes"]
    oil_litres = round(convert_oil_tonnes_to_litres(oil_tonnes), 1)
    oil_kg_ha = round((oil_tonnes * 1000.0) / area_ha, 2) if area_ha > 0 else 0.0

    return OilCalculationResponse(
        crop_name=crop.crop_name,
        land_area_ha=round(area_ha, 3),
        crop_production_tonnes=prod_tonnes,
        extraction_rate_pct=ext_rate,
        is_custom_assumption=is_custom,
        estimated_oil_tonnes=oil_tonnes,
        estimated_oil_litres=oil_litres,
        estimated_oil_kg_per_ha=oil_kg_ha,
        estimated_cake_meal_tonnes=oil_res["cake_tonnes"],
        extraction_method=oil_param.extraction_method if oil_param else "Commercial Expeller",
        data_source=source_desc,
        source_url=source_url,
        notes=notes
    )

# 3. Comprehensive Profitability Engine
@router.post("/profitability", response_model=ProfitabilityResponse)
def calculate_profitability(req: ProfitabilityRequest, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.crop_name == req.crop_name).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found.")

    area_ha = convert_area_to_hectares(req.land_area, req.land_unit)
    target_year = req.year or 2024

    # Determine Yield
    is_yield_assumed = req.custom_yield_t_ha is not None
    if is_yield_assumed:
        yield_val = req.custom_yield_t_ha
    else:
        prod_rec = db.query(ProductionData).filter(
            ProductionData.crop_id == crop.id,
            ProductionData.region == req.region,
            ProductionData.year == target_year
        ).first()
        if not prod_rec:
            prod_rec = db.query(ProductionData).filter(
                ProductionData.crop_id == crop.id,
                ProductionData.region == req.region
            ).order_by(ProductionData.year.desc()).first()
        yield_val = prod_rec.yield_per_ha if prod_rec else 1.15

    # Determine Cost per Hectare
    is_cost_assumed = req.custom_cost_per_ha is not None
    if is_cost_assumed:
        cost_ha = req.custom_cost_per_ha
    else:
        cost_rec = db.query(InputCost).filter(
            InputCost.crop_id == crop.id,
            InputCost.region == req.region,
            InputCost.year == target_year
        ).first()
        if not cost_rec:
            cost_rec = db.query(InputCost).filter(
                InputCost.crop_id == crop.id,
                InputCost.region == req.region
            ).order_by(InputCost.year.desc()).first()
        cost_ha = cost_rec.total_cost_ha if cost_rec else 42000.0

    # Determine Market Price per Kg
    is_price_assumed = req.custom_price_per_kg is not None
    if is_price_assumed:
        price_kg = req.custom_price_per_kg
        price_qtl = price_kg * 100.0
    else:
        price_rec = db.query(MarketPrice).filter(
            MarketPrice.crop_id == crop.id,
            MarketPrice.region == req.region,
            MarketPrice.year == target_year
        ).first()
        if not price_rec:
            price_rec = db.query(MarketPrice).filter(
                MarketPrice.crop_id == crop.id,
                MarketPrice.region == req.region
            ).order_by(MarketPrice.year.desc()).first()
        price_kg = price_rec.price_per_kg if price_rec else 50.0
        price_qtl = price_rec.wholesale_avg_price_quintal if price_rec else 5000.0

    # Seed required
    seed_rate = crop.seed_parameters.recommended_seed_rate_kg_ha if crop.seed_parameters else 50.0
    seed_req = calculate_seed_requirement(area_ha, seed_rate)

    # Extraction rate
    ext_rate = crop.oil_parameters.extraction_rate_pct if crop.oil_parameters else 35.0

    fin = calculate_financial_summary(area_ha, yield_val, cost_ha, price_kg, ext_rate)

    sources = {
        "production_yield": "User Assumption" if is_yield_assumed else "DES Historical Agricultural Statistics",
        "input_costs": "User Assumption" if is_cost_assumed else "CACP Comprehensive Cost of Cultivation Scheme",
        "market_price": "User Assumption" if is_price_assumed else "Agmarknet APMC Wholesale Price System",
        "seed_rate": crop.seed_parameters.source if crop.seed_parameters else "ICAR Package of Practices",
        "oil_extraction": crop.oil_parameters.source if crop.oil_parameters else "FAO Bulletin 45"
    }

    return ProfitabilityResponse(
        crop_name=crop.crop_name,
        region=req.region,
        year=target_year,
        land_area_ha=round(area_ha, 3),
        yield_t_ha=round(yield_val, 3),
        is_yield_assumed=is_yield_assumed,
        crop_production_tonnes=fin["production_tonnes"],
        seed_required_kg=seed_req,
        estimated_oil_tonnes=fin["oil_tonnes"],
        cost_per_ha=cost_ha,
        total_cost=fin["total_cost"],
        is_cost_assumed=is_cost_assumed,
        market_price_per_kg=price_kg,
        market_price_per_quintal=price_qtl,
        is_price_assumed=is_price_assumed,
        gross_revenue=fin["revenue"],
        net_profit=fin["profit"],
        roi_percentage=fin["roi_percentage"],
        profit_per_ha=fin["profit_per_ha"],
        profit_per_kg=fin["profit_per_kg"],
        cost_per_kg=fin["cost_per_kg"],
        break_even_price_per_kg=fin["break_even_price_per_kg"],
        break_even_production_tonnes=fin["break_even_production_tonnes"],
        data_sources=sources
    )

# 4. Break-Even Analysis
@router.post("/break-even", response_model=BreakEvenResponse)
def get_break_even(
    crop_name: str = "Soybean",
    region: str = "Madhya Pradesh",
    land_area: float = 10.0,
    year: int = 2024,
    db: Session = Depends(get_db)
):
    crop = db.query(Crop).filter(Crop.crop_name == crop_name).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found.")

    # Historical yield
    prod_rec = db.query(ProductionData).filter(
        ProductionData.crop_id == crop.id,
        ProductionData.region == region,
        ProductionData.year == year
    ).first()
    yld = prod_rec.yield_per_ha if prod_rec else 1.15
    prod_tonnes = round(land_area * yld, 3)

    # Cost
    cost_rec = db.query(InputCost).filter(
        InputCost.crop_id == crop.id,
        InputCost.region == region,
        InputCost.year == year
    ).first()
    cost_ha = cost_rec.total_cost_ha if cost_rec else 43000.0
    total_cost = round(land_area * cost_ha, 2)

    # Market Price
    price_rec = db.query(MarketPrice).filter(
        MarketPrice.crop_id == crop.id,
        MarketPrice.region == region,
        MarketPrice.year == year
    ).first()
    mkt_price_kg = price_rec.price_per_kg if price_rec else 50.0

    be_price_kg = calculate_break_even_price(total_cost, prod_tonnes)
    be_prod_tonnes = calculate_break_even_production(total_cost, mkt_price_kg)
    current_rev = round(prod_tonnes * 1000.0 * mkt_price_kg, 2)
    be_rev = total_cost

    safety_buffer = round(((mkt_price_kg - be_price_kg) / mkt_price_kg) * 100.0, 2) if mkt_price_kg > 0 else 0.0

    # Chart points from 0 to 180% of current production
    chart_points = []
    steps = [0.0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75]
    for step in steps:
        p_step = round(prod_tonnes * step, 2)
        rev_step = round(p_step * 1000.0 * mkt_price_kg, 2)
        profit_step = round(rev_step - total_cost, 2)
        chart_points.append({
            "production_tonnes": p_step,
            "cost": total_cost,
            "revenue": rev_step,
            "net_profit": profit_step,
            "is_profit_zone": rev_step >= total_cost
        })

    return BreakEvenResponse(
        crop_name=crop_name,
        region=region,
        total_cost=total_cost,
        crop_production_tonnes=prod_tonnes,
        market_price_per_kg=mkt_price_kg,
        break_even_price_per_kg=be_price_kg,
        break_even_price_per_quintal=round(be_price_kg * 100.0, 1),
        break_even_production_tonnes=be_prod_tonnes,
        break_even_revenue=be_rev,
        current_revenue=current_rev,
        margin_of_safety_pct=safety_buffer,
        chart_points=chart_points
    )

# 5. Sensitivity & Risk Analysis
@router.post("/sensitivity", response_model=SensitivityResponse)
def get_sensitivity_analysis(req: SensitivityRequest, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.crop_name == req.crop_name).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found.")

    area_ha = req.land_area

    # Base baseline values
    prod_rec = db.query(ProductionData).filter(
        ProductionData.crop_id == crop.id,
        ProductionData.region == req.region
    ).order_by(ProductionData.year.desc()).first()
    base_yield = prod_rec.yield_per_ha if prod_rec else 1.2

    cost_rec = db.query(InputCost).filter(
        InputCost.crop_id == crop.id,
        InputCost.region == req.region
    ).order_by(InputCost.year.desc()).first()
    base_cost_ha = cost_rec.total_cost_ha if cost_rec else 42000.0

    price_rec = db.query(MarketPrice).filter(
        MarketPrice.crop_id == crop.id,
        MarketPrice.region == req.region
    ).order_by(MarketPrice.year.desc()).first()
    base_price_kg = price_rec.price_per_kg if price_rec else 50.0

    ext_rate = crop.oil_parameters.extraction_rate_pct if crop.oil_parameters else 35.0

    base_fin = calculate_financial_summary(area_ha, base_yield, base_cost_ha, base_price_kg, ext_rate)

    # 1. Price Sensitivity Curve
    price_curve = []
    for delta in req.price_change_pcts:
        p_mod = base_price_kg * (1.0 + (delta / 100.0))
        fin = calculate_financial_summary(area_ha, base_yield, base_cost_ha, p_mod, ext_rate)
        price_curve.append({
            "percentage_change": delta,
            "market_price_kg": round(p_mod, 2),
            "revenue": fin["revenue"],
            "profit": fin["profit"],
            "roi_percentage": fin["roi_percentage"]
        })

    # 2. Yield Sensitivity Curve
    yield_curve = []
    for delta in req.yield_change_pcts:
        y_mod = max(0.1, base_yield * (1.0 + (delta / 100.0)))
        fin = calculate_financial_summary(area_ha, y_mod, base_cost_ha, base_price_kg, ext_rate)
        yield_curve.append({
            "percentage_change": delta,
            "yield_t_ha": round(y_mod, 3),
            "production_tonnes": fin["production_tonnes"],
            "profit": fin["profit"],
            "roi_percentage": fin["roi_percentage"]
        })

    # 3. Cost Sensitivity Curve
    cost_curve = []
    for delta in req.cost_change_pcts:
        c_mod = max(1000.0, base_cost_ha * (1.0 + (delta / 100.0)))
        fin = calculate_financial_summary(area_ha, base_yield, c_mod, base_price_kg, ext_rate)
        cost_curve.append({
            "percentage_change": delta,
            "cost_per_ha": round(c_mod, 1),
            "total_cost": fin["total_cost"],
            "profit": fin["profit"],
            "roi_percentage": fin["roi_percentage"]
        })

    # Tornado comparison (+/- 10% change impact on profit)
    p_up = calculate_financial_summary(area_ha, base_yield, base_cost_ha, base_price_kg * 1.10, ext_rate)["profit"]
    p_dn = calculate_financial_summary(area_ha, base_yield, base_cost_ha, base_price_kg * 0.90, ext_rate)["profit"]
    
    y_up = calculate_financial_summary(area_ha, base_yield * 1.10, base_cost_ha, base_price_kg, ext_rate)["profit"]
    y_dn = calculate_financial_summary(area_ha, base_yield * 0.90, base_cost_ha, base_price_kg, ext_rate)["profit"]
    
    c_up = calculate_financial_summary(area_ha, base_yield, base_cost_ha * 1.10, base_price_kg, ext_rate)["profit"]
    c_dn = calculate_financial_summary(area_ha, base_yield, base_cost_ha * 0.90, base_price_kg, ext_rate)["profit"]

    tornado = [
        {"variable": "Market Realization Price", "minus_10_profit": p_dn, "plus_10_profit": p_up, "swing": abs(p_up - p_dn)},
        {"variable": "Crop Yield / Acreage Efficiency", "minus_10_profit": y_dn, "plus_10_profit": y_up, "swing": abs(y_up - y_dn)},
        {"variable": "Operational Cultivation Cost", "minus_10_profit": c_dn, "plus_10_profit": c_up, "swing": abs(c_up - c_dn)}
    ]
    tornado.sort(key=lambda x: x["swing"], reverse=True)

    return SensitivityResponse(
        crop_name=req.crop_name,
        region=req.region,
        base_case=base_fin,
        price_sensitivity=price_curve,
        yield_sensitivity=yield_curve,
        cost_sensitivity=cost_curve,
        tornado_factors=tornado
    )

# 6. Multi-Crop Comparison Engine
@router.get("/crop-comparison", response_model=CropComparisonResponse)
def compare_crops(
    region: str = "Madhya Pradesh",
    year: int = 2024,
    db: Session = Depends(get_db)
):
    crops = db.query(Crop).all()
    results = []

    for crop in crops:
        # Check if production data exists for this crop and region
        prod_rec = db.query(ProductionData).filter(
            ProductionData.crop_id == crop.id,
            ProductionData.region == region,
            ProductionData.year == year
        ).first()

        if not prod_rec:
            # Fallback to general data for crop
            prod_rec = db.query(ProductionData).filter(
                ProductionData.crop_id == crop.id
            ).order_by(ProductionData.year.desc()).first()

        cost_rec = db.query(InputCost).filter(
            InputCost.crop_id == crop.id,
            InputCost.region == region,
            InputCost.year == year
        ).first()
        if not cost_rec:
            cost_rec = db.query(InputCost).filter(
                InputCost.crop_id == crop.id
            ).order_by(InputCost.year.desc()).first()

        price_rec = db.query(MarketPrice).filter(
            MarketPrice.crop_id == crop.id,
            MarketPrice.region == region,
            MarketPrice.year == year
        ).first()
        if not price_rec:
            price_rec = db.query(MarketPrice).filter(
                MarketPrice.crop_id == crop.id
            ).order_by(MarketPrice.year.desc()).first()

        if prod_rec and cost_rec and price_rec:
            yld = prod_rec.yield_per_ha
            c_ha = cost_rec.total_cost_ha
            p_kg = price_rec.price_per_kg
            ext_rate = crop.oil_parameters.extraction_rate_pct if crop.oil_parameters else 35.0
            seed_rate = crop.seed_parameters.recommended_seed_rate_kg_ha if crop.seed_parameters else None

            rev_ha = round(yld * 1000.0 * p_kg, 2)
            prof_ha = round(rev_ha - c_ha, 2)
            roi = round((prof_ha / c_ha) * 100.0, 2) if c_ha > 0 else 0.0

            results.append({
                "crop_name": crop.crop_name,
                "category": crop.category,
                "avg_yield_t_ha": yld,
                "oil_extraction_pct": ext_rate,
                "cost_per_ha": c_ha,
                "price_per_kg": p_kg,
                "revenue_per_ha": rev_ha,
                "profit_per_ha": prof_ha,
                "roi_percentage": roi,
                "seed_rate_kg_ha": seed_rate,
                "data_availability": "Full Real-World Records"
            })

    results.sort(key=lambda x: x["roi_percentage"], reverse=True)

    top_roi = results[0]["crop_name"] if results else None
    top_profit = sorted(results, key=lambda x: x["profit_per_ha"], reverse=True)[0]["crop_name"] if results else None
    top_oil = sorted(results, key=lambda x: x["oil_extraction_pct"], reverse=True)[0]["crop_name"] if results else None

    return CropComparisonResponse(
        selected_region=region,
        year=year,
        crops=results,
        top_by_roi=top_roi,
        top_by_profit=top_profit,
        top_by_oil=top_oil
    )

# 7. Scenario Persistence
@router.post("/scenarios", response_model=ScenarioOut)
def save_scenario(
    scen_in: ScenarioCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    crop = db.query(Crop).filter(Crop.crop_name == scen_in.crop_name).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found.")

    area_ha = convert_area_to_hectares(scen_in.land_area, scen_in.land_unit)

    # Calculate financial metrics
    prod_rec = db.query(ProductionData).filter(
        ProductionData.crop_id == crop.id,
        ProductionData.region == scen_in.region,
        ProductionData.year == scen_in.year
    ).first()
    yld = prod_rec.yield_per_ha if prod_rec else 1.2

    cost_rec = db.query(InputCost).filter(
        InputCost.crop_id == crop.id,
        InputCost.region == scen_in.region,
        InputCost.year == scen_in.year
    ).first()
    cost_ha = cost_rec.total_cost_ha if cost_rec else 42000.0

    price_rec = db.query(MarketPrice).filter(
        MarketPrice.crop_id == crop.id,
        MarketPrice.region == scen_in.region,
        MarketPrice.year == scen_in.year
    ).first()
    price_kg = price_rec.price_per_kg if price_rec else 50.0

    ext_rate = crop.oil_parameters.extraction_rate_pct if crop.oil_parameters else 35.0
    seed_rate = crop.seed_parameters.recommended_seed_rate_kg_ha if crop.seed_parameters else 50.0

    fin = calculate_financial_summary(area_ha, yld, cost_ha, price_kg, ext_rate)
    seed_req = calculate_seed_requirement(area_ha, seed_rate)

    scen = AnalysisScenario(
        user_id=current_user.id,
        name=scen_in.name,
        crop_id=crop.id,
        region=scen_in.region,
        year=scen_in.year,
        land_area=scen_in.land_area,
        land_unit=scen_in.land_unit,
        calculated_yield=yld,
        expected_production=fin["production_tonnes"],
        seed_required=seed_req,
        estimated_oil=fin["oil_tonnes"],
        total_cost=fin["total_cost"],
        expected_revenue=fin["revenue"],
        net_profit=fin["profit"],
        roi_percentage=fin["roi_percentage"],
        break_even_price=fin["break_even_price_per_kg"],
        notes=scen_in.notes
    )
    db.add(scen)
    db.commit()
    db.refresh(scen)

    return ScenarioOut(
        id=scen.id,
        user_id=scen.user_id,
        name=scen.name,
        crop_id=scen.crop_id,
        crop_name=crop.crop_name,
        region=scen.region,
        year=scen.year,
        land_area=scen.land_area,
        land_unit=scen.land_unit,
        calculated_yield=scen.calculated_yield,
        expected_production=scen.expected_production,
        seed_required=scen.seed_required,
        estimated_oil=scen.estimated_oil,
        total_cost=scen.total_cost,
        expected_revenue=scen.expected_revenue,
        net_profit=scen.net_profit,
        roi_percentage=scen.roi_percentage,
        break_even_price=scen.break_even_price,
        notes=scen.notes,
        created_at=scen.created_at
    )

@router.get("/scenarios", response_model=List[ScenarioOut])
def get_user_scenarios(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scenarios = db.query(AnalysisScenario).filter(
        AnalysisScenario.user_id == current_user.id
    ).order_by(AnalysisScenario.created_at.desc()).all()

    out = []
    for s in scenarios:
        out.append(ScenarioOut(
            id=s.id,
            user_id=s.user_id,
            name=s.name,
            crop_id=s.crop_id,
            crop_name=s.crop.crop_name,
            region=s.region,
            year=s.year,
            land_area=s.land_area,
            land_unit=s.land_unit,
            calculated_yield=s.calculated_yield,
            expected_production=s.expected_production,
            seed_required=s.seed_required,
            estimated_oil=s.estimated_oil,
            total_cost=s.total_cost,
            expected_revenue=s.expected_revenue,
            net_profit=s.net_profit,
            roi_percentage=s.roi_percentage,
            break_even_price=s.break_even_price,
            notes=s.notes,
            created_at=s.created_at
        ))
    return out

@router.delete("/scenarios/{scenario_id}")
def delete_scenario(
    scenario_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scen = db.query(AnalysisScenario).filter(
        AnalysisScenario.id == scenario_id,
        AnalysisScenario.user_id == current_user.id
    ).first()
    if not scen:
        raise HTTPException(status_code=404, detail="Scenario not found.")
    db.delete(scen)
    db.commit()
    return {"message": "Scenario deleted successfully."}

# 8. Dynamic Data-Driven Insights
@router.get("/insights")
def get_insights(db: Session = Depends(get_db)):
    # Calculate top yield crop
    prod_records = db.query(ProductionData).join(Crop).filter(ProductionData.year == 2024).all()
    crop_yield_map = {}
    for r in prod_records:
        if r.crop.crop_name not in crop_yield_map:
            crop_yield_map[r.crop.crop_name] = []
        crop_yield_map[r.crop.crop_name].append(r.yield_per_ha)

    top_yield_item = {}
    if crop_yield_map:
        avg_yields = [
            {"crop_name": c, "yield_t_ha": round(sum(vals)/len(vals), 3)}
            for c, vals in crop_yield_map.items()
        ]
        avg_yields.sort(key=lambda x: x["yield_t_ha"], reverse=True)
        top_yield_item = avg_yields[0]

    # Calculate overall growth rate
    p_first = db.query(func.sum(ProductionData.production)).filter(ProductionData.year == 2012).scalar() or 1.0
    p_last = db.query(func.sum(ProductionData.production)).filter(ProductionData.year == 2024).scalar() or 1.0
    growth = round(((p_last - p_first) / p_first) * 100.0, 1)

    # ROI leader
    comparison_res = compare_crops(region="Madhya Pradesh", year=2024, db=db)
    roi_champ = {}
    if comparison_res.crops:
        first_c = comparison_res.crops[0]
        roi_champ = first_c.dict() if hasattr(first_c, 'dict') else first_c.model_dump()

    insights = insight_engine.generate_dashboard_insights(
        crop_stats=[],
        growth_rate_pct=growth,
        best_crop_roi=roi_champ,
        highest_yield_crop=top_yield_item
    )
    return insights
