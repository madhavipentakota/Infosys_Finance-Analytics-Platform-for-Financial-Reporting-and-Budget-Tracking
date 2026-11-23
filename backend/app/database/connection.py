import logging
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

# Attempt to connect to PostgreSQL; fallback to SQLite if connection fails
engine = None
ACTIVE_DB_TYPE = "postgresql"

try:
    # Try PostgreSQL first
    test_engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        connect_args={"connect_timeout": 3} if "psycopg" in settings.DATABASE_URL else {}
    )
    # Test connection
    with test_engine.connect() as conn:
        pass
    engine = test_engine
    logger.info("Successfully connected to primary PostgreSQL database.")
except Exception as e:
    logger.warning(
        f"PostgreSQL connection failed ({e}). Falling back to SQLite database ({settings.FALLBACK_SQLITE_URL}) for persistent local storage."
    )
    ACTIVE_DB_TYPE = "sqlite"
    engine = create_engine(
        settings.FALLBACK_SQLITE_URL,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )

    # Enable foreign keys for SQLite
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
