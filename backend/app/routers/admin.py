from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, oauth2
from app.database import get_db


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    oauth2.admin_only(current_user)

    return {
        "users": db.query(models.User).count(),
        "resources": db.query(models.Resource).count(),
        "bookings": db.query(models.Booking).count(),
        "active_bookings": (
            db.query(models.Booking)
            .filter(models.Booking.status == "active")
            .count()
        ),
        "available_resources": (
            db.query(models.Resource)
            .filter(models.Resource.available.is_(True))
            .count()
        ),
    }


@router.get("/users")
def get_users(
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    oauth2.admin_only(current_user)

    return db.query(models.User).all()


@router.get("/bookings")
def get_all_bookings(
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    oauth2.admin_only(current_user)

    bookings = (
        db.query(models.Booking)
        .order_by(models.Booking.created_at.desc())
        .all()
    )

    return [
        {
            "id": booking.id,
            "user_id": booking.user_id,
            "user_name": booking.user.name,
            "resource_id": booking.resource_id,
            "resource_name": booking.resource.name,
            "start_date": booking.start_date,
            "end_date": booking.end_date,
            "status": booking.status,
        }
        for booking in bookings
    ]
