import { useEffect, useState } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const ALL_FIELDS = [
  { key: "userName", label: "Name", locked: true },
  { key: "email", label: "Email" },
  { key: "age", label: "Age", sortable: true },
  { key: "role", label: "Role" },
  { key: "isActive", label: "Status" },
];

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push("…");
  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  ) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

function Users() {
  const [users, setUsers] = useState([]);
  const [sortOrder, setSortOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [limitInput, setLimitInput] = useState("5");
  const [totalPages, setTotalPages] = useState(1);
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
      query.push(`limit=${limit}`);
      return query.join("&");
    };

    const fetchData = async () => {
      try {
        const query = buildQuery();
        const response = await fetch(`http://localhost:3000/users?${query}`);
        const data = await response.json();
        if (data && typeof data.total === "number") {
          setUsers(data.data);
          setTotalPages(Math.ceil(data.total / limit) || 1);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [sortOrder, page, limit, selectedFields]);

  const handleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setPage(1);
  };

  // Apply the limit only when user presses Enter or clicks Go
  const applyLimit = () => {
    const parsed = parseInt(limitInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setLimit(parsed);
      setPage(1);
    } else {
      setLimitInput(String(limit)); // revert invalid input
    }
  };

  const handleLimitKeyDown = (e) => {
    if (e.key === "Enter") applyLimit();
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
        {totalPages > 1 && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Rows-per-page input */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Rows per page</span>
              <input
                type="number"
                min="1"
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                onKeyDown={handleLimitKeyDown}
                onBlur={applyLimit}
                className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700
                           focus:outline-none focus:ring-2 focus:ring-amber-400 text-center"
              />
              <button
                onClick={applyLimit}
                className="px-3 py-1 rounded-lg border-2 border-amber-400 bg-amber-50 text-amber-700
                           text-sm font-medium hover:bg-amber-100 transition-colors"
              >
                Go
              </button>
            </div>

            {/* Page number buttons */}
            <div className="flex items-center gap-1 flex-wrap">
              {/* Prev */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 h-9 rounded-full border-2 bg-amber-300 text-sm font-medium
                           disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-400"
              >
                ← Prev
              </button>

              {/* Numbered pages */}
              {getPageNumbers(page, totalPages).map((n, idx) =>
                n === "…" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-9 h-9 rounded-full border-2 text-sm font-medium transition-colors
                      ${
                        page === n
                          ? "bg-amber-500 border-amber-500 text-white"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-amber-50"
                      }`}
                  >
                    {n}
                  </button>
                ),
              )}

              {/* Next */}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
                className="px-3 h-9 rounded-full border-2 bg-amber-500 text-white text-sm font-medium
                           disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-600"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default Users;
