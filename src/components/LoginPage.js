import React, { useState, useEffect } from "react";
import "../CSS/LoginPage.css";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");  
  const [password, setPassword] = useState(""); 
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
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
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="page">
      
      <main className="hero">
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

        <section className="hero-right">
          {!user ? (
            <div className="login-card">
              <h2 className="login-title">Login</h2>

              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  className="login-input"
                  placeholder="Enter your email"
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

                {error && <p className="login-error"> {error}</p>}

                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? "Please wait..." : "Login"}
                </button>

                <p className="login-register-link">
                  Don't have an account?{" "}
                  <Link to="/RegisterPage" className="register-now-link">
                    Register Now
                  </Link>
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
    </div>
  );
}

export default LoginPage;
