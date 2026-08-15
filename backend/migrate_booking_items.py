"""
One-off migration for the cart-style booking model.

The previous Booking table stored a single resource_id. Bookings now use a
header (bookings) + line items (booking_items). This script drops and recreates
those two tables so the new schema is applied. Existing booking records are
removed as part of this change.
"""
from app.database import Base, engine
from app import models


def main():
    Base.metadata.drop_all(
        bind=engine,
        tables=[
            models.BookingItem.__table__,
            models.Booking.__table__,
        ],
    )
    Base.metadata.create_all(
        bind=engine,
        tables=[
            models.Booking.__table__,
            models.BookingItem.__table__,
        ],
    )
    print("Booking schema migrated (bookings + booking_items).")


if __name__ == "__main__":
    main()
