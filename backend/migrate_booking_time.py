"""
Adds the start_time and end_time columns to the existing bookings table.

SQLAlchemy's create_all only creates missing tables, so this one-off script
adds the new nullable TIME columns to the existing bookings table.
"""
from app.database import engine
from sqlalchemy import text


def main():
    with engine.connect() as connection:
        for column in ("start_time", "end_time"):
            try:
                connection.execute(
                    text(f"ALTER TABLE bookings ADD COLUMN {column} TIME NULL")
                )
                connection.commit()
                print(f"Added {column} column to bookings.")
            except Exception as error:
                print(f"Skipped {column} (may already exist): {error}")


if __name__ == "__main__":
    main()
