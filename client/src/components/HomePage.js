import React, { useState, useEffect, useContext } from "react";
import "../CSS/HomePage.css";
// import { auth } from "../firebase";
// import { onAuthStateChanged } from "firebase/auth";
import { AuthContext } from "../auth/authContext";
import { authFetch } from "../services/api";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import StudentDailyLoginStreak from "./Student/StudentDailyLoginStreak";

import { Link, useNavigate } from "react-router-dom";

function NavBar() {
  const { user } = useContext(AuthContext);
  const [dropDownOpen, setDropdownOpen] = useState(false);
  const [navName, setNavName] = useState("");
  const [userRole, setUserRole] = useState("");
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
          setUserRole(response.data.role);
        }
      } catch (error) {
        console.error("Error fetching navbar details:", error);
      }
    };
    fetchNavDetails();
  }, [user]);
  // Logic: Where does "Courses" button go?
  // If Instructor -> /CourseEditorPage
  // If Student/Other -> /CoursePage (later can rename oso
  const coursesLink =
    userRole === "instructor" ? "/CourseEditorPage" : "/CoursePage";
  return (
    <header className="home-nav">
      <div className="home-nav-left">
        <Link to="/" style={{ textDecoration: "none", color: "white" }}>
          Learning Platform
        </Link>
      </div>
      <ul className="home-nav-menu">
        <li>
          <Link
            to={coursesLink}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Courses
          </Link>
        </li>
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

const StudentDashboard = ({ profile, gamification }) => {
  // Logic copied from ProfilePage.js to calculate level
  const currentLevel = gamification?.level || 1;
  const currentLevelProgress = gamification?.points || 0;

  return (
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
        <Link to="/CoursePage">
          <button className="dashboard-btn">My Courses</button>
        </Link>
      </div>

      {gamification && (
        <div className="home-progress-box">
          <h3>Your Progress</h3>
          <div className="level-box">
            <div className="level-info">
              <span className="level-label">
                Level <strong>{currentLevel}</strong>
              </span>
              <span className="points-label">
                {currentLevelProgress} / 100 XP
              </span>
            </div>

            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${currentLevelProgress}%` }}
              ></div>
            </div>

            <p className="streak-text">
              🔥 {gamification.streak || 0} Day Streak
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

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
          onClick={() => navigate("/CourseEditorPage")}
        >
          View Created Courses
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

  //new state to hold the specific days of the calender
  const [calenderDays, setCalendarDays] = useState([]);
  const [showDailyLogin, setShowDailyLogin] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // 1. Fetch User Identity & Role first
        // Note: Your authController.getCurrentUser returns data directly in result.data
        const identityRes = await authFetch(
          "http://localhost:5000/api/auth/current-user",
          { method: "GET" },
          user
        );

        if (identityRes.success) {
          const userProfile = identityRes.data;
          setProfile(userProfile);

          // 2. If Student, execute login logic to record daily login

          if (userProfile.role === "student") {
            const loginRes = await authFetch(
              "http://localhost:5000/api/students/login",
              { method: "POST" },
              user
            );

            // Save the login result, but DO NOT open the modal yet
            let currentStreak = 0;
            let currentDays = [];

            if (loginRes.success) {
              currentDays = loginRes.data.loggedInDays;
              currentStreak = loginRes.data.streak;
              setCalendarDays(currentDays);
            }

            // 3.fetch full Gamification Data
            // We use the student specific route for this
            const studentRes = await authFetch(
              "http://localhost:5000/api/students/profile",
              { method: "GET" },
              user
            );

            if (studentRes.success) {
              // api/students/profile returns nested data: { profile, gamification }
              const backendGamification = studentRes.data.gamification;

              if (loginRes.success) {
                // Update the streak from the login response
                backendGamification.streak = currentStreak;
              }

              setGamification(backendGamification);

              // now open the modal
              if (loginRes.success) {
                setShowDailyLogin(true);
              }
            }
          }
        }
      } catch (error) {
        console.error("Home page load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const isRewardClaimedToday = () => {
    // 1. Safety check
    if (!gamification || !gamification.lastDailyReward) return false;

    const val = gamification.lastDailyReward;
    let lastReward;

    // 2. Handle different date formats
    if (val && typeof val.toDate === "function") {
      // Case A: It's a real Firestore object (rare on frontend)
      lastReward = val.toDate();
    } else if (val && val._seconds !== undefined) {
      // Case B: It's a JSON-serialized Firestore Timestamp (This is what you have)
      lastReward = new Date(val._seconds * 1000);
    } else {
      // Case C: It's a string or standard Date object
      lastReward = new Date(val);
    }

    // 3. Compare with Today
    const now = new Date();
    return lastReward.toDateString() === now.toDateString();
  };

  // handle claim reward from daily login streak
  const handleClaimReward = async () => {
    try {
      // call claim reaward endpoint
      const res = await authFetch(
        "http://localhost:5000/api/students/claim-reward",
        { method: "POST" },
        user
      );

      if (res.success) {
        console.log("Reward claimed:");

        //refresh gamification data points
        const updatedProfile = await authFetch(
          "http://localhost:5000/api/students/profile",
          { method: "GET" },
          user
        );

        if (updatedProfile.success) {
          setGamification(updatedProfile.data.gamification);
        }
      }
    } catch (error) {
      // If the server says "Already claimed", treat it as a success for the UI
      if (error.message.includes("Reward already claimed today")) {
        console.log("Syncing: Reward was already claimed.");

        // 1. Force the UI to update so the button becomes disabled
        // We re-fetch the profile to get the 'lastDailyReward' date from the DB
        const updatedProfile = await authFetch(
          "http://localhost:5000/api/students/profile",
          {},
          user
        );
        if (updatedProfile.success) {
          setGamification(updatedProfile.data.gamification);
        }

        // 2. Optional: Alert the user gently
        alert("You have already claimed your reward for today!");
      } else {
        // Real errors (like server down)
        console.error("Error claiming reward:", error);
      }
      // --- FIX ENDS HERE ---
    }
  };

  if (!user) {
    return (
      <div className="home-page">
        <main className="home-main">
          <section className="hero-section">
            <div className="hero-content">
              <h1>Transform Your Learning Journey</h1>
              <p>
                Experience personalized, gamified education powered by AI. Earn
                points, unlock badges and achieve your goals.
              </p>

              <div className="landing-actions">
                <Link to="/RegisterPage">
                  <button className="btn-get-started">Get Started</button>
                </Link>

                <Link to="/CoursePage">
                  <button className="btn-explore-courses">
                    Explore Courses
                  </button>
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

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

      {/* Daily Login Streak Modal */}

      {profile?.role === "student" && (
        <StudentDailyLoginStreak
          isOpen={showDailyLogin}
          close={() => setShowDailyLogin(false)}
          claim={handleClaimReward}
          streak={gamification?.streak || 0}
          loggedInDays={calenderDays}
          isClaimed={isRewardClaimedToday()}
        />
      )}
    </div>
  );
}

export default HomePage;
export { NavBar, Footer };
