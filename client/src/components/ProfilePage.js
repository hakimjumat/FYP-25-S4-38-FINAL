import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../auth/authContext";
import { authFetch } from "../services/api";
import "../CSS/ProfilePage.css";
import "../CSS/CourseEditorPage.css";

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- EDIT MODAL STATE ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatar: "",
  });
  const AVATAR_OPTIONS = ["👨‍🎓", "👩‍🔬", "🦸"];

  // 1. Load Data
  const loadProfile = async () => {
    if (!user) return;
    try {
      const identityRes = await authFetch(
        "http://localhost:5000/api/auth/current-user",
        {},
        user
      );
      if (identityRes.success) {
        setProfileData(identityRes.data);

        if (identityRes.data.role === "student") {
          const studentRes = await authFetch(
            "http://localhost:5000/api/students/profile",
            {},
            user
          );
          if (studentRes.success) setGamification(studentRes.data.gamification);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  // 2. Handle Edit Click
  const handleEditClick = () => {
    setEditForm({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      avatar: profileData.avatar || "👨‍🎓",
    });
    setIsEditOpen(true);
  };

  // 3. Handle Submit Updates
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await authFetch(
        "http://localhost:5000/api/auth/update-profile",
        {
          method: "PUT",
          body: JSON.stringify(editForm),
        },
        user
      );

      setIsEditOpen(false);
      loadProfile(); // Refresh UI
      alert("Profile Updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!profileData) return <div>No data.</div>;

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
        {/* LEFT SECTION */}
        <div className="left-section">
          <div className="profile-header">
            <div
              className="profile-avatar"
              style={{ background: "white", fontSize: "50px" }}
            >
              {profileData.avatar || "👨‍🎓"}
            </div>
            <div>
              <h1 className="profile-name">{displayName}</h1>
              <p className="profile-role">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Account
              </p>
              <p className="email-text">{profileData.email}</p>
            </div>
          </div>

          <div className="about-section">
            <h2>About me</h2>
            <p className="about-placeholder">{getAboutText(userRole)}</p>
          </div>

          {/* DYNAMIC STATS SECTION */}
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

          {/* Instructor Stats */}
          {userRole === "instructor" && (
            <div className="courses-section">
              <h2>Teaching Stats</h2>
              <ul className="stat-list">
                <li>
                  📚 Active Courses: <strong>3</strong>
                </li>
                <li>
                  👨‍🎓 Students Enrolled: <strong>128</strong>
                </li>
                <li>
                  ⭐ Instructor Rating: <strong>4.8/5</strong>
                </li>
              </ul>
            </div>
          )}

          {/* Admin Stats */}
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

        {/* RIGHT SECTION */}
        <div className="right-section">
          {userRole === "student" && (
            <div className="badges-section">
              <h2>Earned Badges</h2>
              <div className="badges-container">
                {gamification?.badges && gamification.badges.length > 0 ? (
                  gamification.badges.map((badge, index) => (
                    <div key={index} className="badge" title={badge}>
                      🏅
                    </div>
                  ))
                ) : (
                  <p className="no-badges-text">
                    No badges yet. Keep learning!
                  </p>
                )}
              </div>
            </div>
          )}

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
            <button onClick={handleEditClick}>Edit Profile</button>
            {userRole === "student" ? <button>My Courses</button> : null}
            {userRole === "instructor" ? <button>Create Course</button> : null}
            {userRole === "admin" ? <button>User Management</button> : null}
          </div>
        </div>

        {/* === EDIT MODAL === */}
        {isEditOpen && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h2>Edit Profile</h2>
              <form onSubmit={handleEditSubmit}>
                {/* Avatar Selector */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "15px",
                    margin: "20px 0",
                  }}
                >
                  {AVATAR_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setEditForm({ ...editForm, avatar: opt })}
                      style={{
                        fontSize: "30px",
                        background:
                          editForm.avatar === opt ? "#e0e0ff" : "transparent",
                        border:
                          editForm.avatar === opt
                            ? "2px solid #6c5ce7"
                            : "1px solid #ddd",
                        borderRadius: "50%",
                        width: "60px",
                        height: "60px",
                        cursor: "pointer",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <input
                  className="modal-input"
                  placeholder="First Name"
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, firstName: e.target.value })
                  }
                />

                <input
                  className="modal-input"
                  placeholder="Last Name"
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lastName: e.target.value })
                  }
                />

                {/* LOCKED EMAIL FIELD */}
                <div style={{ textAlign: "left", width: "100%" }}>
                  <label
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginLeft: "5px",
                    }}
                  >
                    Email Address (Locked)
                  </label>
                  <input
                    className="modal-input"
                    value={editForm.email}
                    disabled // <--- This disables typing
                    style={{
                      backgroundColor: "#f5f5f5",
                      color: "#888",
                      cursor: "not-allowed",
                    }} // Visual feedback
                  />
                </div>

                <button type="submit" className="modal-btn">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="text-btn"
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
