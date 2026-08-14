import { useEffect, useMemo, useState } from "react";
import ResourceCard from "../components/ResourceCard";
import ResourceFilter from "../components/ResourceFilter";
import ReservationModal from "../components/ReservationModal";
import api from "../services/api";

function Catalog() {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedResource, setSelectedResource] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadResources() {
      try {
        const response = await api.get("/resources");
        setResources(response.data);
      } catch {
        setError("Could not load resources.");
      }
    }

    loadResources();
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        resource.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        resource.description
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "all" ||
        resource.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [resources, search, category]);

  async function createReservation(data) {
    try {
      await api.post("/bookings", data);

      alert("Reservation created successfully.");

      setSelectedResource(null);
    } catch (error) {
      alert(
        error.response?.data?.detail ||
          "Could not create reservation."
      );
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Resource Catalog
        </h1>

        <p className="mt-2 text-slate-600">
          Find and reserve available equipment and rooms.
        </p>
      </div>

      <ResourceFilter
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
      />

      {error && (
        <p className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onReserve={setSelectedResource}
          />
        ))}
      </div>

      {selectedResource && (
        <ReservationModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          onSubmit={createReservation}
        />
      )}
    </main>
  );
}

export default Catalog;
