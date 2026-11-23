import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.connection import engine, Base, ACTIVE_DB_TYPE
from app.database.seed import seed_database
from app.routers import (
    auth, crops, production, costs, market, analytics, predictions, datasets, reports
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("oilcrop")

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Data-Driven Oilseed Production, Cost, Profitability & Prediction Platform based on verified real-world agricultural datasets.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error occurred. Please verify request parameters or check server logs."}
    )

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(crops.router, prefix=settings.API_V1_STR)
app.include_router(production.router, prefix=settings.API_V1_STR)
app.include_router(costs.router, prefix=settings.API_V1_STR)
app.include_router(market.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(predictions.router, prefix=settings.API_V1_STR)
app.include_router(datasets.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def on_startup():
    logger.info(f"OilCrop Intelligence backend started. Active DB: {ACTIVE_DB_TYPE}")
    # Verify database has seed data, run seed if empty
    try:
        from app.database.models import Crop
        from app.database.connection import SessionLocal
        db = SessionLocal()
        crop_count = db.query(Crop).count()
        db.close()
        if crop_count == 0:
            logger.info("Database empty on startup. Triggering initial seed...")
            seed_database()
    except Exception as e:
        logger.warning(f"Startup check notice: {e}")

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "status": "OPERATIONAL",
        "database": ACTIVE_DB_TYPE,
        "docs": "/docs",
        "api_v1": settings.API_V1_STR,
        "philosophy": "REAL-WORLD OILSEED AGRICULTURAL DATA → DATA ANALYSIS → PRODUCTION → OIL OUTPUT → COST → MARKET → REVENUE → PROFIT → ROI → RISK → MACHINE LEARNING"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": ACTIVE_DB_TYPE}
