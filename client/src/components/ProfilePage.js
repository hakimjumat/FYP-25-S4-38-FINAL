import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../auth/authContext";
import { authFetch } from "../services/api";
import "../CSS/ProfilePage.css";

import BADGE_LIBRARY from "../services/badgeConfig.js";

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- MODAL STATES ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false); // Controls the Badge Popup

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatar: "",
  });
  const AVATAR_OPTIONS = ["👨‍🎓", "👩‍🔬", "🦸", "🕵️", "🧑‍🚀"];

  // --- NEW: ROLE DESCRIPTIONS MAPPING ---
  const ROLE_DESCRIPTIONS = {
    student: "Student at the Incentive-Driven Learning Platform.",
    instructor: "Passionate educator dedicated to student success.",
    admin: "Administrator overseeing platform operations and user management.",
    internshipprovider:
      "Industry partner connecting students with career opportunities.",
  };

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

  if (!user) return <div className="profile-page">Redirecting...</div>;

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
      loadProfile();
      alert("Profile Updated!");
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!profileData) return <div>No data.</div>;

  const displayName = `${profileData.firstName} ${profileData.lastName}`;
  const userRole = profileData.role || "student";

  // Helpers
  const points = gamification?.points || 0;
  const currentLevel = gamification?.level || 1;
  const currentLevelProgress = points;

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
                {/* Capitalize Role */}
                {userRole === "internshipprovider"
                  ? "Internship Provider"
                  : userRole.charAt(0).toUpperCase() + userRole.slice(1)}{" "}
                Account
              </p>
              <p className="email-text">{profileData.email}</p>
            </div>
          </div>

          <div className="about-section">
            <h2>About me</h2>
            <p className="about-placeholder">
              {/* === UPDATED LOGIC HERE === */}
              {ROLE_DESCRIPTIONS[userRole] || ROLE_DESCRIPTIONS["student"]}
            </p>
          </div>

          {/* DYNAMIC STATS */}
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
        </div>

        {/* RIGHT SECTION */}
        <div className="right-section">
          {/* --- FIX: EARNED BADGES PREVIEW --- */}
          {userRole === "student" && (
            <div className="badges-section">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2>Earned Badges</h2>
                {gamification?.badges?.length > 0 && (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onClick={() => setIsBadgeModalOpen(true)}
                  >
                    View All ➔
                  </span>
                )}
              </div>

              {/* Click container to open modal */}
              <div
                className="badges-container"
                onClick={() => setIsBadgeModalOpen(true)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {gamification?.badges && gamification.badges.length > 0 ? (
                  // LOGIC: Take only the first 3 badges
                  gamification.badges.slice(0, 3).map((badge, index) => {
                    // This ensures we get a clean String, even if the DB has "dirty" objects
                    let finalName = "";

                    if (typeof badge === "string") {
                      finalName = badge;
                    } else if (typeof badge === "object" && badge !== null) {
                      // If DB accidentally saved it as an object
                      finalName = badge.name || "Unknown";
                    }

                    // --- 2. DEBUGGING (Check your Console to see this) ---
                    console.log(`Badge #${index}:`, finalName);
                    console.log(
                      "Found in Library?",
                      BADGE_LIBRARY[finalName] ? "YES" : "NO"
                    );

                    // --- 3. LOOKUP (Use finalName, not badgeName) ---
                    const badgeInfo = BADGE_LIBRARY[finalName] || {
                      icon: "❓",
                      color: "#eee",
                    };

                    return (
                      <div
                        key={index}
                        className="badges"
                        title={finalName} // Use finalName here too
                        style={{
                          backgroundColor: badgeInfo.color,
                          width: "60px",
                          height: "60px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "10px",
                          fontSize: "30px",
                        }}
                      >
                        {badgeInfo.icon}
                      </div>
                    );
                  })
                ) : (
                  <p className="no-badges-text">
                    No badges yet. Keep learning!
                  </p>
                )}

                {/* Visual indicator if there are more than 3 */}
                {gamification?.badges?.length > 3 && (
                  <div
                    style={{
                      alignSelf: "center",
                      color: "#888",
                      fontSize: "12px",
                    }}
                  >
                    +{gamification.badges.length - 3} more...
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button onClick={handleEditClick}>Edit Profile</button>
            {userRole === "student" && <button>My Courses</button>}
          </div>
        </div>

        {/* === EDIT PROFILE MODAL === */}
        {isEditOpen && (
          <div className="profile-modal-overlay">
            <div className="profile-modal-box">
              <h2>Edit Profile</h2>
              <form onSubmit={handleEditSubmit}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                    margin: "20px 0",
                  }}
                >
                  {AVATAR_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setEditForm({ ...editForm, avatar: opt })}
                      style={{
                        fontSize: "24px",
                        background:
                          editForm.avatar === opt ? "#e0e0ff" : "transparent",
                        border:
                          editForm.avatar === opt
                            ? "2px solid #6c5ce7"
                            : "1px solid #ddd",
                        borderRadius: "50%",
                        width: "50px",
                        height: "50px",
                        cursor: "pointer",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <input
                  className="profile-modal-input"
                  placeholder="First Name"
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, firstName: e.target.value })
                  }
                />
                <input
                  className="profile-modal-input"
                  placeholder="Last Name"
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lastName: e.target.value })
                  }
                />
                <button type="submit" className="profile-modal-btn">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="profile-text-btn"
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}

        {/* === NEW: FULL BADGE COLLECTION MODAL === */}
        {isBadgeModalOpen && (
          <div
            className="profile-modal-overlay"
            onClick={() => setIsBadgeModalOpen(false)}
          >
            <div
              className="profile-modal-box"
              onClick={(e) => e.stopPropagation()}
              style={{ width: "500px", maxWidth: "90%" }}
            >
              <h2>🏅 My Badge Collection</h2>
              <p style={{ marginBottom: "20px", color: "#666" }}>
                You have earned {gamification?.badges?.length || 0} badges!
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                  maxHeight: "400px",
                  overflowY: "auto",
                }}
              >
                {gamification?.badges && gamification.badges.length > 0 ? (
                  gamification.badges.map((badgeName, index) => {
                    const badgeInfo = BADGE_LIBRARY[badgeName] || {
                      icon: "❓",
                      description: "Unknown Badge",
                      color: "#f0f0f0",
                    };

                    return (
                      <div
                        key={index}
                        style={{
                          border: "1px solid #eee",
                          borderRadius: "10px",
                          padding: "15px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center",
                          backgroundColor: "#fafafa",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "40px",
                            background: badgeInfo.color,
                            borderRadius: "50%",
                            width: "70px",
                            height: "70px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "10px",
                          }}
                        >
                          {badgeInfo.icon}
                        </div>
                        <strong
                          style={{ fontSize: "16px", marginBottom: "5px" }}
                        >
                          {badgeName}
                        </strong>
                        <p
                          style={{ fontSize: "12px", color: "#555", margin: 0 }}
                        >
                          {badgeInfo.description}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p>No badges found.</p>
                )}
              </div>

              <button
                onClick={() => setIsBadgeModalOpen(false)}
                className="profile-modal-btn"
                style={{ marginTop: "20px" }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
