import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config/constants.js';
import './styles/Auth.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token. Please use the link from your email.');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. The link may have expired.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Could not connect to the server. Please try again later.');
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Email Verification</h2>

        {status === 'loading' && (
          <div className="auth-loading">
            <p>Verifying your email address...</p>
            <div className="spinner" />
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="auth-success-icon">✓</div>
            <p className="auth-success-message">{message}</p>
            <Link to="/login" className="auth-button" style={{ textAlign: 'center', display: 'block', marginTop: '16px' }}>
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="auth-error-icon">✗</div>
            <p className="auth-error-message">{message}</p>
            <p style={{ color: '#666', marginTop: '12px' }}>
              The verification link may have expired. Try signing up again to receive a new link.
            </p>
            <Link to="/signup" className="auth-button" style={{ textAlign: 'center', display: 'block', marginTop: '16px' }}>
              Sign Up Again
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
