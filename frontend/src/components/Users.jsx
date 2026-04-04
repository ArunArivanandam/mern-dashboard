import { useEffect, useState } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

function Users() {
  const [users, setUsers] = useState([]);
  const [sortOrder, setSortOrder] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // ✅ Fix 1: Moved buildQuery inside useEffect to avoid stale closure
    // and missing dependency array warning
    const buildQuery = () => {
      let query = [];
      if (sortOrder === "asc") query.push("sort=age");
      if (sortOrder === "desc") query.push("sort=-age");
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
  }, [sortOrder, page]);

  const handleSort = () => {
    if (sortOrder === "asc") setSortOrder("desc");
    else setSortOrder("asc");
  };

  return (
    <>
      <h1 className="text-amber-700 text-center font-extrabold p-2 text-3xl">
        Users List
      </h1>
      <table className="w-full border border-gray-200 mt-5">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            {/* ✅ Fix 3 & 4: Added flex alignment and cursor-pointer */}
            <th className="p-3 text-left cursor-pointer" onClick={handleSort}>
              <span className="flex items-center gap-1">
                Age
                {sortOrder === null && <FaSort />}
                {sortOrder === "asc" && <FaSortUp />}
                {sortOrder === "desc" && <FaSortDown />}
              </span>
            </th>
            <th className="p-3 text-left">Role</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-t hover:bg-gray-50">
              <td className="p-3">{user.userName}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3">{user.age}</td>
              <td className="p-3">{user.role}</td>
              <td className="p-3">
                {user.isActive ? "🟢 Active" : "🔴 Inactive"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* ✅ Fix 2: Guard prevents page from going below 1 */}
      <button
        className="px-2 border-2 bg-amber-300 m-2"
        onClick={() => setPage((p) => Math.max(1, p - 1))}
      >
        Prev
      </button>
      <button
        className="px-2 border-2 bg-amber-500"
        onClick={() => setPage((p) => p + 1)}
      >
        Next
      </button>
    </>
  );
}

export default Users;
