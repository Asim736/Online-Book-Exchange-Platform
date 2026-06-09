import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/constants.js';
import './styles/Auth.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing reset token. Please use the link from your email.');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: formData.newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Password reset failed');
      }
    } catch (err) {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Reset Password</h2>
          <div className="auth-error-icon">✗</div>
          <p className="auth-error-message">Missing reset token. Please use the link from your email.</p>
          <Link to="/forgot-password" className="auth-button" style={{ textAlign: 'center', display: 'block', marginTop: '16px' }}>
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>

        {success ? (
          <>
            <div className="auth-success-icon">✓</div>
            <p className="auth-success-message">
              Password reset successful! You can now log in with your new password.
            </p>
            <Link to="/login" className="auth-button" style={{ textAlign: 'center', display: 'block', marginTop: '16px' }}>
              Go to Login
            </Link>
          </>
        ) : (
          <>
            <p className="auth-subtitle">Enter your new password below.</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
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
                  placeholder="Re-enter your new password"
                />
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <Link to="/login" className="auth-footer-link">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
