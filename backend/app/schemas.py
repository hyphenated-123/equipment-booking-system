from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class AdminRegister(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)
    admin_code: str = Field(min_length=1)


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    name: str | None = None
    role: str | None = None

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class ResourceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    category: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=500)
    quantity: int = Field(default=1, ge=1)


class ResourceResponse(ResourceCreate):
    id: int
    total: int
    rented: int
    available: int
    is_active: bool
    image_url: str | None = None
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class CategoryResponse(BaseModel):
    id: int
    name: str
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class BookingItemCreate(BaseModel):
    resource_id: int
    quantity: int = Field(default=1, ge=1)


class BookingCreate(BaseModel):
    start_date: date
    end_date: date
    items: list[BookingItemCreate]


class BookingItemResponse(BaseModel):
    id: int
    resource_id: int
    resource_name: str
    quantity: int

    model_config = ConfigDict(from_attributes=True)


class BookingResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    start_date: date
    end_date: date
    status: str
    items: list[BookingItemResponse]
    created_at: datetime | None = None


class BookingUpdate(BaseModel):
    status: str | None = None
