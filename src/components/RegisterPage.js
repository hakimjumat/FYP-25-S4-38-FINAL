import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CSS/RegisterPage.css";

function RegisterPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password do not match!")
      return;
    }

    alert("Account created successfully!");
  };
  
  return (
    <div className="register-page">
      <div className="register-mainpage">

        <Link to="/HomePage" className="back-home">
           ⬅ Back to Home Page
        </Link>
        <div className="title">
          <h1>Create Your Account</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="name-row">
            <div className="name-field">
              <label className="first-name">First name *</label>
              <input
                className="first-name-text"
                type="text"
                placeholder="John"
                minLength={2}
                maxLength={20}
                required
              />
            </div>

            <div className="name-field">
              <label className="last-name">Last name *</label>
              <input
                className="last-name-text"
                type="text"
                placeholder="Tan"
                minLength={2}
                maxLength={20}
                required
              />
            </div>
          </div>

          <label className="email-address">Email Address *</label>
          <input 
            className="email-address-text"
            type="email"
            placeholder="Enter your email address"
            required
            pattern=".+@.+\.com"
          />

          <label className="password">Password *</label>
          <input 
            className="password-text"
            type="password"
            placeholder="Enter a strong password"
            minLength={8}
            maxLength={127}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="confirm-password">Confirm Password *</label>
          <input 
            className="password-text"
            type="password"
            placeholder="Re-enter your password"
            required
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              
              if (e.target.value !== password) {
                e.target.setCustomValidity("Password do not match!");
              } else {
                e.target.setCustomValidity("");
              }
            }}
          />

          <div className="have-acc-div">
            <span>Already have an account?</span>
            <Link to="/LoginPage" className="have-acc-link">
              Login here
            </Link>
          </div>

          <button type="submit" className="register-button">Create Account</button>
        </form>
      </div>
    </div>
  );
}
  
export default RegisterPage;
