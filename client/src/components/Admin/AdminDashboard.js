import React from "react";
import { useNavigate } from "react-router-dom";
import "../../CSS/HomePage.css";

export default function AdminDashboard({ profile }) {
  const navigate = useNavigate();

  return (
    <div className="home-welcome-box admin-theme">
      <div className="dashboard-header">
        <h2>🛡️ Admin Control Panel</h2>
        <p className="home-logged-in-text">
          Logged in as Administrator: <strong>{profile?.firstName}</strong>
        </p>
      </div>

      <div className="action-row">
        <button
          className="dashboard-btn warning"
          onClick={() => navigate("/admin/users")}
        >
          Manage User Accounts
        </button>
        <button className="dashboard-btn">System Settings</button>
        <button className="dashboard-btn">View Logs</button>
      </div>
    </div>
  );
}
