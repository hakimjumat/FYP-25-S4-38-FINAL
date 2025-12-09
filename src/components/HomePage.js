import React, { useState, useEffect } from "react";
import "../CSS/HomePage.css";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { Link, Navigate, useNavigate } from "react-router-dom";

function HomePage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    console.log("Entering Homepage");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser || null);

      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();

          const response = await fetch(
            "http://localhost:5000/api/student-profile",
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

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="home-page">
      {/* TOP NAVBAR */}
      <header className="home-nav">
        <div className="home-nav-left">Learning Platform</div>
        <ul className="home-nav-menu">
          <li>Courses</li>
          <li>About</li>
          <li>Services</li>
          <li>Contact</li>
        </ul>
        <button className="home-nav-login-btn">Login / Signup</button>
      </header>

      {/* MAIN CONTENT */}
      <main className="home-hero">
        {/* LEFT TEXT */}
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

          {/* DISPLAY BACKEND DATA */}
          {studentData && studentData.gamification && (
            <div className="progress-box">
              <h3>🎓 Your Progress</h3>
              <p>
                <strong>Points:</strong> {studentData.gamification.points}
              </p>
              <p>
                <strong>Level:</strong> {studentData.gamification.level}
              </p>
              <p>
                <strong>Current Streak:</strong>{" "}
                {studentData.gamification.streak} days 🔥
              </p>
              <p>
                <strong>Badges:</strong>{" "}
                {studentData.gamification.badges.join(", ")}
              </p>
            </div>
          )}
        </section>

        {/* RIGHT LOGIN BOX */}
        <section className="home-hero-right">
          {!user ? (
            <div className="home-login-card"></div>
          ) : (
            <div className="home-login-card">
              <h2 className="home-login-title">Logged in</h2>
              <p>You are logged in as {user.email}</p>
              <button className="home-login-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
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
    </div>
  );
}

export default HomePage;
