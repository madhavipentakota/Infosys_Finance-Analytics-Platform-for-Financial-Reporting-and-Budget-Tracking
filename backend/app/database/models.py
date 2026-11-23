from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from app.database.connection import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="analyst", nullable=False)  # "admin" or "analyst"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    scenarios = relationship("AnalysisScenario", back_populates="user", cascade="all, delete-orphan")


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, unique=True)
    source = Column(String(150), nullable=False)
    source_url = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    date_range = Column(String(50), nullable=False)
    country_region = Column(String(100), default="India")
    units = Column(String(100), nullable=False)
    data_fields = Column(Text, nullable=False)
    record_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    production_records = relationship("ProductionData", back_populates="dataset", cascade="all, delete-orphan")
    cost_records = relationship("InputCost", back_populates="dataset", cascade="all, delete-orphan")
    price_records = relationship("MarketPrice", back_populates="dataset", cascade="all, delete-orphan")


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    crop_name = Column(String(80), unique=True, index=True, nullable=False)
    botanical_name = Column(String(120), nullable=True)
    category = Column(String(50), default="Oilseed", nullable=False)  # e.g., Kharif Oilseed, Rabi Oilseed
    description = Column(Text, nullable=True)
    standard_unit = Column(String(30), default="tonne", nullable=False)
    created_at = Column(DateTime, default=utcnow)

    production_records = relationship("ProductionData", back_populates="crop", cascade="all, delete-orphan")
    seed_parameters = relationship("SeedParameter", back_populates="crop", uselist=False, cascade="all, delete-orphan")
    oil_parameters = relationship("OilParameter", back_populates="crop", uselist=False, cascade="all, delete-orphan")
    cost_records = relationship("InputCost", back_populates="crop", cascade="all, delete-orphan")
    price_records = relationship("MarketPrice", back_populates="crop", cascade="all, delete-orphan")
    scenarios = relationship("AnalysisScenario", back_populates="crop")


class ProductionData(Base):
    __tablename__ = "production_data"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False, index=True)
    country = Column(String(60), default="India")
    region = Column(String(80), nullable=False, index=True)  # State or Agro-climatic zone
    district = Column(String(80), nullable=True)
    year = Column(Integer, nullable=False, index=True)
    season = Column(String(40), default="Whole Year")  # Kharif / Rabi / Whole Year
    cultivated_area = Column(Float, nullable=False)  # Hectares
    production = Column(Float, nullable=False)  # Tonnes
    yield_per_ha = Column(Float, nullable=False)  # Tonnes / Hectare
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)
    created_at = Column(DateTime, default=utcnow)

    crop = relationship("Crop", back_populates="production_records")
    dataset = relationship("Dataset", back_populates="production_records")

    __table_args__ = (
        Index("idx_prod_crop_reg_yr", "crop_id", "region", "year"),
    )


class SeedParameter(Base):
    __tablename__ = "seed_parameters"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False, unique=True)
    recommended_seed_rate_kg_ha = Column(Float, nullable=False)
    min_seed_rate_kg_ha = Column(Float, nullable=True)
    max_seed_rate_kg_ha = Column(Float, nullable=True)
    sowing_spacing = Column(String(80), nullable=True)
    source = Column(String(200), nullable=False)
    source_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)

    crop = relationship("Crop", back_populates="seed_parameters")


class OilParameter(Base):
    __tablename__ = "oil_parameters"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False, unique=True)
    typical_oil_content_pct = Column(Float, nullable=False)  # e.g. 19.5%
    extraction_rate_pct = Column(Float, nullable=False)       # e.g. 18.5%
    cake_meal_yield_pct = Column(Float, nullable=False)       # e.g. 79.5%
    extraction_method = Column(String(100), default="Mechanical Expeller & Solvent Extraction")
    primary_fatty_acids = Column(String(200), nullable=True)
    source = Column(String(200), nullable=False)
    source_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)

    crop = relationship("Crop", back_populates="oil_parameters")


class InputCost(Base):
    __tablename__ = "input_costs"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False, index=True)
    region = Column(String(80), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    seed_cost_ha = Column(Float, default=0.0)
    fertilizer_cost_ha = Column(Float, default=0.0)
    pesticide_cost_ha = Column(Float, default=0.0)
    labor_cost_ha = Column(Float, default=0.0)
    irrigation_cost_ha = Column(Float, default=0.0)
    machinery_cost_ha = Column(Float, default=0.0)
    land_prep_cost_ha = Column(Float, default=0.0)
    harvesting_cost_ha = Column(Float, default=0.0)
    processing_transport_ha = Column(Float, default=0.0)
    other_operational_cost_ha = Column(Float, default=0.0)
    total_cost_ha = Column(Float, nullable=False)  # Sum of operational costs
    cost_per_quintal = Column(Float, nullable=True)  # Cost of production per quintal
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)

    crop = relationship("Crop", back_populates="cost_records")
    dataset = relationship("Dataset", back_populates="cost_records")

    __table_args__ = (
        Index("idx_cost_crop_reg_yr", "crop_id", "region", "year"),
    )


class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False, index=True)
    region = Column(String(80), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    msp_price_quintal = Column(Float, nullable=True)  # Minimum Support Price in ₹/quintal
    wholesale_avg_price_quintal = Column(Float, nullable=False)  # Average mandi wholesale price in ₹/quintal
    min_price_quintal = Column(Float, nullable=True)
    max_price_quintal = Column(Float, nullable=True)
    price_per_kg = Column(Float, nullable=False)  # wholesale_avg_price_quintal / 100
    unit = Column(String(30), default="₹/quintal")
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)

    crop = relationship("Crop", back_populates="price_records")
    dataset = relationship("Dataset", back_populates="price_records")

    __table_args__ = (
        Index("idx_price_crop_reg_yr", "crop_id", "region", "year"),
    )


class WeatherData(Base):
    __tablename__ = "weather_data"

    id = Column(Integer, primary_key=True, index=True)
    region = Column(String(80), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    kharif_rainfall_mm = Column(Float, nullable=True)
    rabi_rainfall_mm = Column(Float, nullable=True)
    annual_rainfall_mm = Column(Float, nullable=False)
    mean_temp_c = Column(Float, nullable=False)
    irrigation_coverage_pct = Column(Float, nullable=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)

    __table_args__ = (
        Index("idx_weather_reg_yr", "region", "year"),
    )


class AnalysisScenario(Base):
    __tablename__ = "analysis_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(120), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    region = Column(String(80), nullable=False)
    year = Column(Integer, nullable=False)
    land_area = Column(Float, nullable=False)
    land_unit = Column(String(20), default="hectare")
    calculated_yield = Column(Float, nullable=False)
    expected_production = Column(Float, nullable=False)
    seed_required = Column(Float, nullable=False)
    estimated_oil = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)
    expected_revenue = Column(Float, nullable=False)
    net_profit = Column(Float, nullable=False)
    roi_percentage = Column(Float, nullable=False)
    break_even_price = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="scenarios")
    crop = relationship("Crop", back_populates="scenarios")
