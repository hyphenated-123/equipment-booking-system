import {
  useEffect,
  useState,
} from "react";

import api from "../services/api";

import { useAuth } from "../context/useAuth";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("resources");

  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [newCategory, setNewCategory] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const { user: currentUser } = useAuth();


  async function loadData() {
    try {
      const [
        resourcesRes,
        usersRes,
        bookingsRes,
        statsRes,
        categoriesRes,
      ] = await Promise.all([
        api.get("/resources"),
        api.get("/admin/users"),
        api.get("/admin/bookings"),
        api.get("/admin/dashboard"),
        api.get("/categories"),
      ]);

      setResources(resourcesRes.data);
      setUsers(usersRes.data);
      setBookings(bookingsRes.data);
      setStats(statsRes.data);
      setCategories(categoriesRes.data);

      if (!editingId && !category && categoriesRes.data.length > 0) {
        setCategory(categoriesRes.data[0].name);
      }
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Could not load data."
      );
    }
  }


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  async function submitResource(event) {
    event.preventDefault();
    setError("");

    const payload = {
      name,
      category,
      description,
      quantity,
    };

    try {
      if (editingId) {
        await api.put(
          `/resources/${editingId}`,
          payload
        );
      } else {
        await api.post("/resources", payload);
      }

      resetForm();
      await loadData();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Could not save resource."
      );
    }
  }


  function editResource(resource) {
    setEditingId(resource.id);
    setName(resource.name);
    setCategory(resource.category);
    setDescription(resource.description);
    setQuantity(resource.quantity);
    setError("");
  }


  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setQuantity(1);
    setCategory(categories.length > 0 ? categories[0].name : "");
    setError("");
  }


  async function deleteResource(id) {
    if (!window.confirm("Delete this resource?")) return;

    try {
      await api.delete(`/resources/${id}`);
      await loadData();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Could not delete resource."
      );
    }
  }


  async function toggleAvailability(resource) {
    try {
      await api.patch(
        `/resources/${resource.id}/availability`,
        {},
        {
          params: {
            available: !resource.is_active,
          },
        }
      );
      await loadData();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Could not update availability."
      );
    }
  }


  async function addCategory(event) {
    event.preventDefault();
    setError("");

    const trimmed = newCategory.trim();

    if (!trimmed) return;

    try {
      await api.post("/categories", { name: trimmed });
      setNewCategory("");
      await loadData();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Could not add category."
      );
    }
  }


  async function deleteCategory(id) {
    if (!window.confirm("Delete this category?")) return;

    try {
      await api.delete(`/categories/${id}`);
      await loadData();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Could not delete category."
      );
    }
  }


  async function updateUser(id, updates) {
    try {
      await api.put(`/admin/users/${id}`, updates);
      await loadData();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Could not update user."
      );
    }
  }


  async function deleteUser(id) {
    if (!window.confirm("Delete this user?")) return;

    try {
      await api.delete(`/admin/users/${id}`);
      await loadData();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Could not delete user."
      );
    }
  }


  async function updateBooking(id, status) {
    try {
      await api.patch(`/admin/bookings/${id}`, { status });
      await loadData();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Could not update booking."
      );
    }
  }


  async function deleteBooking(id) {
    if (!window.confirm("Delete this booking?")) return;

    try {
      await api.delete(`/admin/bookings/${id}`);
      await loadData();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Could not delete booking."
      );
    }
  }


  return (
    <main className="mx-auto max-w-6xl px-6 py-12">

      <h1 className="mb-8 text-3xl font-bold">
        Admin Dashboard
      </h1>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab("resources")}
          className={`rounded-lg px-4 py-2 ${
            activeTab === "resources"
              ? "bg-blue-600 text-white"
              : "border"
          }`}
        >
          Resources
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`rounded-lg px-4 py-2 ${
            activeTab === "categories"
              ? "bg-blue-600 text-white"
              : "border"
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`rounded-lg px-4 py-2 ${
            activeTab === "users"
              ? "bg-blue-600 text-white"
              : "border"
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`rounded-lg px-4 py-2 ${
            activeTab === "bookings"
              ? "bg-blue-600 text-white"
              : "border"
          }`}
        >
          Bookings
        </button>
      </div>

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

      {activeTab === "resources" && (
        <>

          <form
            onSubmit={submitResource}
            className="mb-8 rounded-xl border bg-white p-6"
          >
            <h2 className="mb-4 text-xl font-bold">
              {editingId ? "Edit Resource" : "Add New Resource"}
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
                {categories.length === 0 && (
                  <option value="">No categories</option>
                )}
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
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
                {editingId ? "Update" : "Add"} Resource
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

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="mt-4 rounded-lg border border-gray-400 px-4 py-2 text-gray-600"
              >
                Cancel Edit
              </button>
            )}
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
                      {resource.category}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {resource.description}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Available: {resource.available} • Rented:{" "}
                      {resource.rented} • Total: {resource.total}
                    </p>
                    <p
                      className={`mt-1 text-xs font-semibold ${
                        resource.is_active
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {resource.is_active ? "Listed" : "Unlisted"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleAvailability(resource)}
                      className={`rounded-lg px-3 py-1 text-xs ${
                        resource.is_active
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {resource.is_active ? "Unlist" : "List"}
                    </button>

                    <button
                      onClick={() => editResource(resource)}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-xs text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteResource(resource.id)}
                      className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === "categories" && (
        <div>
          <h2 className="mb-4 text-xl font-bold">
            Categories
          </h2>

          <form
            onSubmit={addCategory}
            className="mb-6 flex gap-3 rounded-xl border bg-white p-5"
          >
            <input
              type="text"
              placeholder="New category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              required
              className="flex-1 rounded-lg border px-4 py-3"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Add Category
            </button>
          </form>

          <div className="space-y-3">
            {categories.length === 0 ? (
              <p className="text-gray-600">
                No categories yet.
              </p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-xl border bg-white p-5"
                >
                  <span className="font-bold">{cat.name}</span>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div>
          <h2 className="mb-4 text-xl font-bold">Users</h2>

          {users.length === 0 ? (
            <p className="text-gray-600">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b">
                      <td className="px-4 py-2">{u.id}</td>
                      <td className="px-4 py-2">{u.name}</td>
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            updateUser(u.id, { role: e.target.value })
                          }
                          className="rounded border px-2 py-1 text-sm"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => deleteUser(u.id)}
                          disabled={u.id === currentUser?.id}
                          className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "bookings" && (
        <div>
          <h2 className="mb-4 text-xl font-bold">Bookings</h2>

          {bookings.length === 0 ? (
            <p className="text-gray-600">No bookings found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">User</th>
                    <th className="px-4 py-2 text-left">Items</th>
                    <th className="px-4 py-2 text-left">Dates</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b">
                      <td className="px-4 py-2">{b.id}</td>
                      <td className="px-4 py-2">{b.user_name}</td>
                      <td className="px-4 py-2">
                        <ul className="text-sm">
                          {b.items.map((item) => (
                            <li key={item.id}>
                              {item.resource_name} × {item.quantity}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-2">
                        {b.start_date} → {b.end_date}
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={b.status}
                          onChange={(e) =>
                            updateBooking(b.id, e.target.value)
                          }
                          className="rounded border px-2 py-1 text-sm"
                        >
                          <option value="active">Active</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => deleteBooking(b.id)}
                          className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default AdminDashboard;
