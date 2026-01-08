// client/src/components/Admin/ViewAccountPage.js
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";
import "../../CSS/AdminPages.css";

function ViewAccountPage() {
  const { userId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [originalRole, setOriginalRole] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await authFetch(
          `http://localhost:5000/api/admin/users/${userId}`,
          {},
          user
        );
        setProfile(res.data);
        setOriginalRole(res.data.role);
      } catch (err) {
        navigate("/admin/users");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId, user, navigate]);

  const handleSave = async () => {
    try {
      await authFetch(
        `http://localhost:5000/api/admin/users/${userId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            firstName: profile.firstName,
            lastName: profile.lastName,
          }),
        },
        user
      );

      if (profile.role !== originalRole) {
        await authFetch(
          `http://localhost:5000/api/admin/users/${userId}/role`,
          {
            method: "PUT",
            body: JSON.stringify({ newRole: profile.role }),
          },
          user
        );
        setOriginalRole(profile.role);
      }
      alert("Changes Saved Successfully");
      setIsEditing(false);
    } catch (err) {
      alert("Error saving changes");
    }
  };

  const handleDisable = async () => {
    if (window.confirm(`Are you sure?`)) {
      try {
        await authFetch(
          `http://localhost:5000/api/admin/users/${userId}/status`,
          {
            method: "PUT",
            body: JSON.stringify({ disable: !profile.isDisabled }),
          },
          user
        );
        setProfile({ ...profile, isDisabled: !profile.isDisabled });
      } catch (err) {
        alert("Action failed");
      }
    }
  };

  if (loading || !profile) return <div className="admin-page">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="admin-container" style={{ maxWidth: "800px" }}>
        <div className="admin-header">
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button
              className="back-btn"
              style={{ fontSize: "18px", margin: 0 }}
              onClick={() => navigate("/admin/users")}
            >
              ←
            </button>
            <h2>
              {profile.firstName} {profile.lastName}
            </h2>
            <span
              className={`badge ${
                profile.isDisabled ? "badge-disabled" : "badge-active"
              }`}
            >
              {profile.isDisabled ? "DISABLED" : "ACTIVE"}
            </span>
          </div>
          <div>
            {!isEditing ? (
              <button
                className="admin-btn btn-black"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            ) : (
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="admin-btn btn-outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button className="admin-btn btn-green" onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="admin-content">
          <div className="form-group">
            <label>Email Address (Read-Only)</label>
            <input className="admin-input" value={profile.email} disabled />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>First Name</label>
              <input
                className="admin-input"
                value={profile.firstName || ""}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                className="admin-input"
                value={profile.lastName || ""}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              className="admin-select"
              value={profile.role}
              disabled={!isEditing}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
              <option value="internshipprovider">Internship Provider</option>
            </select>
          </div>

          <hr
            style={{
              border: "none",
              borderTop: "1px solid #eee",
              margin: "30px 0",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong style={{ color: "#d63031", display: "block" }}>
                Danger Zone
              </strong>
              <small style={{ color: "#636e72" }}>
                Disable access for this user immediately.
              </small>
            </div>
            <button
              className={`admin-btn ${
                profile.isDisabled ? "btn-green" : "btn-red"
              }`}
              onClick={handleDisable}
            >
              {profile.isDisabled ? "Enable Account" : "Disable Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ViewAccountPage;
