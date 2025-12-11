import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CSS/LoginPage.css";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
      navigate("/HomePage");
    } catch (err) {
      const msg =
        err.code?.replace("auth/", "").replace(/-/g, " ") || err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card-container">
        
        <Link to="/HomePage" className="back-home">
          ⬅ Back to Home Page
        </Link>

        <div className="login-title">
          <h1>Login to Your Account</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="login-label">Email Address</label>
          <input
            className="login-input"
            type="email"
            placeholder="Enter your email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="login-label">Password</label>
          <input
            className="login-input"
            type="password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="login-error">{error}</p>}

          <div className="no-acc-div">
            <span>Don't have an account?</span>
            <Link to="/RegisterPage" className="login-link">
              Register here
            </Link>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
