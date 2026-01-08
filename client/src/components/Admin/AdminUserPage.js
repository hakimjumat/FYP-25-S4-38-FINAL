// client/src/components/Admin/AdminUserPage.js
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";
import { useNavigate } from "react-router-dom";
import "../../CSS/AdminPages.css"; // <--- IMPORT THE NEW CSS

function AdminUserPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async (query = "") => {
    try {
      const url = query
        ? `http://localhost:5000/api/admin/users?search=${query}`
        : `http://localhost:5000/api/admin/users`;
      const data = await authFetch(url, {}, user);
      setUsers(data.data.users);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* HEADER: Title + Search + Create Button */}
        <div className="admin-header">
          <div>
            <h1>User Management</h1>
            <p
              style={{
                color: "#636e72",
                margin: "5px 0 0 0",
                fontSize: "14px",
              }}
            >
              Manage students, instructors, and admins.
            </p>
          </div>

          <div style={{ display: "flex", gap: "15px" }}>
            <div className="search-box">
              <span style={{ marginRight: "8px" }}>🔍</span>
              <input
                className="search-input"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyUp={(e) => e.key === "Enter" && fetchUsers(searchTerm)}
              />
            </div>

            <button
              className="admin-btn btn-black"
              onClick={() => navigate("/admin/create-user")}
            >
              + New User
            </button>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid}>
                  <td>
                    <div style={{ fontWeight: "bold" }}>
                      {u.firstName} {u.lastName}
                    </div>
                    <div style={{ fontSize: "13px", color: "#636e72" }}>
                      {u.email}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-role">{u.role}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        u.isDisabled ? "badge-disabled" : "badge-active"
                      }`}
                    >
                      {u.isDisabled ? "Disabled" : "Active"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="admin-btn btn-outline"
                      style={{ padding: "6px 12px", fontSize: "13px" }}
                      onClick={() => navigate(`/admin/user/${u.uid}`)}
                    >
                      Manage ⚙️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default AdminUserPage;
