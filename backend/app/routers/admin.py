from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, oauth2, schemas
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


@router.get("/users", response_model=list[schemas.UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    oauth2.admin_only(current_user)

    return db.query(models.User).all()


@router.put(
    "/users/{user_id}",
    response_model=schemas.UserResponse,
)
def update_user(
    user_id: int,
    data: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    oauth2.admin_only(current_user)

    user = (
        db.query(models.User)
        .filter(models.User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if data.name is not None:
        user.name = data.name

    if data.role is not None:
        valid_roles = {"user", "admin"}
        if data.role not in valid_roles:
            raise HTTPException(
                status_code=400,
                detail="Invalid role",
            )
        user.role = data.role

    db.commit()
    db.refresh(user)

    return user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    oauth2.admin_only(current_user)

    if current_user.id == user_id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account",
        )

    user = (
        db.query(models.User)
        .filter(models.User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    db.delete(user)
    db.commit()

    return {"message": "User deleted successfully"}


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


@router.patch(
    "/bookings/{booking_id}",
    response_model=schemas.BookingResponse,
)
def update_booking(
    booking_id: int,
    data: schemas.BookingUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    oauth2.admin_only(current_user)

    booking = (
        db.query(models.Booking)
        .filter(models.Booking.id == booking_id)
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    if data.status is not None:
        valid_statuses = {"active", "cancelled", "completed"}
        if data.status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail="Invalid booking status",
            )
        booking.status = data.status

    db.commit()
    db.refresh(booking)

    return {
        "id": booking.id,
        "resource_id": booking.resource_id,
        "resource_name": booking.resource.name,
        "start_date": booking.start_date,
        "end_date": booking.end_date,
        "status": booking.status,
        "created_at": booking.created_at,
    }


@router.delete("/bookings/{booking_id}")
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    oauth2.admin_only(current_user)

    booking = (
        db.query(models.Booking)
        .filter(models.Booking.id == booking_id)
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    db.delete(booking)
    db.commit()

    return {"message": "Booking deleted successfully"}
