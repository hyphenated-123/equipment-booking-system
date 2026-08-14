import { useState } from "react";


function ReservationModal({
  resource,
  onClose,
  onSubmit,
}) {
  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");


  function handleSubmit(event) {
    event.preventDefault();


    if (endDate < startDate) {
      alert(
        "End date cannot be before start date."
      );

      return;
    }


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

        <h2 className="mb-4 text-2xl font-bold">
          Reserve {resource.name}
        </h2>

        <div className="mb-4">
          <label className="mb-2 block font-semibold">
            Start Date
          </label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block font-semibold">
            End Date
          </label>
          <input
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Confirm
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}


export default ReservationModal;
