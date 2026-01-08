// client/src/components/Admin/CreateUserPage.js
import React, { useState, useContext } from "react";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";
import { useNavigate } from "react-router-dom";
import "../../CSS/AdminPages.css";

function CreateUserPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "student",
  });

  const handleCreate = async () => {
    try {
      await authFetch(
        "http://localhost:5000/api/admin/users",
        {
          method: "POST",
          body: JSON.stringify(formData),
        },
        user
      );
      alert("Account Created Successfully!");
      navigate("/admin/users");
    } catch (err) {
      alert("Failed: " + err.message);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container" style={{ maxWidth: "700px" }}>
        <div className="admin-header">
          <h2>Create New Account</h2>
          <button className="back-btn" onClick={() => navigate("/admin/users")}>
            ✖ Cancel
          </button>
        </div>

        <div className="admin-content">
          <div className="form-grid">
            <div className="form-group">
              <label>First Name</label>
              <input
                className="admin-input"
                placeholder="e.g. John"
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                className="admin-input"
                placeholder="e.g. Doe"
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              className="admin-input"
              type="email"
              placeholder="user@university.edu"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Initial Password</label>
              <input
                className="admin-input"
                type="password"
                placeholder="••••••••"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                className="admin-select"
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
                <option value="internshipprovider">Internship Provider</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
            <button
              className="admin-btn btn-green"
              style={{ flex: 1 }}
              onClick={handleCreate}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CreateUserPage;
