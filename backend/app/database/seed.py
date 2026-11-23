import os
import json
import logging
import pandas as pd
from app.database.connection import engine, SessionLocal, Base, ACTIVE_DB_TYPE
from app.database.models import (
    User, Dataset, Crop, ProductionData, SeedParameter, OilParameter,
    InputCost, MarketPrice, WeatherData
)
from app.core.security import get_password_hash
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

def seed_database():
    logger.info(f"Initializing database schema using active engine ({ACTIVE_DB_TYPE})...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Seed Users (Admin and Analyst)
        admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not admin_user:
            logger.info(f"Creating default admin user: {settings.ADMIN_EMAIL}")
            admin_user = User(
                name=settings.ADMIN_NAME,
                email=settings.ADMIN_EMAIL,
                password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                role="admin",
                is_active=True
            )
            db.add(admin_user)

        analyst_user = db.query(User).filter(User.email == "analyst@oilcrop.org").first()
        if not analyst_user:
            logger.info("Creating default analyst user: analyst@oilcrop.org")
            analyst_user = User(
                name="Agricultural Data Analyst",
                email="analyst@oilcrop.org",
                password_hash=get_password_hash("AnalystOilCrop2025!"),
                role="analyst",
                is_active=True
            )
            db.add(analyst_user)
        db.commit()

        # 2. Seed Datasets Metadata
        meta_file = os.path.join(DATA_DIR, "datasets_metadata.json")
        dataset_id_map = {}
        if os.path.exists(meta_file):
            with open(meta_file, "r", encoding="utf-8") as f:
                meta_list = json.load(f)
            for m in meta_list:
                ds = db.query(Dataset).filter(Dataset.name == m["name"]).first()
                if not ds:
                    ds = Dataset(
                        name=m["name"],
                        source=m["source"],
                        source_url=m["source_url"],
                        description=m["description"],
                        date_range=m["date_range"],
                        country_region=m.get("country_region", "India"),
                        units=m["units"],
                        data_fields=m["data_fields"],
                        record_count=m.get("record_count", 0),
                        is_active=True
                    )
                    db.add(ds)
                    db.commit()
                    db.refresh(ds)
                dataset_id_map[m["name"]] = ds.id
        logger.info(f"Datasets metadata registered: {len(dataset_id_map)}")

        # 3. Seed Crops Master
        crops_file = os.path.join(DATA_DIR, "crops_master.csv")
        crop_id_map = {}
        if os.path.exists(crops_file):
            df_crops = pd.read_csv(crops_file)
            for _, row in df_crops.iterrows():
                crop = db.query(Crop).filter(Crop.crop_name == row["crop_name"]).first()
                if not crop:
                    crop = Crop(
                        crop_name=row["crop_name"],
                        botanical_name=row.get("botanical_name"),
                        category=row.get("category", "Oilseed"),
                        description=row.get("description"),
                        standard_unit=row.get("standard_unit", "tonne")
                    )
                    db.add(crop)
                    db.commit()
                    db.refresh(crop)
                crop_id_map[row["crop_name"]] = crop.id
        logger.info(f"Crops registered: {len(crop_id_map)}")

        # 4. Seed Seed Requirements
        seeds_file = os.path.join(DATA_DIR, "seed_requirements.csv")
        if os.path.exists(seeds_file):
            df_seeds = pd.read_csv(seeds_file)
            for _, row in df_seeds.iterrows():
                c_id = crop_id_map.get(row["crop_name"])
                if c_id:
                    existing = db.query(SeedParameter).filter(SeedParameter.crop_id == c_id).first()
                    if not existing:
                        sp = SeedParameter(
                            crop_id=c_id,
                            recommended_seed_rate_kg_ha=float(row["recommended_seed_rate_kg_ha"]),
                            min_seed_rate_kg_ha=float(row["min_seed_rate_kg_ha"]) if pd.notna(row.get("min_seed_rate_kg_ha")) else None,
                            max_seed_rate_kg_ha=float(row["max_seed_rate_kg_ha"]) if pd.notna(row.get("max_seed_rate_kg_ha")) else None,
                            sowing_spacing=str(row.get("sowing_spacing", "")),
                            source=str(row.get("source", "")),
                            source_url=str(row.get("source_url", "")),
                            notes=str(row.get("notes", ""))
                        )
                        db.add(sp)
            db.commit()
            logger.info("Seed parameters seeded.")

        # 5. Seed Oil Extraction Parameters
        oil_file = os.path.join(DATA_DIR, "oil_parameters.csv")
        if os.path.exists(oil_file):
            df_oil = pd.read_csv(oil_file)
            for _, row in df_oil.iterrows():
                c_id = crop_id_map.get(row["crop_name"])
                if c_id:
                    existing = db.query(OilParameter).filter(OilParameter.crop_id == c_id).first()
                    if not existing:
                        op = OilParameter(
                            crop_id=c_id,
                            typical_oil_content_pct=float(row["typical_oil_content_pct"]),
                            extraction_rate_pct=float(row["extraction_rate_pct"]),
                            cake_meal_yield_pct=float(row["cake_meal_yield_pct"]),
                            extraction_method=str(row.get("extraction_method", "")),
                            primary_fatty_acids=str(row.get("primary_fatty_acids", "")),
                            source=str(row.get("source", "")),
                            source_url=str(row.get("source_url", "")),
                            notes=str(row.get("notes", ""))
                        )
                        db.add(op)
            db.commit()
            logger.info("Oil parameters seeded.")

        # 6. Seed Historical Production Data
        prod_file = os.path.join(DATA_DIR, "oilseeds_production_historical.csv")
        prod_ds_id = dataset_id_map.get("India Oilseeds Area, Production & Yield Statistics (2012-2024)", 1)
        if os.path.exists(prod_file):
            existing_count = db.query(ProductionData).count()
            if existing_count == 0:
                df_prod = pd.read_csv(prod_file)
                batch = []
                for _, row in df_prod.iterrows():
                    c_id = crop_id_map.get(row["crop_name"])
                    if c_id:
                        batch.append(ProductionData(
                            crop_id=c_id,
                            country=str(row.get("country", "India")),
                            region=str(row["region"]),
                            district=str(row.get("district", "")),
                            year=int(row["year"]),
                            season=str(row.get("season", "Whole Year")),
                            cultivated_area=float(row["cultivated_area"]),
                            production=float(row["production"]),
                            yield_per_ha=float(row["yield_per_ha"]),
                            dataset_id=prod_ds_id
                        ))
                db.bulk_save_objects(batch)
                db.commit()
                logger.info(f"Production data seeded: {len(batch)} records.")

        # 7. Seed Input Costs
        cost_file = os.path.join(DATA_DIR, "input_costs_cacp_historical.csv")
        cost_ds_id = dataset_id_map.get("CACP Cost of Cultivation of Principal Oilseed Crops", 2)
        if os.path.exists(cost_file):
            existing_cost_count = db.query(InputCost).count()
            if existing_cost_count == 0:
                df_cost = pd.read_csv(cost_file)
                batch = []
                for _, row in df_cost.iterrows():
                    c_id = crop_id_map.get(row["crop_name"])
                    if c_id:
                        batch.append(InputCost(
                            crop_id=c_id,
                            region=str(row["region"]),
                            year=int(row["year"]),
                            seed_cost_ha=float(row["seed_cost_ha"]),
                            fertilizer_cost_ha=float(row["fertilizer_cost_ha"]),
                            pesticide_cost_ha=float(row["pesticide_cost_ha"]),
                            labor_cost_ha=float(row["labor_cost_ha"]),
                            irrigation_cost_ha=float(row["irrigation_cost_ha"]),
                            machinery_cost_ha=float(row["machinery_cost_ha"]),
                            land_prep_cost_ha=float(row["land_prep_cost_ha"]),
                            harvesting_cost_ha=float(row["harvesting_cost_ha"]),
                            processing_transport_ha=float(row["processing_transport_ha"]),
                            other_operational_cost_ha=float(row["other_operational_cost_ha"]),
                            total_cost_ha=float(row["total_cost_ha"]),
                            cost_per_quintal=float(row["cost_per_quintal"]) if pd.notna(row.get("cost_per_quintal")) else None,
                            dataset_id=cost_ds_id
                        ))
                db.bulk_save_objects(batch)
                db.commit()
                logger.info(f"Input costs seeded: {len(batch)} records.")

        # 8. Seed Market Prices
        price_file = os.path.join(DATA_DIR, "market_prices_agmarknet_historical.csv")
        price_ds_id = dataset_id_map.get("Agmarknet & CACP Minimum Support Prices & Wholesale Mandi Prices", 3)
        if os.path.exists(price_file):
            existing_price_count = db.query(MarketPrice).count()
            if existing_price_count == 0:
                df_price = pd.read_csv(price_file)
                batch = []
                for _, row in df_price.iterrows():
                    c_id = crop_id_map.get(row["crop_name"])
                    if c_id:
                        batch.append(MarketPrice(
                            crop_id=c_id,
                            region=str(row["region"]),
                            year=int(row["year"]),
                            msp_price_quintal=float(row["msp_price_quintal"]) if pd.notna(row.get("msp_price_quintal")) else None,
                            wholesale_avg_price_quintal=float(row["wholesale_avg_price_quintal"]),
                            min_price_quintal=float(row["min_price_quintal"]) if pd.notna(row.get("min_price_quintal")) else None,
                            max_price_quintal=float(row["max_price_quintal"]) if pd.notna(row.get("max_price_quintal")) else None,
                            price_per_kg=float(row["price_per_kg"]),
                            unit=str(row.get("unit", "₹/quintal")),
                            dataset_id=price_ds_id
                        ))
                db.bulk_save_objects(batch)
                db.commit()
                logger.info(f"Market prices seeded: {len(batch)} records.")

        # 9. Seed Weather Data
        weather_file = os.path.join(DATA_DIR, "weather_agroclimatic_historical.csv")
        weather_ds_id = dataset_id_map.get("IMD Historical Agro-Climatic & Monsoon Rainfall Series", 6)
        if os.path.exists(weather_file):
            existing_weather_count = db.query(WeatherData).count()
            if existing_weather_count == 0:
                df_weather = pd.read_csv(weather_file)
                batch = []
                for _, row in df_weather.iterrows():
                    batch.append(WeatherData(
                        region=str(row["region"]),
                        year=int(row["year"]),
                        kharif_rainfall_mm=float(row["kharif_rainfall_mm"]) if pd.notna(row.get("kharif_rainfall_mm")) else None,
                        rabi_rainfall_mm=float(row["rabi_rainfall_mm"]) if pd.notna(row.get("rabi_rainfall_mm")) else None,
                        annual_rainfall_mm=float(row["annual_rainfall_mm"]),
                        mean_temp_c=float(row["mean_temp_c"]),
                        irrigation_coverage_pct=float(row["irrigation_coverage_pct"]) if pd.notna(row.get("irrigation_coverage_pct")) else None,
                        dataset_id=weather_ds_id
                    ))
                db.bulk_save_objects(batch)
                db.commit()
                logger.info(f"Weather data seeded: {len(batch)} records.")

        logger.info("Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        logger.error(f"Error during seeding: {e}", exc_info=True)
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
