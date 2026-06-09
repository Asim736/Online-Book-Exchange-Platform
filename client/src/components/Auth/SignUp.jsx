import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/constants.js";
import "./styles/Auth.css";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log("Registration successful:", data);
        // Show success message instead of immediately redirecting
        setSuccessMessage(data.message || 'Account created! Please check your email to verify your account.');
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create an Account</h2>
        {error && <div className="auth-error">{error}</div>}
        {successMessage ? (
          <div className="success-message" style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="auth-success-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
            <p style={{ fontSize: '16px', color: '#333', marginBottom: '20px', lineHeight: 1.5 }}>
              {successMessage}
            </p>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Link to="/login" className="auth-button" style={{ textAlign: 'center', display: 'block' }}>
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="auth-button">
                Sign Up
              </button>
            </form>
            <p className="auth-footer">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default SignUp;