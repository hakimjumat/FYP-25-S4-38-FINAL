import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../auth/authContext";
import { authFetch } from "../services/api"; // Use your API wrapper
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
        // Call YOUR Backend, not Firebase directly
        const response = await authFetch(
          "http://localhost:5000/api/students/profile",
          {},
          user
        );

        if (response.success) {
          setProfileData(response.data.profile);
          setGamification(response.data.gamification);
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

  return (
    <div className="profile-page">
      {" "}
      {/* Fixed CSS class case sensitive typo */}
      <div className="profile-container">
        {/* LEFT SECTION */}
        <div className="left-section">
          <div className="profile-header">
            <div className="profile-avatar">{displayName.charAt(0)}</div>
            <div>
              <h1 className="profile-name">{displayName}</h1>
              <p className="profile-role">{profileData.role}</p>
              <p>Points: {gamification?.points || 0}</p>
            </div>
          </div>
          {/* ... rest of your JSX ... */}
        </div>

        {/* RIGHT SECTION */}
        <div className="right-section">
          {/* Use gamification data from backend */}
          <div className="badges-section">
            <h2>Badges</h2>
            <div className="badges-container">
              {gamification?.badges?.length > 0 ? (
                gamification.badges.map((b, i) => (
                  <div key={i} className="badge">
                    {b}
                  </div>
                ))
              ) : (
                <p>No badges yet</p>
              )}
            </div>
          </div>
          {/* ... buttons ... */}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
