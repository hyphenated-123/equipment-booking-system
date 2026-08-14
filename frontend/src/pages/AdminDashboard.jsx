import {
  useEffect,
  useState,
} from "react";

import api from "../services/api";


function AdminDashboard() {
  const [resources, setResources] =
    useState([]);

  const [stats, setStats] =
    useState(null);

  const [name, setName] =
    useState("");

  const [category, setCategory] =
    useState("laptop");

  const [description, setDescription] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [error, setError] =
    useState("");


  async function loadData() {
    try {
      const [
        resourcesRes,
        statsRes,
      ] = await Promise.all([
        api.get("/resources"),
        api.get("/admin/dashboard"),
      ]);

      setResources(resourcesRes.data);
      setStats(statsRes.data);

    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Could not load data."
      );
    }
  }


  useEffect(() => {
    loadData();
  }, []);


  async function addResource(event) {
    event.preventDefault();
    setError("");


    try {
      await api.post(
        "/resources",
        {
          name,
          category,
          description,
          quantity,
        }
      );

      setName("");
      setDescription("");
      setQuantity(1);

      await loadData();

    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Could not add resource."
      );
    }
  }


  async function deleteResource(id) {
    try {
      await api.delete(
        `/resources/${id}`
      );

      await loadData();

    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Could not delete resource."
      );
    }
  }


  return (
    <main className="mx-auto max-w-6xl px-6 py-12">

      <h1 className="mb-8 text-3xl font-bold">
        Admin Dashboard
      </h1>


      {stats && (
        <div className="mb-8 grid gap-4 md:grid-cols-5">

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-600">
              Total Users
            </p>
            <p className="mt-2 text-3xl font-bold">
              {stats.users}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-600">
              Resources
            </p>
            <p className="mt-2 text-3xl font-bold">
              {stats.resources}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-600">
              Total Bookings
            </p>
            <p className="mt-2 text-3xl font-bold">
              {stats.bookings}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-600">
              Active Bookings
            </p>
            <p className="mt-2 text-3xl font-bold">
              {stats.active_bookings}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-600">
              Available Resources
            </p>
            <p className="mt-2 text-3xl font-bold">
              {stats.available_resources}
            </p>
          </div>

        </div>
      )}


      {error && (
        <p className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </p>
      )}


      <form
        onSubmit={addResource}
        className="mb-8 rounded-xl border bg-white p-6"
      >

        <h2 className="mb-4 text-xl font-bold">
          Add New Resource
        </h2>

        <div className="grid gap-4 md:grid-cols-2">

          <input
            type="text"
            placeholder="Resource name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-lg border px-4 py-3"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border px-4 py-3"
          >
            <option value="laptop">Laptop</option>
            <option value="hardware">Hardware</option>
            <option value="room">Meeting Room</option>
          </select>

          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            min="1"
            required
            className="rounded-lg border px-4 py-3"
          />

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Add Resource
          </button>

        </div>

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="mt-4 w-full rounded-lg border px-4 py-3"
          rows="3"
        />

      </form>


      <div>

        <h2 className="mb-4 text-xl font-bold">
          Resources
        </h2>

        <div className="space-y-3">

          {resources.map((resource) => (
            <div
              key={resource.id}
              className="flex flex-col justify-between gap-4 rounded-xl border bg-white p-5 md:flex-row md:items-center"
            >

              <div>
                <h3 className="font-bold">
                  {resource.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {resource.category} • Qty: {resource.quantity}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {resource.description}
                </p>
              </div>

              <button
                onClick={() => deleteResource(resource.id)}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Delete
              </button>

            </div>
          ))}

        </div>

      </div>

    </main>
  );
}


export default AdminDashboard;
