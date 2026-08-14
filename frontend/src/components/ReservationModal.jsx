import { useState } from "react";

function ReservationModal({ resource, onClose, onSubmit }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit({
      resource_id: resource.id,
      start_date: startDate,
      end_date: endDate,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-6"
      >
        <div className="mb-6 flex justify-between">
          <h2 className="text-xl font-bold">
            Reserve {resource.name}
          </h2>

          <button type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        <label className="mb-2 block text-sm font-medium">
          Start date
        </label>

        <input
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          required
          className="mb-4 w-full rounded-lg border p-3"
        />

        <label className="mb-2 block text-sm font-medium">
          End date
        </label>

        <input
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          required
          className="mb-6 w-full rounded-lg border p-3"
        />

        <button className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white">
          Confirm Reservation
        </button>
      </form>
    </div>
  );
}

export default ReservationModal;
