import {
  useEffect,
  useState,
} from "react";

import api from "../services/api";


function UserDashboard() {
  const [bookings, setBookings] =
    useState([]);

  const [error, setError] =
    useState("");


  async function loadBookings() {
    try {
      const response = await api.get(
        "/bookings/me"
      );

      setBookings(response.data);
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Could not load bookings."
      );
    }
  }


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBookings();
  }, []);


  async function cancelBooking(id) {
    try {
      await api.delete(
        `/bookings/${id}`
      );

      await loadBookings();

    } catch (error) {
      alert(
        error.response?.data?.detail ||
        "Could not cancel booking."
      );
    }
  }


  return (
    <main className="mx-auto max-w-6xl px-6 py-12">

      <h1 className="mb-8 text-3xl font-bold">
        My Reservations
      </h1>


      {error && (
        <p className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </p>
      )}


      {bookings.length === 0 ? (
        <p className="rounded-lg border bg-white p-6 text-center text-gray-600">
          No reservations yet.{" "}
          <a href="/catalog" className="text-blue-600">
            Browse resources
          </a>
        </p>
      ) : (
        <div className="space-y-4">

          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-col justify-between gap-4 rounded-xl border bg-white p-5 md:flex-row md:items-center"
            >

              <div>
                <h2 className="font-bold">
                  Booking #{booking.id}
                </h2>

                <p className="text-sm text-gray-600">
                  {booking.start_date}
                  {booking.start_time ? ` ${booking.start_time}` : ""} →{" "}
                  {booking.end_date}
                  {booking.end_time ? ` ${booking.end_time}` : ""}
                </p>

                <ul className="mt-1 text-sm text-gray-700">
                  {booking.items.map((item) => (
                    <li key={item.id}>
                      {item.resource_name} × {item.quantity}
                    </li>
                  ))}
                </ul>

                <p className="mt-1 text-sm">
                  Status: {booking.status}
                </p>
              </div>

              {booking.status === "active" && (
                <button
                  onClick={() => cancelBooking(booking.id)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  Cancel
                </button>
              )}

            </div>
          ))}

        </div>
      )}

    </main>
  );
}


export default UserDashboard;
