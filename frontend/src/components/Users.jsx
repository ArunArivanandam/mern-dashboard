import { useEffect, useState } from "react";

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/users");
        if (!response.ok) {
          throw new Error(`Http error status ${response.status}`);
        }
        const users = await response.json();
        setUsers(users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Users List</h2>
      <table className="w-full border border-gray-200 mt-5">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Age</th>
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
      {/* {users.map((user) => (
        <p key={user._id}>{user.userName}</p>
      ))} */}
    </div>
  );
}

export default Users;
