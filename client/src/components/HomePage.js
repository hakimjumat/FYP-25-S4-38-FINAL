import React, { useState, useEffect } from "react";
import "../CSS/HomePage.css";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

import { Link } from "react-router-dom";

function NavBar() {
  return (
    <header className="home-nav">
      <div className="home-nav-left">Learning Platform</div>
      <ul className="home-nav-menu">
        <li>Courses</li>
        <li>About</li>
        <li>Services</li>
        <li>Contact</li>
      </ul>
      <Link to="/LoginPage">
        <button className="home-nav-login-btn">Login / Signup</button>
      </Link>
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

function HomePage() {
  const [user, setUser] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Entering Homepage");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser || null);

      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();

          const response = await fetch(
            "http://localhost:5000/api/students/profile",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();
          setStudentData(data);
        } catch (error) {
          console.error("Error fetching student data:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="home-page">
      <main className="home-hero">
        <section className="home-hero-left">
          <h1>Welcome to HomePage</h1>
          <p>
            This is the learning platform where students can log in to access
            personalised content and features.
          </p>

          {user && (
            <p className="home-logged-in-text">
              You are currently logged in as <strong>{user.email}</strong>.
            </p>
          )}

          {loading && <p>Loading your profile...</p>}
          {error && <p style={{ color: "red" }}>⚠️ Error: {error}</p>}

          {/* DISPLAY BACKEND DATA */}
          {studentData && studentData.gamification && (
            <div className="home-progress-box">
              <h3>🎓 Your Progress</h3>
              <p>
                <strong>Points:</strong> {studentData.gamification.points}
              </p>
              <p>
                <strong>Level:</strong> {studentData.gamification.level}
              </p>
              <p>
                <strong>Current Streak:</strong>{" "}
                {studentData.gamification.streak} days
              </p>
              <p>
                <strong>Badges:</strong>{" "}
                {studentData.gamification.badges.length > 0
                  ? studentData.gamification.badges.join(", ")
                  : "No badges yet - keep learning!"}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default HomePage;
export { NavBar, Footer };
