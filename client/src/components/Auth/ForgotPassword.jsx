import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './styles/Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add password reset logic here
    console.log('Password reset requested for:', email);
    setSubmitted(true);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="auth-subtitle">
          Enter your email address and we'll send you instructions to reset your password
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <button type="submit" className="auth-button">
              Send Reset Link
            </button>

            <Link to="/login" className="auth-footer">
              Back to Login
            </Link>
          </form>
        ) : (
          <div className="success-message">
            <p>✓ Reset instructions have been sent to your email</p>
            <Link to="/login" className="auth-button">
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;