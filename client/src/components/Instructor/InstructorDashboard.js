import React from "react";
import { useNavigate } from "react-router-dom";
import "../../CSS/HomePage.css";

export default function InstructorDashboard({ profile }) {
  const navigate = useNavigate();

  return (
    <div className="home-welcome-box instructor-theme">
      <div className="dashboard-header">
        <h2>👨‍🏫 Instructor Portal</h2>
        <p className="home-logged-in-text">
          Hello, <strong>{profile?.firstName}</strong>. Ready to teach?
        </p>
      </div>

      <div className="action-row">
        <button
          className="dashboard-btn primary"
          onClick={() => navigate("/CourseEditorPage")}
        >
          View Created Courses
        </button>

        <button className="dashboard-btn">Manage Students</button>
      </div>
    </div>
  );
}
