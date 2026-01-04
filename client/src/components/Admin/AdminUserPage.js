// client/src/components/Admin/AdminUserPage.js
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";
import { useNavigate } from "react-router-dom";

function AdminUserPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetch Users (Normal Flow)
  const fetchUsers = async (query = "") => {
    try {
      // Calls GET /api/admin/users?search=...
      const url = query
        ? `http://localhost:5000/api/admin/users?search=${query}`
        : `http://localhost:5000/api/admin/users`;

      const data = await authFetch(url, {}, user);
      setUsers(data.data.users);
    } catch (err) {
      alert("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Search Handler (Story 3)
  const handleSearch = () => {
    fetchUsers(searchTerm);
  };

  return (
    <div className="admin-page">
      <h1>User Accounts</h1>

      {/* Create Button (Story 1 Trigger) */}
      <button onClick={() => navigate("/admin/create-user")}>
        + Create New Account
      </button>

      {/* Search Bar (Story 3) */}
      <div className="search-bar">
        <input
          placeholder="Search Name or Email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>SEARCH</button>
      </div>

      {/* User List (Story 2) */}
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.uid}>
              <td>{u.email}</td>
              <td>
                {u.firstName} {u.lastName}
              </td>
              <td>{u.role}</td>
              <td>{u.isDisabled ? "DISABLED" : "Active"}</td>
              <td>
                {/* View/Edit Button (Story 4 Trigger) */}
                <button onClick={() => navigate(`/admin/user/${u.uid}`)}>
                  VIEW ACCOUNT
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default AdminUserPage;
