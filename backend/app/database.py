from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import DATABASE_URL

Base = declarative_base()


def get_engine():
    database_url = DATABASE_URL 

    if database_url.startswith("sqlite"):
        return create_engine(
            database_url,
            echo=True,
            connect_args={"check_same_thread": False},
        )

    return create_engine(database_url, echo=True, pool_pre_ping=True)


engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as exc:
        print(f"Database initialization skipped: {exc}")


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
