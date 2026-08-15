from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app import models
from app.routers import auth, resources, bookings, admin, categories


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Equipment Booking System API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/api")
app.include_router(resources.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(categories.router, prefix="/api")


@app.get("/")
def home():
    return {
        "message": "Equipment Booking API is running"
    }
