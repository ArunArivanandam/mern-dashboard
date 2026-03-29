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

      {users.map((user) => (
        <p key={user._id}>{user.userName}</p>
      ))}
    </div>
  );
}

export default Users;
