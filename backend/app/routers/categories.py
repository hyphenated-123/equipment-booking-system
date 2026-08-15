from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, oauth2, schemas
from app.database import get_db


router = APIRouter(
    prefix="/categories",
    tags=["Categories"],
)


@router.get(
    "",
    response_model=list[schemas.CategoryResponse],
)
def get_categories(db: Session = Depends(get_db)):
    return (
        db.query(models.Category)
        .order_by(models.Category.name)
        .all()
    )


@router.post(
    "",
    response_model=schemas.CategoryResponse,
    status_code=201,
)
def create_category(
    data: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    oauth2.admin_only(current_user)

    existing = (
        db.query(models.Category)
        .filter(models.Category.name == data.name)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Category already exists",
        )

    category = models.Category(name=data.name)

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


@router.delete(
    "/{category_id}",
)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    oauth2.admin_only(current_user)

    category = (
        db.query(models.Category)
        .filter(models.Category.id == category_id)
        .first()
    )

    if category is None:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )

    linked = (
        db.query(models.Resource)
        .filter(models.Resource.category == category.name)
        .first()
    )

    if linked:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete a category that is used by resources",
        )

    db.delete(category)
    db.commit()

    return {"message": "Category deleted successfully"}
