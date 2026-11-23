"""
Reusable scientific and financial calculation functions for OilCrop Intelligence.
Preserves units and checks against division by zero.
"""

from typing import Dict, Any, Optional

def calculate_crop_production(land_area_ha: float, yield_t_ha: float) -> float:
    """Production in metric tonnes = Land Area (ha) * Yield (tonnes/ha)."""
    return round(land_area_ha * yield_t_ha, 3)

def calculate_seed_requirement(land_area_ha: float, seed_rate_kg_ha: float) -> float:
    """Total Seed Required (kg) = Seed Requirement per Hectare (kg/ha) * Land Area (ha)."""
    return round(land_area_ha * seed_rate_kg_ha, 2)

def calculate_oil_production(crop_production_tonnes: float, extraction_rate_pct: float) -> Dict[str, float]:
    """
    Estimated Oil Production (Tonnes) = Crop Production (Tonnes) * (Oil Extraction Rate % / 100)
    Cake / Meal Production (Tonnes) = Crop Production * ((100 - Extraction Rate %) / 100)
    """
    rate_fraction = extraction_rate_pct / 100.0
    oil_tonnes = crop_production_tonnes * rate_fraction
    cake_tonnes = crop_production_tonnes * (1.0 - rate_fraction)
    return {
        "oil_tonnes": round(oil_tonnes, 3),
        "cake_tonnes": round(cake_tonnes, 3)
    }

def calculate_gross_revenue(crop_production_tonnes: float, market_price_per_kg: float) -> float:
    """Gross Revenue = Production (kg) * Market Price (₹/kg)"""
    production_kg = crop_production_tonnes * 1000.0
    return round(production_kg * market_price_per_kg, 2)

def calculate_net_profit(revenue: float, total_cost: float) -> float:
    """Net Profit = Revenue - Total Production Cost"""
    return round(revenue - total_cost, 2)

def calculate_roi(net_profit: float, total_cost: float) -> float:
    """ROI (%) = (Net Profit / Total Investment) * 100"""
    if total_cost <= 0:
        return 0.0
    return round((net_profit / total_cost) * 100.0, 2)

def calculate_break_even_price(total_cost: float, crop_production_tonnes: float) -> float:
    """
    Break-Even Price (₹/kg) = Total Cost (₹) / Production (kg)
    """
    production_kg = crop_production_tonnes * 1000.0
    if production_kg <= 0:
        return 0.0
    return round(total_cost / production_kg, 2)

def calculate_break_even_production(total_cost: float, market_price_per_kg: float) -> float:
    """
    Break-Even Production (Tonnes) = Total Cost (₹) / (Market Price (₹/kg) * 1000)
    """
    if market_price_per_kg <= 0:
        return 0.0
    return round(total_cost / (market_price_per_kg * 1000.0), 3)

def calculate_financial_summary(
    land_area_ha: float,
    yield_t_ha: float,
    cost_per_ha: float,
    market_price_per_kg: float,
    extraction_rate_pct: float
) -> Dict[str, Any]:
    """Calculates full comprehensive journey from land to oil to profit."""
    prod_tonnes = calculate_crop_production(land_area_ha, yield_t_ha)
    oil_res = calculate_oil_production(prod_tonnes, extraction_rate_pct)
    
    total_cost = round(land_area_ha * cost_per_ha, 2)
    revenue = calculate_gross_revenue(prod_tonnes, market_price_per_kg)
    profit = calculate_net_profit(revenue, total_cost)
    roi = calculate_roi(profit, total_cost)
    
    profit_per_ha = round(profit / land_area_ha, 2) if land_area_ha > 0 else 0.0
    cost_per_kg = round(total_cost / (prod_tonnes * 1000.0), 2) if prod_tonnes > 0 else 0.0
    profit_per_kg = round(profit / (prod_tonnes * 1000.0), 2) if prod_tonnes > 0 else 0.0
    
    be_price_kg = calculate_break_even_price(total_cost, prod_tonnes)
    be_prod_tonnes = calculate_break_even_production(total_cost, market_price_per_kg)
    
    return {
        "production_tonnes": prod_tonnes,
        "oil_tonnes": oil_res["oil_tonnes"],
        "cake_tonnes": oil_res["cake_tonnes"],
        "total_cost": total_cost,
        "revenue": revenue,
        "profit": profit,
        "roi_percentage": roi,
        "profit_per_ha": profit_per_ha,
        "cost_per_kg": cost_per_kg,
        "profit_per_kg": profit_per_kg,
        "break_even_price_per_kg": be_price_kg,
        "break_even_production_tonnes": be_prod_tonnes
    }
