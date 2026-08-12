from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_
from sqlalchemy.orm import Session

from app import models, oauth2, schemas
from app.database import get_db


router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"],
)


def booking_to_response(booking):
    return {
        "id": booking.id,
        "resource_id": booking.resource_id,
        "resource_name": booking.resource.name,
        "start_date": booking.start_date,
        "end_date": booking.end_date,
        "status": booking.status,
        "created_at": booking.created_at,
    }


@router.post(
    "",
    response_model=schemas.BookingResponse,
    status_code=201,
)
def create_booking(
    data: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    if data.end_date < data.start_date:
        raise HTTPException(
            status_code=400,
            detail="End date cannot be before start date",
        )

    resource = (
        db.query(models.Resource)
        .filter(models.Resource.id == data.resource_id)
        .first()
    )

    if resource is None:
        raise HTTPException(
            status_code=404,
            detail="Resource not found",
        )

    if not resource.available:
        raise HTTPException(
            status_code=400,
            detail="Resource is currently unavailable",
        )

    conflict = (
        db.query(models.Booking)
        .filter(
            and_(
                models.Booking.resource_id == data.resource_id,
                models.Booking.status == "active",
                models.Booking.start_date <= data.end_date,
                models.Booking.end_date >= data.start_date,
            )
        )
        .first()
    )

    if conflict:
        raise HTTPException(
            status_code=409,
            detail="Resource is already booked for the selected dates",
        )

    booking = models.Booking(
        user_id=current_user.id,
        resource_id=data.resource_id,
        start_date=data.start_date,
        end_date=data.end_date,
        status="active",
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return booking_to_response(booking)


@router.get(
    "/me",
    response_model=list[schemas.BookingResponse],
)
def my_bookings(
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    bookings = (
        db.query(models.Booking)
        .filter(models.Booking.user_id == current_user.id)
        .order_by(models.Booking.created_at.desc())
        .all()
    )

    return [
        booking_to_response(booking)
        for booking in bookings
    ]


@router.get(
    "/{booking_id}",
    response_model=schemas.BookingResponse,
)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    booking = (
        db.query(models.Booking)
        .filter(
            models.Booking.id == booking_id,
            models.Booking.user_id == current_user.id,
        )
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    return booking_to_response(booking)


@router.delete("/{booking_id}")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    booking = (
        db.query(models.Booking)
        .filter(
            models.Booking.id == booking_id,
            models.Booking.user_id == current_user.id,
        )
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    if booking.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Booking is already cancelled",
        )

    booking.status = "cancelled"

    db.commit()

    return {
        "message": "Booking cancelled successfully"
    }
