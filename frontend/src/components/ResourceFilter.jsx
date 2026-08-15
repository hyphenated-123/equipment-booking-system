function ResourceFilter({
  search,
  setSearch,
  category,
  setCategory,
  categories,
}) {
  return (
    <div className="mb-8 grid gap-4 rounded-xl border bg-white p-5 md:grid-cols-2">
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search equipment or rooms..."
        className="rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
      />

      <select
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        className="rounded-lg border px-4 py-3"
      >
        <option value="all">All categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ResourceFilter;
