# Custom Booking Time

Allows users to specify a **custom time** (start time and end time) for a reservation, in addition to the start/end dates, directly on the cart/checkout page.

## What it does

- Each booking can store an optional `start_time` and `end_time` (HH:MM:SS).
- The cart modal exposes **Start Time** and **End Time** pickers next to the date fields.
- The booking list (user "My Reservations" and the admin bookings table) displays the times, e.g. `2026-10-01 09:00:00 → 2026-10-01 17:00:00`.
- Validation: when the start and end dates are the same, the end time must be after the start time (otherwise the API returns `400`).

## Backend changes

- `models.Booking` gained two nullable columns:
  - `start_time` (SQL `TIME`)
  - `end_time` (SQL `TIME`)
- `schemas.BookingCreate` / `BookingResponse` include `start_time` and `end_time` (`time | None`).
- `routers/bookings.py`:
  - `booking_to_response` returns the times.
  - `create_booking` validates the same-day time rule and persists the times on the `Booking` row.
- Migration `backend/migrate_booking_time.py` adds the two columns to the existing `bookings` table (`ALTER TABLE bookings ADD COLUMN ... TIME NULL`).

### API

`POST /api/bookings`

```json
{
  "start_date": "2026-10-01",
  "end_date": "2026-10-01",
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "items": [{ "resource_id": 1, "quantity": 1 }]
}
```

Response includes `start_time` and `end_time` alongside the existing fields.

## Frontend changes

- `components/CartModal.jsx`: added `startTime` / `endTime` state, two `type="time"` inputs (paired with the date inputs in a 2-column grid), same-day time validation, and both values are sent in the booking payload (`start_time` / `end_time`, `null` when empty).
- `pages/UserDashboard.jsx` and `pages/AdminDashboard.jsx`: booking date rows now render the times when present.

## Validation rules

| Case | Result |
| --- | --- |
| `end_date < start_date` | `400` End date cannot be before start date |
| Same day and `end_time <= start_time` | `400` End time must be after start time |
| Times omitted | Allowed (times are optional) |

## Notes / limitations

- Availability and conflict checks remain at **day granularity**. Times are stored and displayed but do not yet narrow the conflict window. Enabling true time-overlap conflict detection would require updating `rented_quantity` in `routers/bookings.py` and `rented_counts`/`rented_for` in `routers/resources.py` to compare datetimes.

## Tests

- `test_create_booking_with_time` (in `backend/app/test_admin_features.py`) verifies a booking stores the provided times and that an invalid same-day time range is rejected with `400`.
