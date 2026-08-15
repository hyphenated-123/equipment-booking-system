import { useState } from "react";


function CartModal({
  cart,
  setCart,
  onClose,
  onSubmit,
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");


  function changeQuantity(id, delta) {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const max = item.available ?? Infinity;
        const next = Math.min(max, Math.max(1, item.quantity + delta));

        return { ...item, quantity: next };
      })
    );
  }


  function removeItem(id) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }


  function handleSubmit(event) {
    event.preventDefault();

    if (!startDate || !endDate) {
      setError("Please choose start and end dates.");
      return;
    }

    if (endDate < startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    onSubmit({
      start_date: startDate,
      end_date: endDate,
      items: cart.map((item) => ({
        resource_id: item.id,
        quantity: item.quantity,
      })),
    });
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-6"
      >
        <h2 className="mb-4 text-2xl font-bold">
          Your Reservation
        </h2>

        {cart.length === 0 ? (
          <p className="text-gray-600">
            Your cart is empty. Add resources from the catalog.
          </p>
        ) : (
          <ul className="mb-4 space-y-2">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="font-medium">{item.name}</span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changeQuantity(item.id, -1)}
                    disabled={item.quantity <= 1}
                    className="rounded border px-2 py-0.5 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    -
                  </button>

                  <span className="w-6 text-center">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => changeQuantity(item.id, 1)}
                    disabled={item.quantity >= (item.available ?? Infinity)}
                    className="rounded border px-2 py-0.5 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    +
                  </button>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="ml-2 text-sm text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p className="mb-3 text-sm text-red-600">{error}</p>
        )}

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
            disabled={cart.length === 0}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Confirm
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </form>
    </div>
  );
}


export default CartModal;
