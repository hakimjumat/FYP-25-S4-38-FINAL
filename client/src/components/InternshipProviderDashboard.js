import React from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/HomePage.css";

export default function InternshipProviderDashboard({ profile }) {
  const navigate = useNavigate();

  return (
    <div
      className="home-welcome-box"
      style={{ borderLeft: "5px solid #e1b12c" }}
    >
      <div className="welcome-header">
        <div className="welcome-text">
          <h1>🏭 Internship Partner Portal</h1>
          <p className="home-logged-in-text">
            Welcome, <strong>{profile?.firstName}</strong>.
            <br />
            Ready to find the next generation of talent?
          </p>
        </div>

        <div className="quick-actions">
          {/* Use the standard 'btn' classes from HomePage.css */}
          <button
            className="btn"
            style={{
              backgroundColor: "#e1b12c",
              color: "white",
              border: "none",
            }}
            onClick={() => navigate("/InternshipPostingPage")}
          >
            Manage Job Postings
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => navigate("/ProfilePage")}
          >
            Company Profile
          </button>
        </div>
      </div>
    </div>
  );
}
