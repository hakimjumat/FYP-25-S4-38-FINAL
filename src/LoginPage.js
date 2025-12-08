// src/App.js
import React, { useState, useEffect } from "react";
import "./App.css";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";

import { useNavigate, Navigate } from "react-router-dom";
import { 
  doc,
  setDoc,
  serverTimestamp, 
} from "firebase/firestore";

const successRegister=({ onClose }) => {
  return (
    <div className="success-register-modal">
      <div className="success-register-content">
        <h2>Success!</h2>
        <p>Successfully registered, please login</p>
      </div>
      <button onClick={onClose}>Ok</button>
    </div>
  )
};

function LoginPage() {
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [email, setEmail] = useState(""); // username / email
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false);

  const navigate = useNavigate();

  // keep user logged in if page refreshes
  useEffect(() => {
    console.log("Entering LoginPage");
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || (mode === "register" && (!firstName || !lastName))) {
      setError("Please enter both username/email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    if (mode === "register") {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        const userFullName = `${firstName} ${lastName}`;

        // Update the user's profile with the display name
        await updateProfile(newUser, {
          displayName: userFullName
        });

        const userRef = doc(db, "users", newUser.uid);
        await setDoc(userRef, {
          email: newUser.email,
          firstName: firstName,
          lastName: lastName,
          fullName: userFullName,
          createdAt: serverTimestamp(),
        });
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
        setMode("login");
        setIsRegisterSuccess(true);
      } catch (err) {
        const msg =
          err.code?.replace("auth/", "").replace(/-/g, " ") || err.message;
        setError(msg);
      } finally {
        setLoading(false);
      }
    } else {
      // 5 December Fix
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setEmail("");
        setPassword("");
        navigate("/HomePage");
      } catch (err) {
        const msg =
          err.code?.replace("auth/", "").replace(/-/g, " ") || err.message;
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="page">
      {isRegisterSuccess && <successRegister onClose={() => setIsRegisterSuccess(false)} />}
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
          <h1>Welcome</h1>
          <p>
            This is the learning platform where students can log in to access
            personalised content and features.
          </p>

          {user && (
            <p className="logged-in-text">
              You are currently logged in as <strong>{user.email}</strong>.
            </p>
          )}
        </section>

        {/* RIGHT LOGIN BOX */}
        <section className="hero-right">
          {!user ? (
            <div className="login-card">
              <h2 className="login-title">
                {mode === "login" ? "Login" : "Register"}
              </h2>

              <form onSubmit={handleSubmit}>
                 {mode === 'register' && (
                <div className="register-name">
                  <input
                    type="text"
                    className="register-input"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="register-input"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              )}
                <input
                  type="text"
                  className="login-input"
                  placeholder="Enter your username / email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <input
                  type="password"
                  className="login-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {error && <p className="login-error">⚠ {error}</p>}

                <button type="submit" className="login-btn" disabled={loading}>
                  {loading
                    ? "Please wait..."
                    : mode === "login"
                    ? "Login"
                    : "Register"}
                </button>

                <p
                  className="login-switch"
                  onClick={() =>
                    setMode(mode === "login" ? "register" : "login")
                  }
                >
                  {mode === "login" ? "Register" : "Back to Login"}
                </p>
              </form>
            </div>
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

export default LoginPage;
