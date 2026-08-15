# Equipment Booking System — Code Summary

A full-stack web application for booking equipment (laptops, hardware, meeting rooms) with role-based access: regular users book resources, admins manage everything.

## Tech Stack
- **Backend:** Python, FastAPI, SQLAlchemy, MySQL, JWT auth, bcrypt password hashing
- **Frontend:** React 19, React Router 7, Vite 8, Tailwind CSS 4, axios

## Architecture

```
equipment-booking-system/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS, router registration
│   │   ├── config.py          # Env vars (DB URL, secret, admin code)
│   │   ├── database.py        # SQLAlchemy engine, session, Base
│   │   ├── models.py          # User, Resource, Booking ORM models
│   │   ├── schemas.py         # Pydantic request/response models
│   │   ├── security.py        # bcrypt hash/verify
│   │   ├── oauth2.py          # JWT create/decode, get_current_user, admin_only
│   │   ├── utils.py
│   │   └── routers/
│   │       ├── auth.py        # register, register/admin, login, me
│   │       ├── resources.py   # CRUD on resources (admin)
│   │       ├── bookings.py    # create/own bookings (user)
│   │       └── admin.py       # dashboard, users CRUD, bookings CRUD
│   ├── requirements.txt
│   └── .env
└── frontend/
    └── src/
        ├── main.jsx
        ├── App.jsx            # Routes
        ├── context/AuthContext.jsx   # login/register/adminRegister/logout
        ├── services/api.js            # axios client + token interceptor
        ├── components/        # Navbar, ProtectedRoute, ResourceCard, etc.
        └── pages/             # Home, Login, Register, AdminRegister,
                               # Catalog, UserDashboard, AdminDashboard
```

## Data Models (MySQL)
| Model | Fields |
|---|---|
| **User** | id, name, email (unique), password_hash, role (`user`/`admin`), created_at |
| **Resource** | id, name, category, description, quantity, available (bool), created_at |
| **Booking** | id, user_id, resource_id, start_date, end_date, status (`active`/`cancelled`/`completed`), created_at |

Relations: User 1—N Booking, Resource 1—N Booking.

## Backend API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register user (role=`user`) |
| POST | `/register/admin` | — | Register admin (requires `admin_code`) |
| POST | `/login` | — | Login, returns JWT + user |
| GET | `/me` | user | Current user info |

### Resources (`/api/resources`) — all admin-only
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List (search, category, pagination) |
| GET | `/{id}` | Get one |
| POST | `/` | Create |
| PUT | `/{id}` | Update |
| DELETE | `/{id}` | Delete |
| PATCH | `/{id}/availability` | Toggle availability |

### Bookings (`/api/bookings`) — user + admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | user | Create booking (conflict-checked) |
| GET | `/me` | user | Own bookings |
| GET | `/{id}` | user | Own booking |
| DELETE | `/{id}` | user | Cancel own booking |

### Admin (`/api/admin`) — admin-only
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Counts: users, resources, bookings, active, available |
| GET | `/users` | List all users |
| PUT | `/users/{id}` | Update name/role |
| DELETE | `/users/{id}` | Delete user (self-delete blocked) |
| GET | `/bookings` | List all bookings |
| PATCH | `/bookings/{id}` | Update status |
| DELETE | `/bookings/{id}` | Delete booking |

## Frontend Pages
| Page | Route | Purpose |
|---|---|---|
| Home | `/` | Landing |
| Login | `/login` | Login → redirects by role |
| Register | `/register` | User signup |
| AdminRegister | `/register/admin` | Admin signup (admin code) |
| Catalog | `/catalog` | Browse + reserve resources |
| UserDashboard | `/dashboard` | My reservations |
| AdminDashboard | `/admin` | Tabbed CRUD: Resources / Users / Bookings + stats |

## Authentication Flow
1. Login returns a JWT (`access_token`) stored in `localStorage`.
2. `api.js` axios interceptor attaches `Authorization: Bearer <token>` to every request.
3. Backend `get_current_user` decodes the JWT; `admin_only` enforces role.
4. `ProtectedRoute` guards `/dashboard` (user) and `/admin` (admin).

## Admin CRUD Capabilities
- **Resources:** add, edit, delete, toggle availability
- **Users:** change role (user↔admin), delete (cannot delete self)
- **Bookings:** change status (active/cancelled/completed), delete

## How to Run
```powershell
# Backend (terminal 1)
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Frontend (terminal 2)
cd frontend
npm run dev
```
- Frontend: http://localhost:5173 · API docs: http://127.0.0.1:8000/docs
- First admin: register at `/register/admin` with code from `backend/.env` (`ADMIN_REGISTRATION_CODE`).

## Security Notes
- Passwords hashed with bcrypt; JWT-signed with `SECRET_KEY`.
- All mutating admin endpoints require `role=admin`.
- Admin registration gated by `ADMIN_REGISTRATION_CODE` env var — **change before production**.
- Foreign keys prevent deleting users with bookings (must delete bookings first).
