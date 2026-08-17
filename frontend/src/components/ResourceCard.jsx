function ResourceCard({
  resource,
  onAddToCart,
  onReserve,
}) {
  const icon =
    resource.category === "room"
      ? "🏢"
      : resource.category === "hardware"
        ? "🔧"
        : "💻";

  const imageSrc = resource.image_url
    ? `http://127.0.0.1:8000${resource.image_url}`
    : null;

  const outOfStock = resource.available <= 0 || !resource.is_active;

  return (
    <article className="overflow-hidden rounded-xl border bg-white shadow-sm">

      <div className="flex h-40 items-center justify-center bg-slate-100 text-5xl">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={resource.name}
            className="h-full w-full object-cover"
          />
        ) : (
          icon
        )}
      </div>


      <div className="p-5">

        <h3 className="mb-2 text-xl font-bold">
          {resource.name}
        </h3>

        <p className="mb-1 text-sm text-gray-600">
          <strong>Category:</strong> {resource.category}
        </p>

        <p className="mb-1 text-sm text-gray-600">
          <strong>Available:</strong> {resource.available} /{" "}
          {resource.total} (Rented: {resource.rented})
        </p>

        <p className="mb-4 line-clamp-2 text-sm text-gray-700">
          {resource.description}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => onAddToCart(resource)}
            disabled={outOfStock}
            className="flex-1 rounded-lg bg-slate-100 px-4 py-2 font-semibold text-blue-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            {outOfStock ? "Unavailable" : "Add to Cart"}
          </button>

          <button
            onClick={() => onReserve(resource)}
            disabled={outOfStock}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {outOfStock ? "Unavailable" : "Reserve"}
          </button>
        </div>

      </div>
    </article>
  );
}


export default ResourceCard;
