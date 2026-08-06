function ResourceCard({ resource, onReserve }) {
  return (
    <article className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex h-40 items-center justify-center bg-slate-100 text-5xl">
        {resource.category === "room" ? "🏢" : "💻"}
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-bold">{resource.name}</h3>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">
            {resource.category}
          </span>
        </div>

        <p className="mb-4 text-sm text-slate-600">
          {resource.description}
        </p>

        <p className="mb-4 text-sm">
          Status:{" "}
          <span
            className={
              resource.available ? "text-green-600" : "text-red-600"
            }
          >
            {resource.available ? "Available" : "Unavailable"}
          </span>
        </p>

        <button
          disabled={!resource.available}
          onClick={() => onReserve(resource)}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Reserve
        </button>
      </div>
    </article>
  );
}

export default ResourceCard;
