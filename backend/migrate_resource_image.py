"""
Adds the image_url column to the existing resources table.

SQLAlchemy's create_all only creates missing tables, it does not alter
existing ones, so this one-off script adds the new nullable column.
"""
from app.database import engine
from sqlalchemy import text


def main():
    with engine.connect() as connection:
        try:
            connection.execute(
                text(
                    "ALTER TABLE resources "
                    "ADD COLUMN image_url VARCHAR(500) NULL"
                )
            )
            connection.commit()
            print("Added image_url column to resources.")
        except Exception as error:
            print(f"Skipped (column may already exist): {error}")


if __name__ == "__main__":
    main()
