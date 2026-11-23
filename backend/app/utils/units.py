"""
Unit standardization and conversion utilities for OilCrop Intelligence.
Explicitly preserves units across all agricultural, physical, and monetary calculations.
"""

from typing import Optional

# Land Area Conversion Constants
# 1 hectare = 10,000 m² = 2.4710538 acres
HECTARES_PER_ACRE = 0.40468564
ACRES_PER_HECTARE = 2.4710538
HECTARES_PER_BIGHA = 0.2529285      # Standard / Pucca Bigha (~0.625 acre)
BIGHA_PER_HECTARE = 3.953686
HECTARES_PER_GUNTHA = 0.010117141   # 1 Guntha = 101.17 m² (40 Guntha = 1 Acre)
GUNTHA_PER_HECTARE = 98.84215
HECTARES_PER_CENT = 0.0040468564    # 1 Cent = 0.01 Acre (100 Cents = 1 Acre)
CENT_PER_HECTARE = 247.10538
SQ_METERS_PER_HECTARE = 10000.0
SQ_FEET_PER_HECTARE = 107639.1

def convert_area_to_hectares(area: float, unit: str, farm_total_area: Optional[float] = None, farm_total_unit: str = "hectare") -> float:
    unit_lower = unit.lower().strip()
    if unit_lower in ["percentage", "percent", "%"]:
        if farm_total_area and farm_total_area > 0:
            farm_ha = convert_area_to_hectares(farm_total_area, farm_total_unit)
            return (area / 100.0) * farm_ha
        else:
            return (area / 100.0) * 10.0
    if unit_lower in ["acre", "acres", "ac"]:
        return area * HECTARES_PER_ACRE
    elif unit_lower in ["hectare", "hectares", "ha"]:
        return area
    elif unit_lower in ["bigha", "bighas", "bg"]:
        return area * HECTARES_PER_BIGHA
    elif unit_lower in ["guntha", "gunthas", "gunta", "guntas"]:
        return area * HECTARES_PER_GUNTHA
    elif unit_lower in ["cent", "cents", "decimal", "decimals"]:
        return area * HECTARES_PER_CENT
    elif unit_lower in ["sq_m", "sqm", "square_meter", "square_meters", "m2"]:
        return area / SQ_METERS_PER_HECTARE
    elif unit_lower in ["sq_ft", "sqft", "square_feet", "square_foot", "ft2"]:
        return area / SQ_FEET_PER_HECTARE
    return area

def convert_area_from_hectares(area_ha: float, target_unit: str) -> float:
    unit_lower = target_unit.lower().strip()
    if unit_lower in ["acre", "acres", "ac"]:
        return area_ha * ACRES_PER_HECTARE
    elif unit_lower in ["bigha", "bighas", "bg"]:
        return area_ha * BIGHA_PER_HECTARE
    elif unit_lower in ["guntha", "gunthas", "gunta", "guntas"]:
        return area_ha * GUNTHA_PER_HECTARE
    elif unit_lower in ["cent", "cents", "decimal", "decimals"]:
        return area_ha * CENT_PER_HECTARE
    elif unit_lower in ["sq_m", "sqm", "square_meter", "square_meters", "m2"]:
        return area_ha * SQ_METERS_PER_HECTARE
    elif unit_lower in ["sq_ft", "sqft", "square_feet", "square_foot", "ft2"]:
        return area_ha * SQ_FEET_PER_HECTARE
    return area_ha

def get_all_area_units(area_ha: float, farm_total_ha: Optional[float] = None) -> dict:
    """Returns standardized land area converted across all standard agricultural units."""
    farm_share = round((area_ha / farm_total_ha * 100.0), 2) if farm_total_ha and farm_total_ha > 0 else round((area_ha / 10.0 * 100.0), 2)
    return {
        "hectare": round(area_ha, 4),
        "acre": round(area_ha * ACRES_PER_HECTARE, 3),
        "bigha": round(area_ha * BIGHA_PER_HECTARE, 3),
        "guntha": round(area_ha * GUNTHA_PER_HECTARE, 2),
        "cent": round(area_ha * CENT_PER_HECTARE, 2),
        "sq_meters": round(area_ha * SQ_METERS_PER_HECTARE, 1),
        "sq_feet": round(area_ha * SQ_FEET_PER_HECTARE, 0),
        "farm_share_pct": farm_share
    }

# Weight / Mass Conversions
# 1 tonne (metric ton) = 1,000 kg = 10 quintals
# 1 quintal = 100 kg
KG_PER_TONNE = 1000.0
QUINTALS_PER_TONNE = 10.0
KG_PER_QUINTAL = 100.0
LBS_PER_KG = 2.2046226

def convert_weight_to_tonnes(weight: float, unit: str) -> float:
    unit_lower = unit.lower().strip()
    if unit_lower in ["kg", "kilogram", "kilograms"]:
        return weight / KG_PER_TONNE
    elif unit_lower in ["quintal", "quintals", "qtl", "q"]:
        return weight / QUINTALS_PER_TONNE
    elif unit_lower in ["tonne", "tonnes", "t", "metric_ton"]:
        return weight
    elif unit_lower in ["lb", "lbs", "pound", "pounds"]:
        return (weight / LBS_PER_KG) / KG_PER_TONNE
    elif unit_lower in ["g", "gram", "grams"]:
        return weight / (KG_PER_TONNE * 1000.0)
    return weight

def convert_weight_to_kg(weight: float, unit: str) -> float:
    unit_lower = unit.lower().strip()
    if unit_lower in ["tonne", "tonnes", "t"]:
        return weight * KG_PER_TONNE
    elif unit_lower in ["quintal", "quintals", "qtl", "q"]:
        return weight * KG_PER_QUINTAL
    elif unit_lower in ["kg", "kilogram", "kilograms"]:
        return weight
    elif unit_lower in ["lb", "lbs", "pound", "pounds"]:
        return weight / LBS_PER_KG
    elif unit_lower in ["g", "gram", "grams"]:
        return weight / 1000.0
    return weight

def get_all_weight_units(weight_kg: float) -> dict:
    """Returns standardized weight converted across all agricultural and physical units."""
    return {
        "kg": round(weight_kg, 2),
        "quintals": round(weight_kg / KG_PER_QUINTAL, 2),
        "tonnes": round(weight_kg / KG_PER_TONNE, 3),
        "bags_50kg": round(weight_kg / 50.0, 1),
        "bags_25kg": round(weight_kg / 25.0, 1),
        "pounds_lbs": round(weight_kg * LBS_PER_KG, 1),
        "grams": round(weight_kg * 1000.0, 0)
    }

# Vegetable Oil Density Conversion
# Vegetable oils typically have density between 0.915 and 0.925 kg / litre (standard ~0.92 kg/L)
OIL_DENSITY_KG_PER_LITRE = 0.92

def convert_oil_tonnes_to_litres(oil_tonnes: float) -> float:
    """Converts metric tonnes of crude vegetable oil to approximate litres."""
    oil_kg = oil_tonnes * KG_PER_TONNE
    return oil_kg / OIL_DENSITY_KG_PER_LITRE

