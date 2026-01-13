import React from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/HomePage.css";

export default function InternshipProviderDashboard({ profile }) {
  const navigate = useNavigate();

  return (
    <div className="home-welcome-box" style={{ borderLeft: "5px solid #e1b12c" }}>
      <div className="dashboard-header">
        <h2>🏭 Internship Partner Portal</h2>
        <p className="home-logged-in-text">
          Welcome, <strong>{profile?.firstName}</strong>.
          <br />
          Ready to find the next generation of talent?
        </p>
      </div>

      <div className="action-row">
        <button
          className="dashboard-btn primary"
          style={{ backgroundColor: "#e1b12c", border: "none" }}
          onClick={() => navigate("/InternshipPostingPage")}
        >
          Manage Job Postings
        </button>

        <button className="dashboard-btn" onClick={() => navigate("/ProfilePage")}>
          Company Profile
        </button>
      </div>
    </div>
  );
}
