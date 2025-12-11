import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../auth/authContext";
import { authFetch } from "../services/api";
import "../CSS/ProfilePage.css";

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        // 1. Fetch Basic Identity & Role
        const identityRes = await authFetch(
          "http://localhost:5000/api/auth/current-user",
          {},
          user
        );

        if (identityRes.success) {
          const basicProfile = identityRes.data;
          setProfileData(basicProfile);

          // 2. Fetch extra data based on role
          if (basicProfile.role === "student") {
            const studentRes = await authFetch(
              "http://localhost:5000/api/students/profile",
              {},
              user
            );
            if (studentRes.success) {
              setGamification(studentRes.data.gamification);
            }
          }
          // Future: Add similar fetches for instructor/admin specific data here
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  if (loading) return <div>Loading profile...</div>;
  if (!profileData) return <div>No profile data found.</div>;

  const displayName = `${profileData.firstName} ${profileData.lastName}`;
  const userRole = profileData.role || "student";

  // --- HELPER: Get Dynamic "About Me" Text ---
  const getAboutText = (role) => {
    switch (role) {
      case "instructor":
        return "Passionate educator dedicated to student success and curriculum development.";
      case "admin":
        return "System Administrator managing platform operations and user accounts.";
      default:
        return "Student at the Incentive-Driven Learning Platform.";
    }
  };

  // --- HELPER: Calculate Level (Student Only) ---
  const points = gamification?.points || 0;
  const currentLevel = Math.floor(points / 100) + 1;
  const currentLevelProgress = points % 100;

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* --- LEFT SECTION --- */}
        <div className="left-section">
          <div className="profile-header">
            <div className="profile-avatar">{displayName.charAt(0)}</div>
            <div>
              <h1 className="profile-name">{displayName}</h1>
              <p className="profile-role">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </p>
              <p className="email-text">{profileData.email}</p>
            </div>
          </div>

          <div className="about-section">
            <h2>About me</h2>
            <p className="about-placeholder">{getAboutText(userRole)}</p>
          </div>

          {/* --- DYNAMIC STATS SECTION --- */}

          {/* 1. STUDENT STATS */}
          {userRole === "student" && (
            <div className="courses-section">
              <h2>Current Progress</h2>
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
                  🔥 {gamification?.streak || 0} Day Streak
                </p>
              </div>
            </div>
          )}

          {/* 2. INSTRUCTOR STATS (Placeholders for now) */}
          {userRole === "instructor" && (
            <div className="courses-section">
              <h2>Teaching Stats</h2>
              <ul className="stat-list">
                <li>
                  📚 Active Courses: <strong>3</strong>
                </li>
                <li>
                  wf Students Enrolled: <strong>128</strong>
                </li>
                <li>
                  ⭐ Instructor Rating: <strong>4.8/5</strong>
                </li>
              </ul>
            </div>
          )}

          {/* 3. ADMIN STATS (Placeholders for now) */}
          {userRole === "admin" && (
            <div className="courses-section">
              <h2>System Overview</h2>
              <ul className="stat-list">
                <li>
                  👥 Total Users: <strong>1,240</strong>
                </li>
                <li>
                  🟢 System Status:{" "}
                  <strong style={{ color: "green" }}>Online</strong>
                </li>
                <li>
                  ⚠️ Pending Reports: <strong>0</strong>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* --- RIGHT SECTION --- */}
        <div className="right-section">
          {/* Students see Badges */}
          {userRole === "student" && (
            <div className="badges-section">
              <h2>Earned Badges</h2>
              <div className="badges-container">
                {gamification?.badges?.length > 0 ? (
                  gamification.badges.map((b, i) => (
                    <div key={i} className="badge" title={b}>
                      🏅
                    </div>
                  ))
                ) : (
                  <p className="no-badges-text">No badges yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Instructors/Admins see Account Details */}
          {userRole !== "student" && (
            <div className="badges-section">
              <h2>Account Details</h2>
              <div className="info-box">
                <p>
                  <strong>ID:</strong> {user.uid.substring(0, 10)}...
                </p>
                <p>
                  <strong>Joined:</strong>{" "}
                  {new Date(
                    profileData.createdAt?._seconds * 1000 || Date.now()
                  ).toLocaleDateString()}
                </p>
                <p>
                  <strong>Access Level:</strong> Full
                </p>
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button>Edit Profile</button>
            {userRole === "student" ? <button>My Courses</button> : null}
            {userRole === "instructor" ? <button>Create Course</button> : null}
            {userRole === "admin" ? <button>User Management</button> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
