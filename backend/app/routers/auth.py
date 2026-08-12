from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, oauth2, schemas, security
from app.database import get_db


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=schemas.UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(models.User)
        .filter(models.User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists",
        )

    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=security.hash_password(user.password),
        role="user",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post(
    "/login",
    response_model=schemas.TokenResponse,
)
def login(
    user: schemas.UserLogin,
    db: Session = Depends(get_db),
):
    db_user = (
        db.query(models.User)
        .filter(models.User.email == user.email)
        .first()
    )

    if db_user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    if not security.verify_password(
        user.password,
        db_user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    token = oauth2.create_access_token(
        {"user_id": db_user.id}
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": db_user,
    }


@router.get(
    "/me",
    response_model=schemas.UserResponse,
)
def me(
    current_user=Depends(oauth2.get_current_user),
):
    return current_user
