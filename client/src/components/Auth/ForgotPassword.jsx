import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/constants.js';
import './styles/Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="auth-subtitle">
          Enter your email address and we'll send you instructions to reset your password
        </p>

        {error && <div className="auth-error">{error}</div>}

        {!submitted ? (
          <>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <p className="auth-footer">
              <Link to="/login">Back to Login</Link>
            </p>
          </>
        ) : (
          <div className="success-message" style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="auth-success-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
            <p style={{ fontSize: '16px', color: '#333', marginBottom: '20px', lineHeight: 1.5 }}>
              If an account with that email exists, a password reset link has been sent.
            </p>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              Please check your inbox (and spam folder).
            </p>
            <Link to="/login" className="auth-button" style={{ textAlign: 'center', display: 'block' }}>
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;