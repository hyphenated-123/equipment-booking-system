from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models, oauth2, schemas
from app.database import get_db


router = APIRouter(
    prefix="/resources",
    tags=["Resources"],
)


def serialize_resource(resource, rented=0):
    total = resource.quantity
    available_units = max(0, total - rented) if resource.available else 0

    return {
        "id": resource.id,
        "name": resource.name,
        "category": resource.category,
        "description": resource.description,
        "quantity": total,
        "total": total,
        "rented": rented,
        "available": available_units,
        "is_active": resource.available,
        "created_at": resource.created_at,
    }


def rented_counts(db, resources):
    ids = [resource.id for resource in resources]
    result = {}

    if ids:
        rows = (
            db.query(
                models.BookingItem.resource_id,
                func.sum(models.BookingItem.quantity),
            )
            .join(
                models.Booking,
                models.Booking.id == models.BookingItem.booking_id,
            )
            .filter(
                models.BookingItem.resource_id.in_(ids),
                models.Booking.status == "active",
            )
            .group_by(models.BookingItem.resource_id)
            .all()
        )

        result = {resource_id: int(count) for resource_id, count in rows}

    return result


def rented_for(db, resource_id):
    rented = (
        db.query(func.sum(models.BookingItem.quantity))
        .join(
            models.Booking,
            models.Booking.id == models.BookingItem.booking_id,
        )
        .filter(
            models.BookingItem.resource_id == resource_id,
            models.Booking.status == "active",
        )
        .scalar()
    )

    return int(rented) if rented else 0


@router.get(
    "",
    response_model=list[schemas.ResourceResponse],
)
def get_resources(
    search: str | None = None,
    category: str | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(models.Resource)

    if search:
        keyword = f"%{search}%"
        query = query.filter(
            (models.Resource.name.ilike(keyword))
            | (models.Resource.description.ilike(keyword))
        )

    if category and category != "all":
        query = query.filter(
            models.Resource.category == category
        )

    offset = (page - 1) * limit

    resources = (
        query
        .order_by(models.Resource.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    rented = rented_counts(db, resources)

    return [
        serialize_resource(resource, rented.get(resource.id, 0))
        for resource in resources
    ]


@router.get(
    "/{resource_id}",
    response_model=schemas.ResourceResponse,
)
def get_resource(
    resource_id: int,
    db: Session = Depends(get_db),
):
    resource = (
        db.query(models.Resource)
        .filter(models.Resource.id == resource_id)
        .first()
    )

    if resource is None:
        raise HTTPException(
            status_code=404,
            detail="Resource not found",
        )

    rented = rented_for(db, resource_id)

    return serialize_resource(resource, rented)


@router.post(
    "",
    response_model=schemas.ResourceResponse,
    status_code=201,
)
def create_resource(
    data: schemas.ResourceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    oauth2.admin_only(current_user)

    resource = models.Resource(
        name=data.name,
        category=data.category,
        description=data.description,
        quantity=data.quantity,
        available=True,
    )

    db.add(resource)
    db.commit()
    db.refresh(resource)

    return serialize_resource(resource)


@router.put(
    "/{resource_id}",
    response_model=schemas.ResourceResponse,
)
def update_resource(
    resource_id: int,
    data: schemas.ResourceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    oauth2.admin_only(current_user)

    resource = (
        db.query(models.Resource)
        .filter(models.Resource.id == resource_id)
        .first()
    )

    if resource is None:
        raise HTTPException(
            status_code=404,
            detail="Resource not found",
        )

    resource.name = data.name
    resource.category = data.category
    resource.description = data.description
    resource.quantity = data.quantity

    db.commit()
    db.refresh(resource)

    rented = rented_for(db, resource_id)

    return serialize_resource(resource, rented)


@router.delete(
    "/{resource_id}",
)
def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    oauth2.admin_only(current_user)

    resource = (
        db.query(models.Resource)
        .filter(models.Resource.id == resource_id)
        .first()
    )

    if resource is None:
        raise HTTPException(
            status_code=404,
            detail="Resource not found",
        )

    db.delete(resource)
    db.commit()

    return {"message": "Resource deleted successfully"}


@router.patch(
    "/{resource_id}/availability",
    response_model=schemas.ResourceResponse,
)
def update_availability(
    resource_id: int,
    available: bool,
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    oauth2.admin_only(current_user)

    resource = (
        db.query(models.Resource)
        .filter(models.Resource.id == resource_id)
        .first()
    )

    if resource is None:
        raise HTTPException(
            status_code=404,
            detail="Resource not found",
        )

    resource.available = available

    db.commit()
    db.refresh(resource)

    rented = rented_for(db, resource_id)

    return serialize_resource(resource, rented)
