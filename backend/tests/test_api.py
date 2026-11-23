import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPERATIONAL"
    assert "OilCrop" in data["platform"]

def test_auth_login_admin():
    response = client.post("/api/auth/login", json={
        "email": "admin@oilcrop.org",
        "password": "AdminOilCrop2025!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

def test_crops_list():
    response = client.get("/api/crops")
    assert response.status_code == 200
    crops = response.json()
    assert len(crops) >= 8
    crop_names = [c["crop_name"] for c in crops]
    assert "Soybean" in crop_names
    assert "Groundnut" in crop_names
    assert "Rapeseed & Mustard" in crop_names

def test_production_summary_kpis():
    response = client.get("/api/production/summary-kpis?crop_name=Soybean")
    assert response.status_code == 200
    kpis = response.json()
    assert kpis["total_production_tonnes"] > 0
    assert kpis["average_yield_t_ha"] > 0
    assert "data_source" in kpis

def test_seed_calculator():
    response = client.post("/api/analytics/seed-requirement", json={
        "crop_name": "Soybean",
        "land_area": 10.0,
        "unit": "hectare"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["data_status"] == "AVAILABLE"
    assert data["seed_rate_kg_ha"] == 70.0
    assert data["total_seed_required_kg"] == 700.0

def test_oil_calculator():
    response = client.post("/api/analytics/oil-production", json={
        "crop_name": "Soybean",
        "land_area": 10.0,
        "production_tonnes": 15.0
    })
    assert response.status_code == 200
    data = response.json()
    assert data["extraction_rate_pct"] == 18.5
    assert abs(data["estimated_oil_tonnes"] - 2.775) < 0.02
    assert data["estimated_oil_litres"] > 0

def test_profitability_calculation():
    response = client.post("/api/analytics/profitability", json={
        "crop_name": "Soybean",
        "region": "Madhya Pradesh",
        "year": 2024,
        "land_area": 10.0,
        "land_unit": "hectare"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["total_cost"] > 0
    assert data["gross_revenue"] > 0
    assert "roi_percentage" in data
    assert "break_even_price_per_kg" in data
    assert "data_sources" in data

def test_break_even():
    response = client.post("/api/analytics/break-even?crop_name=Soybean&region=Madhya Pradesh&land_area=10.0&year=2024")
    assert response.status_code == 200
    data = response.json()
    assert data["break_even_price_per_kg"] > 0
    assert len(data["chart_points"]) > 0

def test_sensitivity_risk():
    response = client.post("/api/analytics/sensitivity", json={
        "crop_name": "Soybean",
        "region": "Madhya Pradesh",
        "land_area": 10.0
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["price_sensitivity"]) > 0
    assert len(data["tornado_factors"]) > 0

def test_ml_yield_prediction():
    response = client.post("/api/ml/yield-prediction", json={
        "crop_name": "Soybean",
        "region": "Madhya Pradesh",
        "cultivated_area": 25.0,
        "year": 2025
    })
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_yield_t_ha"] > 0
    assert data["predicted_total_production_tonnes"] > 0
    assert "model_metrics" in data
    assert "feature_importance" in data

def test_ml_price_prediction():
    response = client.post("/api/ml/price-prediction", json={
        "crop_name": "Soybean",
        "region": "Madhya Pradesh",
        "target_year": 2025
    })
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_price_per_kg"] > 0
    assert data["predicted_wholesale_price_quintal"] > 0

def test_datasets_quality_report():
    response = client.get("/api/datasets/quality-report")
    assert response.status_code == 200
    data = response.json()
    assert data["total_datasets"] >= 6
    assert data["total_records_ingested"] > 1000

def test_pdf_report_generation():
    response = client.post("/api/reports/pdf", json={
        "crop_name": "Soybean",
        "region": "Madhya Pradesh",
        "year": 2024,
        "land_area_ha": 15.0,
        "crop_production_tonnes": 18.5,
        "yield_t_ha": 1.23,
        "seed_required_kg": 1050.0,
        "estimated_oil_tonnes": 3.42,
        "total_cost": 650000.0,
        "gross_revenue": 925000.0,
        "net_profit": 275000.0,
        "roi_percentage": 42.3,
        "market_price_per_kg": 50.0,
        "break_even_price_per_kg": 35.1
    })
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 1000

def test_excel_report_generation():
    response = client.post("/api/reports/excel", json={
        "crop_name": "Soybean",
        "region": "Madhya Pradesh",
        "year": 2024,
        "land_area_ha": 15.0,
        "crop_production_tonnes": 18.5,
        "yield_t_ha": 1.23,
        "seed_required_kg": 1050.0,
        "estimated_oil_tonnes": 3.42,
        "total_cost": 650000.0,
        "gross_revenue": 925000.0,
        "net_profit": 275000.0,
        "roi_percentage": 42.3,
        "market_price_per_kg": 50.0,
        "break_even_price_per_kg": 35.1
    })
    assert response.status_code == 200
    assert "spreadsheet" in response.headers["content-type"]
    assert len(response.content) > 1000
