import os
from pathlib import Path
from dotenv import load_dotenv

# Get the backend directory path
backend_dir = Path(__file__).resolve().parent.parent
env_file = backend_dir / ".env"

# Load .env file explicitly
load_dotenv(dotenv_path=env_file)

DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)
ADMIN_REGISTRATION_CODE = os.getenv(
    "ADMIN_REGISTRATION_CODE", "admin-secret-code"
)

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not configured")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not configured")
