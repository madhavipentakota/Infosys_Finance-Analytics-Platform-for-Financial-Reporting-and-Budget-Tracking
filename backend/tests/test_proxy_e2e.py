import urllib.request
import json

def test_endpoints():
    base = "http://localhost:5173/api"
    def post(path, data=None):
        url = f"{base}{path}"
        req_data = json.dumps(data).encode() if data else b""
        req = urllib.request.Request(
            url,
            data=req_data,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())

    def get(path):
        with urllib.request.urlopen(f"{base}{path}") as resp:
            return json.loads(resp.read().decode())

    print("1. Testing KPIs:", get("/production/summary-kpis")["total_crops_analyzed"], "crops analyzed.")
    print("2. Testing Trends:", len(get("/production/trends?crop_name=Soybean")["historical_series"]), "historical years.")
    print("3. Testing By-Region:", len(get("/production/by-region?crop_name=Soybean")), "regions analyzed.")
    print("4. Testing Cost Summary:", get("/costs/summary?crop_name=Soybean&region=Madhya%20Pradesh")["total_cost_ha"], "INR/ha total cost.")
    print("5. Testing Market Trends:", len(get("/market/trends?crop_name=Soybean&region=Madhya%20Pradesh")["historical_series"]), "market trend points.")
    print("6. Testing Market Prices:", len(get("/market/prices?limit=5")), "APMC price records.")
    print("7. Testing Seed Calculator:", post("/analytics/seed-requirement", {"crop_name": "Soybean", "land_area": 10, "unit": "hectare"})["total_seed_required_kg"], "kg seed required.")
    print("8. Testing Oil Calculator:", post("/analytics/oil-production", {"crop_name": "Soybean", "land_area": 10, "land_unit": "hectare"})["estimated_oil_tonnes"], "tonnes oil.")
    print("9. Testing Profitability:", post("/analytics/profitability", {"crop_name": "Soybean", "region": "Madhya Pradesh", "land_area": 10, "land_unit": "hectare"})["net_profit"], "net profit.")
    print("10. Testing Break-Even:", post("/analytics/break-even?crop_name=Soybean&region=Madhya%20Pradesh&land_area=10")["break_even_price_per_kg"], "INR/kg break-even price.")
    print("11. Testing Sensitivity:", len(post("/analytics/sensitivity", {"crop_name": "Soybean", "region": "Madhya Pradesh", "land_area": 10})["price_sensitivity"]), "sensitivity price points.")
    print("12. Testing Crop Comparison:", len(get("/analytics/crop-comparison")["crops"]), "crops compared.")
    print("13. Testing ML Yield Model:", post("/ml/yield-prediction", {"crop_name": "Soybean", "region": "Madhya Pradesh", "cultivated_area": 10, "rainfall_mm": 980, "temperature_c": 28.5, "irrigation_coverage_pct": 35, "year": 2025})["predicted_yield_t_ha"], "t/ha predicted yield.")
    print("14. Testing ML Price Model:", post("/ml/price-prediction", {"crop_name": "Soybean", "region": "Madhya Pradesh", "target_year": 2025})["predicted_price_per_kg"], "INR/kg predicted price.")
    print("15. Testing Insights Engine:", len(get("/analytics/insights")), "insights generated.")
    print("16. Testing Data Quality Audit:", get("/datasets/quality-report")["overall_health"])
    print("\n>>> ALL 16 CORE ENDPOINTS RETURNED 200 SUCCESS WITH REAL DATA OVER VITE PROXY! <<<")

if __name__ == "__main__":
    test_endpoints()
