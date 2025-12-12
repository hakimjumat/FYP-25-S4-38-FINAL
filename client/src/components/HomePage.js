import React, { useState, useEffect, useContext, use } from "react";
import "../CSS/HomePage.css";
// import { auth } from "../firebase";
// import { onAuthStateChanged } from "firebase/auth";
import { AuthContext } from "../auth/authContext";
import { authFetch } from "../services/api";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

import { Link, useNavigate } from "react-router-dom";

function NavBar() {
  const { user } = useContext(AuthContext);
  const [dropDownOpen, setDropdownOpen] = useState(false);
  const [navName, setNavName] = useState("");
  const navigate = useNavigate();

  const toggleDropdown = () => setDropdownOpen(!dropDownOpen);

  const handleLogOut = async () => {
    await signOut(auth);
    navigate("/LoginPage");
  };

  useEffect(() => {
    if (!user) return;

    const fetchNavDetails = async () => {
      try {
        const response = await authFetch(
          "http://localhost:5000/api/auth/current-user",
          {},
          user
        );

        if (response.success) {
          setNavName(response.data.firstName);
        }
      } catch (error) {
        console.error("Error fetching navbar details:", error);
      }
    };
    fetchNavDetails();
  }, [user]);
  return (
    <header className="home-nav">
      <div className="home-nav-left">Learning Platform</div>
      <ul className="home-nav-menu">
        <li>Courses</li>
        <li>About</li>
        <li>Services</li>
        <li>Contact</li>
      </ul>
      <div className="home-nav-right">
        {!user ? (
          <Link to="/LoginPage">
            <button className="home-nav-login-btn">Login / Signup</button>
          </Link>
        ) : (
          <div className="dropdown">
            <button className="dropbtn" onClick={toggleDropdown}>
              {navName || user.email} ▼
            </button>
            {dropDownOpen && (
              <div className="dropdown-content">
                <button onClick={() => navigate("/ProfilePage")}>
                  Profile
                </button>
                <button onClick={handleLogOut}>Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="home-footer">
      <div className="home-footer-left">
        <div className="home-footer-logo">Website</div>
        <p>123 Learning Street, Singapore</p>
      </div>
      <div className="home-footer-columns">
        <div>
          <h4>About</h4>
          <p>Company</p>
          <p>Team</p>
          <p>Careers</p>
        </div>
        <div>
          <h4>Support</h4>
          <p>Help Center</p>
          <p>Contact</p>
          <p>FAQ</p>
        </div>
        <div>
          <h4>Social</h4>
          <p>Facebook</p>
          <p>Instagram</p>
          <p>LinkedIn</p>
        </div>
      </div>
    </footer>
  );
}

// --- Dashboard Views ---

const StudentDashboard = ({ profile, gamification }) => (
  <div className="home-welcome-box">
    <div className="dashboard-header">
      <h2>🎓 Student Dashboard</h2>
      <p className="home-logged-in-text">
        Welcome back, <strong>{profile?.firstName}</strong>!
      </p>
    </div>

    <div className="action-row">
      <Link to="/ProfilePage">
        <button className="dashboard-btn">My Profile</button>
      </Link>
      <button className="dashboard-btn">My Courses</button>
    </div>

    {gamification && (
      <div className="home-progress-box">
        <h3>Your Progress</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{gamification.points || 0}</span>
            <span className="stat-label">Points</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{gamification.level || 1}</span>
            <span className="stat-label">Level</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{gamification.streak || 0}</span>
            <span className="stat-label">Day Streak</span>
          </div>
        </div>
      </div>
    )}
  </div>
);

const InstructorDashboard = ({ profile }) => {
  const navigate = useNavigate(); // Add this hook

  return (
    <div className="home-welcome-box instructor-theme">
      <div className="dashboard-header">
        <h2>👨‍🏫 Instructor Portal</h2>
        <p className="home-logged-in-text">
          Hello, <strong>{profile?.firstName}</strong>. Ready to teach?
        </p>
      </div>

      <div className="action-row">
        {/* Update this button */}
        <button
          className="dashboard-btn primary"
          onClick={() => navigate("/CreateCoursePage")}
        >
          Create New Course
        </button>

        <button className="dashboard-btn">Manage Students</button>
      </div>
    </div>
  );
};

const AdminDashboard = ({ profile }) => (
  <div className="home-welcome-box admin-theme">
    <div className="dashboard-header">
      <h2>🛡️ Admin Control Panel</h2>
      <p className="home-logged-in-text">
        Logged in as Administrator: <strong>{profile?.firstName}</strong>
      </p>
    </div>

    <div className="action-row">
      <button className="dashboard-btn warning">Manage Users</button>
      <button className="dashboard-btn">System Settings</button>
      <button className="dashboard-btn">View Logs</button>
    </div>
  </div>
);

// --- Main Page Component ---

function HomePage() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // 1. Fetch User Identity & Role first
        // Note: Your authController.getCurrentUser returns data directly in result.data
        const identityRes = await authFetch(
          "http://localhost:5000/api/auth/current-user",
          {},
          user
        );

        if (identityRes.success) {
          const userProfile = identityRes.data;
          setProfile(userProfile);

          // 2. If Student, fetch Gamification Data
          // We use the student specific route for this
          if (userProfile.role === "student") {
            const studentRes = await authFetch(
              "http://localhost:5000/api/students/profile",
              {},
              user
            );
            if (studentRes.success) {
              // api/students/profile returns nested data: { profile, gamification }
              setGamification(studentRes.data.gamification);
            }
          }
        }
      } catch (err) {
        console.error("Home page load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (!user)
    return <div className="page-loading">Please log in to continue.</div>;

  return (
    <div className="home-page">
      <main className="home-hero">
        <section className="home-hero-left">
          <h1>Welcome to the Platform</h1>
          <p>
            The incentive-driven learning environment tailored to your needs.
          </p>

          {loading ? (
            <p>Loading dashboard...</p>
          ) : (
            <>
              {profile?.role === "student" && (
                <StudentDashboard
                  profile={profile}
                  gamification={gamification}
                />
              )}
              {profile?.role === "instructor" && (
                <InstructorDashboard profile={profile} />
              )}
              {profile?.role === "admin" && (
                <AdminDashboard profile={profile} />
              )}
              {/* Fallback if role is missing/unknown */}
              {!["student", "instructor", "admin"].includes(profile?.role) && (
                <StudentDashboard
                  profile={profile}
                  gamification={gamification}
                />
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default HomePage;
export { NavBar, Footer };
