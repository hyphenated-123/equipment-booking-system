import { useEffect, useMemo, useState } from "react";
import ResourceCard from "../components/ResourceCard";
import ResourceFilter from "../components/ResourceFilter";
import CartModal from "../components/CartModal";
import api from "../services/api";

function Catalog() {
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [resourcesRes, categoriesRes] = await Promise.all([
          api.get("/resources"),
          api.get("/categories"),
        ]);

        setResources(resourcesRes.data);
        setCategories(categoriesRes.data);
      } catch {
        setError("Could not load resources.");
      }
    }

    loadData();
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

  function addToCart(resource) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === resource.id);

      if (existing) {
        return prev.map((item) =>
          item.id === resource.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        { id: resource.id, name: resource.name, quantity: 1 },
      ];
    });

    setShowCart(true);
  }

  async function submitCart(data) {
    try {
      await api.post("/bookings", data);

      alert("Reservation created successfully.");

      setCart([]);
      setShowCart(false);
    } catch (error) {
      alert(
        error.response?.data?.detail ||
          "Could not create reservation."
      );
    }
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Resource Catalog
          </h1>

          <p className="mt-2 text-slate-600">
            Find and reserve available equipment and rooms.
          </p>
        </div>

        <button
          onClick={() => setShowCart(true)}
          className="rounded-lg border border-blue-600 px-4 py-2 font-semibold text-blue-600 hover:bg-blue-50"
        >
          Cart ({cartCount})
        </button>
      </div>

      <ResourceFilter
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        categories={categories}
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
            onReserve={addToCart}
          />
        ))}
      </div>

      {showCart && (
        <CartModal
          cart={cart}
          setCart={setCart}
          onClose={() => setShowCart(false)}
          onSubmit={submitCart}
        />
      )}
    </main>
  );
}

export default Catalog;
