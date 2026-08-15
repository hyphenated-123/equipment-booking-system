"""
Test suite for admin login, registration, and full CRUD management of
resources, users, and bookings. Uses the project's actual MySQL database.
"""
import logging
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app import models
from app.database import SessionLocal, engine

sys.path.pop(0)

logging.disable(logging.CRITICAL)

ADMIN_CODE = os.getenv("ADMIN_REGISTRATION_CODE", "admin-insecure-code-change-me")

ADMIN_EMAIL = "testadmin@example.com"
ADMIN_PASSWORD = "adminpass123"
USER_EMAIL = "testuser@example.com"
USER_PASSWORD = "userpass123"


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Ensure tables exist and clean up leftover test data."""
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    test_users = (
        db.query(models.User)
        .filter(models.User.email.in_([ADMIN_EMAIL, USER_EMAIL]))
        .all()
    )
    user_ids = [u.id for u in test_users]
    if user_ids:
        db.query(models.Booking).filter(
            models.Booking.user_id.in_(user_ids)
        ).delete(synchronize_session="fetch")
    db.query(models.User).filter(
        models.User.email.in_([ADMIN_EMAIL, USER_EMAIL])
    ).delete(synchronize_session="fetch")
    db.commit()
    db.close()
    yield


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


def test_register_user_success(client):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Test User",
            "email": USER_EMAIL,
            "password": USER_PASSWORD,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == USER_EMAIL
    assert data["role"] == "user"


def test_register_admin_with_correct_code(client):
    response = client.post(
        "/api/auth/register/admin",
        json={
            "name": "Test Admin",
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
            "admin_code": ADMIN_CODE,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == ADMIN_EMAIL
    assert data["role"] == "admin"


def test_register_admin_with_wrong_code(client):
    response = client.post(
        "/api/auth/register/admin",
        json={
            "name": "Bad Admin",
            "email": "badadmin@example.com",
            "password": ADMIN_PASSWORD,
            "admin_code": "wrong-code",
        },
    )
    assert response.status_code == 403


def test_register_admin_duplicate_email(client):
    response = client.post(
        "/api/auth/register/admin",
        json={
            "name": "Duplicate Admin",
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
            "admin_code": ADMIN_CODE,
        },
    )
    assert response.status_code == 400


def test_login_user(client):
    response = client.post(
        "/api/auth/login",
        json={"email": USER_EMAIL, "password": USER_PASSWORD},
    )
    assert response.status_code == 200
    assert response.json()["user"]["role"] == "user"


def test_login_admin(client):
    response = client.post(
        "/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert response.status_code == 200
    assert response.json()["user"]["role"] == "admin"


def test_login_invalid_credentials(client):
    response = client.post(
        "/api/auth/login",
        json={"email": USER_EMAIL, "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_me_endpoint(client, user_token):
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == USER_EMAIL


def test_admin_add_resource(client, admin_token):
    response = client.post(
        "/api/resources",
        json={
            "name": "Test Laptop",
            "category": "laptop",
            "description": "A test laptop",
            "quantity": 5,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 201
    resource_id = response.json()["id"]
    client.delete(
        f"/api/resources/{resource_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )


def test_user_cannot_add_resource(client, user_token):
    response = client.post(
        "/api/resources",
        json={
            "name": "Unauthorized",
            "category": "laptop",
            "description": "x",
            "quantity": 1,
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert response.status_code == 403


def test_admin_dashboard(client, admin_token):
    response = client.get(
        "/api/admin/dashboard",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "users" in data and "resources" in data


def test_admin_get_users(client, admin_token):
    response = client.get(
        "/api/admin/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_admin_update_user(client, admin_token):
    db = SessionLocal()
    user = (
        db.query(models.User)
        .filter(models.User.email == USER_EMAIL)
        .first()
    )
    db.close()
    response = client.put(
        f"/api/admin/users/{user.id}",
        json={"name": "Updated Name", "role": "admin"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert response.json()["role"] == "admin"
    client.put(
        f"/api/admin/users/{user.id}",
        json={"role": "user"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )


def test_admin_update_user_invalid_role(client, admin_token):
    db = SessionLocal()
    user = (
        db.query(models.User)
        .filter(models.User.email == USER_EMAIL)
        .first()
    )
    db.close()
    response = client.put(
        f"/api/admin/users/{user.id}",
        json={"role": "superadmin"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 400


def test_admin_cannot_delete_self(client, admin_token):
    db = SessionLocal()
    admin = (
        db.query(models.User)
        .filter(models.User.email == ADMIN_EMAIL)
        .first()
    )
    db.close()
    response = client.delete(
        f"/api/admin/users/{admin.id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 400


def test_admin_get_all_bookings(client, admin_token):
    response = client.get(
        "/api/admin/bookings",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_admin_update_booking_status(client, admin_token):
    db = SessionLocal()
    user = (
        db.query(models.User)
        .filter(models.User.email == USER_EMAIL)
        .first()
    )
    resource = db.query(models.Resource).order_by(
        models.Resource.id.desc()
    ).first()
    if resource is None:
        resource = models.Resource(
            name="Temp Resource",
            category="laptop",
            description="Temp",
            quantity=1,
            available=True,
        )
        db.add(resource)
        db.commit()
        db.refresh(resource)
    booking = models.Booking(
        user_id=user.id,
        resource_id=resource.id,
        start_date="2025-01-01",
        end_date="2025-01-03",
        status="active",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    booking_id = booking.id
    db.close()

    response = client.patch(
        f"/api/admin/bookings/{booking_id}",
        json={"status": "completed"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "completed"

    del_response = client.delete(
        f"/api/admin/bookings/{booking_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert del_response.status_code == 200


@pytest.fixture(scope="module")
def user_token(client):
    response = client.post(
        "/api/auth/login",
        json={"email": USER_EMAIL, "password": USER_PASSWORD},
    )
    return response.json()["access_token"]


@pytest.fixture(scope="module")
def admin_token(client):
    response = client.post(
        "/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    return response.json()["access_token"]


def test_cleanup(client, admin_token):
    db = SessionLocal()
    test_users = (
        db.query(models.User)
        .filter(models.User.email.in_([ADMIN_EMAIL, USER_EMAIL]))
        .all()
    )
    user_ids = [u.id for u in test_users]
    if user_ids:
        db.query(models.Booking).filter(
            models.Booking.user_id.in_(user_ids)
        ).delete(synchronize_session="fetch")
    db.query(models.User).filter(
        models.User.email.in_([ADMIN_EMAIL, USER_EMAIL])
    ).delete(synchronize_session="fetch")
    db.query(models.Resource).filter(
        models.Resource.name.in_(["Test Laptop", "Temp Resource"])
    ).delete(synchronize_session="fetch")
    db.commit()
    db.close()
