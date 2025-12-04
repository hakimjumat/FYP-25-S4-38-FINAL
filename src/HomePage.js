import React, { useState, useEffect } from "react";
import "./App.css";
import { auth } from "./firebase";
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
  cost[(studentData, setStudentData)] = useState(null); // store backend data here

  useEffect(() => {
    console.log("Entering Homepage");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser || null);

      // if user is logged in, fetch their data from backed
      if (firebaseUser) {
        try {
          //1. Get the secure Access Token from Firebase
          const token = await firebaseUser.getIdToken();

          //2. Call node.js backend
          const response = await fetch(
            "http://localhost:5000/api/student-profile",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // send the token to the backend
              },
            }
          );

          // 3. save the data
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
    <div className="page">
      {/* TOP NAVBAR */}
      <header className="nav">
        <div className="nav-left">Website</div>
        <ul className="nav-menu">
          <li>Courses</li>
          <li>About</li>
          <li>Services</li>
          <li>Contact</li>
        </ul>
        <button className="nav-login-btn">Login / Signup</button>
      </header>

      {/* MAIN CONTENT */}
      <main className="hero">
        {/* LEFT TEXT */}
        <section className="hero-left">
          <h1>Welcome to HomePage</h1>
          <p>
            This is the learning platform where students can log in to access
            personalised content and features.
          </p>

          {user && (
            <p className="logged-in-text">
              You are currently logged in as <strong>{user.email}</strong>.
            </p>
          )}

          {/* DISPLAY BACKEND DATA HERE */}
          {studentData && studentData.gamification && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                border: "1px solid #4CAF50",
                borderRadius: "8px",
                backgroundColor: "#f9fff9",
              }}
            >
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
        <section className="hero-right">
          {!user ? (
            <div className="login-card"></div>
          ) : (
            <div className="login-card">
              <h2 className="login-title">Logged in</h2>
              <p>You are logged in as {user.email}</p>
              <button className="login-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-left">
          <div className="footer-logo">Website</div>
          <p>123 Learning Street, Singapore</p>
        </div>
        <div className="footer-columns">
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
