from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import models, oauth2, schemas
from app.database import get_db


router = APIRouter(
    prefix="/resources",
    tags=["Resources"],
)


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

    return (
        query
        .order_by(models.Resource.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


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

    return resource


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

    return resource


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

    return resource


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

    return resource
