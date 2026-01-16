import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";
import "../../CSS/AdminDashboard.css";

export default function AdminDashboard({ profile }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeStudents: 0,
    instructors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const res = await authFetch(
          "http://localhost:5000/api/admin/stats",
          {},
          user
        );

        if (res.success) {
          setStats({
            totalUsers: res.data.totalUsers || 0,
            activeStudents: res.data.students || 0,
            instructors: res.data.instructors || 0,
          });
        }
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="admin-dashboard">
      <div className="admin-welcome">
        <div className="admin-welcome-row">
          <div>
            <h1>🛡️ Admin Control Panel</h1>
            <p>
              Logged in as Administrator: <strong>{profile?.firstName || "Admin"}</strong>
            </p>
          </div>
          <div className="admin-actions">
            <button
              className="admin-action-btn"
              onClick={() => navigate("/admin/users")}
            >
              Manage User Accounts
            </button>
            <button
              className="admin-action-btn"
            >
              System Settings
            </button>
            <button
              className="admin-action-btn"
            >
              View Logs
            </button>
          </div>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-title">Total Users</div>
          </div>
          <p className="admin-stat-value">
            {loading ? "..." : stats.totalUsers}
          </p>
          <p className="admin-stat-desc">All registered users</p>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-title">Active Students</div>
          </div>
          <p className="admin-stat-value">
            {loading ? "..." : stats.activeStudents}
          </p>
          <p className="admin-stat-desc">Currently enrolled</p>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-title">Instructors</div>
          </div>
          <p className="admin-stat-value">
            {loading ? "..." : stats.instructors}
          </p>
          <p className="admin-stat-desc">Teaching on platform</p>
        </div>
      </div>
    </div>
  );
}