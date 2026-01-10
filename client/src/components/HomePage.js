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
import BADGE_LIBRARY from "../services/badgeConfig";

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
                <button onClick={() => navigate("/InboxPage")}>Inbox</button>
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
  const currentPoints = gamification?.points || 0;
  const currentStreak = gamification?.streak || 0;
  const badgesCount = gamification?.badges?.length || 0;

  return (
    <div className="student-dashboard">
      <div className="welcome-header">
        <div className="welcome-greeting">
          <div className="welcome-avatar">
            {profile?.avatar || "👨‍🎓"}
          </div>
          <div className="welcome-text">
            <h1>Welcome back, {profile?.firstName || "there"}!</h1>
            <p>Ready to continue your learning journey?</p>
          </div>
        </div>
        <div className="quick-actions">
          <Link to="/ProfilePage">
            <button className="btn btn-primary">My Profile</button>
          </Link>
          <Link to="/CoursePage">
            <button className="btn btn-secondary">Browse Courses</button>
          </Link>
          <Link to="/RewardStorePage">
            <button className="btn btn-primary">Rewards Store</button>
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-purple">⭐</div>
          <h3>{currentLevel}</h3>
          <p>Current Level</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-green">💎</div>
          <h3>{currentPoints}</h3>
          <p>Total Points</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-orange">🔥</div>
          <h3>{currentStreak}</h3>
          <p>Day Streak</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-blue">🏅</div>
          <h3>{badgesCount}</h3>
          <p>Badges Earned</p>
        </div>
      </div>

      <div className="progress-card">
        <div className="progress-card-header">📈 Your Progress</div>
        <div className="progress-main">
          <div className="level-circle">
            <span className="label">Level</span>
            <span className="number">{currentLevel}</span>
          </div>
          <div className="progress-details">
            <h3>Great Progress! Keep it up! 🚀</h3>
            
            <div className="xp-bar-container">
              <div 
                className="xp-bar-fill" 
                style={{ width: `${currentPoints}%` }}
              />
            </div>

            <div className="xp-text">
              <span>{currentPoints} / 100 XP</span>
              <span>Level {currentLevel + 1}</span>
            </div>
          </div>
        </div>
        <div className="streak-badge">
          <span>🔥</span>
          <span>{currentStreak} Day Streak - {currentStreak >= 7 ? "You're on fire!" : "Keep going!"}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">🏅 Your Badges</div>
          {gamification?.badges && gamification.badges.length > 0 ? (
            <div className="badges-grid">
              {gamification.badges.map((badgeName, index) => {
                const badgeInfo = BADGE_LIBRARY[badgeName] || {
                  icon: "❓",
                  description: "Unknown badge",
                  color: "#f0f0f0",
                };
                return (
                  <div key={index} className="badge-item">
                    <div
                      className="badge-icon-wrapper"
                      style={{ backgroundColor: badgeInfo.color }}
                    >
                      {badgeInfo.icon}
                    </div>
                    <h4>{badgeName}</h4>
                    <p>{badgeInfo.description.substring(0, 25)}...</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-badges">
              <div className="no-badges-icon">🏅</div>
              <p>No badges yet. Keep learning to earn your first badge!</p>
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-header">Quick Actions</div>
          <div className="quick-actions-grid">
            <Link to="/CoursePage" className="quick-action-btn">
              <div className="quick-action-icon icon-purple">📚</div>
              <div className="quick-action-text">
                <h4>My Courses</h4>
                <p>Continue learning</p>
              </div>
            </Link>
            <Link to="/InboxPage" className="quick-action-btn">
              <div className="quick-action-icon icon-green">📬</div>
              <div className="quick-action-text">
                <h4>Inbox</h4>
                <p>View messages</p>
              </div>
            </Link>
            <Link to="/InternshipListPage" className="quick-action-btn">
              <div className="quick-action-icon icon-orange">💼</div>
              <div className="quick-action-text">
                <h4>Internships</h4>
                <p>View opportunities</p>
              </div>
            </Link>
            <Link to="/RewardStorePage" className="quick-action-btn">
              <div className="quick-action-icon icon-blue">🎁</div>
              <div className="quick-action-text">
                <h4>Rewards</h4>
                <p>Redeem points</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
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

const AdminDashboard = ({ profile }) => {
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
};

const InternshipProviderDashboard = ({ profile }) => {
  const navigate = useNavigate();

  return (
    <div
      className="home-welcome-box"
      style={{ borderLeft: "5px solid #e1b12c" }}
    >
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

        <button
          className="dashboard-btn"
          onClick={() => navigate("/ProfilePage")}
        >
          Company Profile
        </button>
      </div>
    </div>
  );
};

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

          <section className="landing-page-features" id="features">
            <h2>Why Choose Our Platform?</h2>

            <div className="landing-page-features-grid">
              <div className="landing-page-feature-card">
                <div className="landing-page-feature-icon">🎮</div>
                <h3>Gamified Learning Experience</h3>
                <p>
                  Earn points, unlock badges and climb leaderboards while
                  learning new skills.
                </p>
              </div>

              <div className="landing-page-feature-card">
                <div className="landing-page-feature-icon">🤖</div>
                <h3>AI-Powered Insights</h3>
                <p>
                  Receive personalized course recommendations based on your
                  learning style.
                </p>
              </div>

              <div className="landing-page-feature-card">
                <div className="landing-page-feature-icon">📈</div>
                <h3>Track Progress</h3>
                <p>
                  Monitor your learning progress with clear analytics and
                  performance metrics.
                </p>
              </div>

              <div className="landing-page-feature-card">
                <div className="landing-page-feature-icon">💪</div>
                <h3>Stay Motivated</h3>
                <p>
                  Build daily learning streaks and maintain consistent progress
                  toward your goals.
                </p>
              </div>

              <div className="landing-page-feature-card">
                <div className="landing-page-feature-icon">👥</div>
                <h3>Connect & Learn</h3>
                <p>
                  Engage with instructors and peers through discussions and
                  platform messaging.
                </p>
              </div>

              <div className="landing-page-feature-card">
                <div className="landing-page-feature-icon">🧑‍🏫</div>
                <h3>Expert Instructors</h3>
                <p>
                  Learn from professional instructors with real-world
                  experience.
                </p>
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
              {profile?.role === "internshipprovider" && (
                <InternshipProviderDashboard profile={profile} />
              )}

              {/* Fallback if role is missing/unknown */}
              {![
                "student",
                "instructor",
                "admin",
                "internshipprovider",
              ].includes(profile?.role) && (
                <StudentDashboard
                  profile={profile}
                  gamification={gamification}
                />
              )}
            </>
          )}
        </section>
      </main>

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
