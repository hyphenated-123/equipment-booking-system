import { useEffect, useState } from "react";
import api from "../services/api";

function AdminDashboard() {
  const [resources, setResources] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("laptop");

  async function loadResources() {
    const response = await api.get("/resources");
    setResources(response.data);
  }

  useEffect(() => {
    loadResources();
  }, []);

  async function addResource(event) {
    event.preventDefault();

    await api.post("/resources", {
      name,
      category,
      description: "New organization resource",
    });

    setName("");
    await loadResources();
  }

  async function deleteResource(id) {
    await api.delete(/resources/);
    await loadResources();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold">
        Admin Dashboard
      </h1>

      <form
        onSubmit={addResource}
        className="mb-8 grid gap-4 rounded-xl border bg-white p-6 md:grid-cols-3"
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Resource name"
          required
          className="rounded-lg border p-3"
        />

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-lg border p-3"
        >
          <option value="laptop">Laptop</option>
          <option value="hardware">Hardware</option>
          <option value="room">Meeting Room</option>
        </select>

        <button className="rounded-lg bg-blue-600 p-3 text-white">
          Add Resource
        </button>
      </form>

      <div className="space-y-3">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="flex items-center justify-between rounded-xl border bg-white p-5"
          >
            <div>
              <h2 className="font-bold">{resource.name}</h2>
              <p className="text-sm text-slate-500">
                {resource.category}
              </p>
            </div>

            <button
              onClick={() => deleteResource(resource.id)}
              className="rounded-lg bg-red-600 px-4 py-2 text-white"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default AdminDashboard;
