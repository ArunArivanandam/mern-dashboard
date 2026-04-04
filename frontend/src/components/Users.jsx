import { useEffect, useState } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const ALL_FIELDS = [
  { key: "userName", label: "Name", locked: true },
  { key: "email", label: "Email" },
  { key: "age", label: "Age", sortable: true },
  { key: "role", label: "Role" },
  { key: "isActive", label: "Status" },
];

function Users() {
  const [users, setUsers] = useState([]);
  const [sortOrder, setSortOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedFields, setSelectedFields] = useState(
    new Set(ALL_FIELDS.map((f) => f.key)),
  );

  const toggleField = (key) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    setPage(1);
  };

  useEffect(() => {
    const buildQuery = () => {
      let query = [];

      if (sortOrder === "asc") query.push("sort=age");
      if (sortOrder === "desc") query.push("sort=-age");

      // Only send fields param when not all fields are selected
      if (selectedFields.size < ALL_FIELDS.length) {
        query.push(`fields=${[...selectedFields].join(",")}`);
      }

      query.push(`page=${page}`);
      query.push(`limit=5`);
      return query.join("&");
    };

    const fetchData = async () => {
      try {
        const query = buildQuery();
        const response = await fetch(`http://localhost:3000/users?${query}`);
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [sortOrder, page, selectedFields]);

  const handleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setPage(1);
  };

  const visibleFields = ALL_FIELDS.filter((f) => selectedFields.has(f.key));
  // Hide age sort icon if age column is hidden
  const ageVisible = selectedFields.has("age");

  return (
    <div className="flex gap-4 p-4 items-start">
      {/* ── Sidebar ── */}
      <div className="w-44 shrink-0 border border-gray-200 rounded-xl p-3 sticky top-4 bg-white">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Visible fields
        </p>

        {ALL_FIELDS.map((f) => (
          <label
            key={f.key}
            className="flex items-center gap-2 py-1 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              checked={selectedFields.has(f.key)}
              disabled={f.locked}
              onChange={() => !f.locked && toggleField(f.key)}
              className="accent-amber-500"
            />
            <span
              className={`text-sm ${f.locked ? "text-gray-400" : "text-gray-700"}`}
            >
              {f.label}
            </span>
          </label>
        ))}

        <hr className="my-2 border-gray-100" />
        <button
          onClick={() => {
            setSelectedFields(new Set(ALL_FIELDS.map((f) => f.key)));
            setPage(1);
          }}
          className="w-full text-xs text-gray-500 border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50"
        >
          Reset
        </button>
        <p className="text-xs text-gray-400 mt-2">
          {selectedFields.size} of {ALL_FIELDS.length} shown
        </p>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 min-w-0">
        <h1 className="text-amber-700 text-center font-extrabold p-2 text-3xl mb-2">
          Users List
        </h1>

        <table className="w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {visibleFields.map((f) => (
                <th
                  key={f.key}
                  className={`p-3 text-left ${f.sortable && ageVisible ? "cursor-pointer" : ""}`}
                  onClick={f.sortable && ageVisible ? handleSort : undefined}
                >
                  {f.sortable ? (
                    <span className="flex items-center gap-1">
                      {f.label}
                      {sortOrder === null && <FaSort />}
                      {sortOrder === "asc" && <FaSortUp />}
                      {sortOrder === "desc" && <FaSortDown />}
                    </span>
                  ) : (
                    f.label
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t hover:bg-gray-50">
                {visibleFields.map((f) => (
                  <td key={f.key} className="p-3">
                    {f.key === "isActive"
                      ? user.isActive
                        ? "🟢 Active"
                        : "🔴 Inactive"
                      : (user[f.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── Pagination ── */}
        <div className="mt-3 flex items-center gap-2">
          <button
            className="px-3 py-1 border-2 bg-amber-300 rounded disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <button
            className="px-3 py-1 border-2 bg-amber-500 rounded"
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Users;
