# 🏢 Equipment Booking System

A modern, full-stack 3-tier web application designed to automate organization resource scheduling. This portal allows employees or team members to view, filter, and reserve hardware, laptops, and meeting rooms while preventing date-overlap conflicts through backend validation logic.

---

## 🚀 Tech Stack

- **Frontend:** React 19 (Vite), Tailwind CSS, React Router DOM v7, Axios
- **Backend:** Python (FastAPI / Flask), SQLAlchemy ORM, PyJWT, Passlib (bcrypt)
- **Database:** MySQL 8.0
- **Version Control:** Git & GitHub

---

## 🛠️ Features

- 🔐 **JWT Authentication:** Secure user registration, login, and password hashing.
- 📦 **Resource Catalog:** Dynamic multi-criteria search and category filtering for hardware & rooms.
- ⚡ **React 19 Actions & Hooks:** Optimized form handling and UI state updates using React 19 features (`useActionState`, `useOptimistic`).
- 📅 **Conflict-Free Reservations:** Intelligent backend date-overlap detection preventing double-booking.
- 📊 **User & Admin Dashboards:** Active booking management, cancellation flows, and administrative inventory controls.
- 📖 **Interactive API Documentation:** Auto-generated Swagger UI for endpoint testing.

---

## 📁 Repository Structure

```text
equipment-booking-system/
├── .gitignore                # Environment & build file exclusions
├── README.md                 # Project documentation
├── backend/                  # Python REST API
│   ├── app/
│   │   ├── main.py           # Application entry point & CORS
│   │   ├── database.py       # DB Connection Engine
│   │   ├── models.py         # SQLAlchemy ORM Models
│   │   ├── schemas.py        # Request/Response Validation Models
│   │   └── routes/           # Auth, Resource & Booking Routes
│   └── requirements.txt      # Python dependencies
└── frontend/                 # React 19 Single Page Application
    ├── src/
    │   ├── components/       # Reusable UI Elements (Modals, Navbars, Cards)
    │   ├── context/          # Global Auth State Management
    │   ├── pages/            # View Routes (Catalog, Login, Dashboard)
    │   └── services/         # Axios API connection setup
    └── package.json
