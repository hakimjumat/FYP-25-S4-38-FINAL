import React, { useState, useEffect } from "react";
import "../CSS/ProfilePage.css";


function ProfilePage() {
    return(
        <div className="profile-Page">
            <div className="profile-container">

                {/* LEFT SECTION */}
                <div className="left-section">
                    
                    {/* Profile header */}
                    <div className="profile-header">
                    <div className="profile-avatar"></div>

                    <div>
                        <h1 className="profile-name">John Doe</h1>
                        <p className="profile-role">Student</p>
                    </div>
                    </div>

                    {/* About me */}
                    <div className="about-section">
                    <h2>About me</h2>
                    <p className="about-placeholder"></p>
                    </div>

                    {/* Completed courses */}
                    <div className="courses-section">
                    <h2>Completed courses</h2>
                    <ul>
                        
                    </ul>
                    </div>

                </div>

                {/* RIGHT SECTION */}
                <div className="right-section">

                    {/* Badges */}
                    <div className="badges-section">
                    <h2>Badges</h2>
                    <div className="badges-container">
                        {/* Example badges */}
                        <div className="badge">🏅</div>
                        <div className="badge">🎖️</div>
                        <div className="badge">🥇</div>
                    </div>
                    </div>

                    {/* Buttons */}
                    <div className="action-buttons">
                    <button>View reviews</button>
                    <button>Course recommendations</button>
                    <button>Edit account</button>
                    <button>Student weaknesses</button>
                    </div>

                </div>
            </div>
        </div>
    );
}
export default ProfilePage;