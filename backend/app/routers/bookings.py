from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, func
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
        "user_id": booking.user_id,
        "user_name": booking.user.name,
        "start_date": booking.start_date,
        "end_date": booking.end_date,
        "start_time": booking.start_time,
        "end_time": booking.end_time,
        "status": booking.status,
        "items": [
            {
                "id": item.id,
                "resource_id": item.resource_id,
                "resource_name": item.resource.name,
                "quantity": item.quantity,
            }
            for item in booking.items
        ],
        "created_at": booking.created_at,
    }


def rented_quantity(db, resource_id, start_date, end_date):
    rented = (
        db.query(func.sum(models.BookingItem.quantity))
        .join(
            models.Booking,
            models.Booking.id == models.BookingItem.booking_id,
        )
        .filter(
            models.BookingItem.resource_id == resource_id,
            models.Booking.status == "active",
            models.Booking.start_date <= end_date,
            models.Booking.end_date >= start_date,
        )
        .scalar()
    )

    return int(rented) if rented else 0


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

    if (
        data.start_time
        and data.end_time
        and data.start_date == data.end_date
        and data.end_time <= data.start_time
    ):
        raise HTTPException(
            status_code=400,
            detail="End time must be after start time",
        )

    if not data.items:
        raise HTTPException(
            status_code=400,
            detail="Booking must contain at least one item",
        )

    requested = {}

    for item in data.items:
        if item.quantity < 1:
            raise HTTPException(
                status_code=400,
                detail="Quantity must be at least 1",
            )

        requested[item.resource_id] = (
            requested.get(item.resource_id, 0) + item.quantity
        )

    for resource_id, quantity in requested.items():
        resource = (
            db.query(models.Resource)
            .filter(models.Resource.id == resource_id)
            .first()
        )

        if resource is None:
            raise HTTPException(
                status_code=404,
                detail=f"Resource {resource_id} not found",
            )

        if not resource.available:
            raise HTTPException(
                status_code=400,
                detail=f"Resource '{resource.name}' is unavailable",
            )

        rented = rented_quantity(
            db,
            resource_id,
            data.start_date,
            data.end_date,
        )

        if resource.quantity - rented < quantity:
            raise HTTPException(
                status_code=409,
                detail=(
                    f"Not enough of '{resource.name}' available "
                    "for the selected dates"
                ),
            )

    booking = models.Booking(
        user_id=current_user.id,
        start_date=data.start_date,
        end_date=data.end_date,
        start_time=data.start_time,
        end_time=data.end_time,
        status="active",
    )

    db.add(booking)
    db.flush()

    for resource_id, quantity in requested.items():
        db.add(
            models.BookingItem(
                booking_id=booking.id,
                resource_id=resource_id,
                quantity=quantity,
            )
        )

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

    return [booking_to_response(booking) for booking in bookings]


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
