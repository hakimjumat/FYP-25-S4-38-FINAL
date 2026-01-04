import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";

function ViewAccountPage() {
  const { userId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "",
    isDisabled: false,
  });
  const [originalRole, setOriginalRole] = useState(""); // To track if role changed
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Fetch User Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await authFetch(
          `http://localhost:5000/api/admin/users/${userId}`,
          {},
          user
        );
        setProfile(res.data);
        setOriginalRole(res.data.role); // Save original role
      } catch (err) {
        alert("Failed to load user");
        navigate("/admin/users");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId, user, navigate]);

  // 2. Handle Save (Dual Update: Details + Role)
  const handleSave = async () => {
    try {
      // A. Update Profile Details (First Name, Last Name)
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

      // B. Update Role (Only if it changed)
      // We do this separately because your backend has a dedicated route for roles
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
      console.error(err);
      alert("Error saving changes. Check console for details.");
    }
  };

  // 3. Handle Disable
  const handleDisable = async () => {
    if (
      window.confirm(
        `Are you sure you want to ${
          profile.isDisabled ? "ENABLE" : "DISABLE"
        } this account?`
      )
    ) {
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
        alert(profile.isDisabled ? "Account Enabled" : "Account Disabled");
      } catch (err) {
        alert("Action failed");
      }
    }
  };

  if (loading) return <div>Loading Profile...</div>;

  return (
    <div className="form-container">
      <button onClick={() => navigate("/admin/users")} className="back-btn">
        ← Back to Users
      </button>
      <h2>User Details</h2>

      {/* Email (Read Only) */}
      <div className="form-group">
        <label>Email:</label>
        <input value={profile.email} disabled className="disabled-input" />
      </div>

      {/* First Name */}
      <div className="form-group">
        <label>First Name:</label>
        <input
          value={profile.firstName || ""}
          disabled={!isEditing}
          onChange={(e) =>
            setProfile({ ...profile, firstName: e.target.value })
          }
        />
      </div>

      {/* Last Name (New) */}
      <div className="form-group">
        <label>Last Name:</label>
        <input
          value={profile.lastName || ""}
          disabled={!isEditing}
          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
        />
      </div>

      {/* Role Dropdown (New) */}
      <div className="form-group">
        <label>Role:</label>
        <select
          value={profile.role}
          disabled={!isEditing}
          onChange={(e) => setProfile({ ...profile, role: e.target.value })}
        >
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="button-group" style={{ marginTop: "20px" }}>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)}>Edit Details</button>
        ) : (
          <>
            <button onClick={handleSave} style={{ backgroundColor: "#27ae60" }}>
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              style={{ backgroundColor: "#7f8c8d", marginLeft: "10px" }}
            >
              Cancel
            </button>
          </>
        )}

        <button
          onClick={handleDisable}
          style={{
            backgroundColor: profile.isDisabled ? "#27ae60" : "#c0392b",
            float: "right",
          }}
        >
          {profile.isDisabled ? "ENABLE ACCOUNT" : "DISABLE ACCOUNT"}
        </button>
      </div>
    </div>
  );
}

export default ViewAccountPage;
