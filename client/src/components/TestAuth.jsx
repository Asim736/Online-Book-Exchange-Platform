import React, { useState } from 'react';
import axios from '../config/axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const TestAuth = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('');

  const testCreateUser = async () => {
    try {
      setStatus('Creating test user...');
      const response = await fetch('http://localhost:5000/api/test-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (response.ok) {
        setStatus('Test user created! Logging in...');
        login(data.token, data.user);
        setStatus('Logged in successfully! Redirecting to home...');
        setTimeout(() => navigate('/'), 1000);
      } else {
        setStatus(`Error: ${data.message}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const testLogin = async () => {
    try {
      setStatus('Testing login...');
      const response = await axios.post('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      
      setStatus('Login successful! Logging in...');
      login(response.data.token, response.data.user);
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      setStatus(`Login error: ${error.response?.data?.message || error.message}`);
    }
  };

  const testRegister = async () => {
    try {
      setStatus('Testing registration...');
      await axios.post('/auth/register', {
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'password123'
      });
      setStatus('Registration successful! Now try login.');
    } catch (error) {
      setStatus(`Registration error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Authentication Test Page</h2>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testCreateUser} style={{ margin: '5px', padding: '10px 20px' }}>
          Create Test User & Login
        </button>
        <button onClick={testLogin} style={{ margin: '5px', padding: '10px 20px' }}>
          Test Login (test@example.com)
        </button>
        <button onClick={testRegister} style={{ margin: '5px', padding: '10px 20px' }}>
          Test Registration
        </button>
        <button onClick={() => navigate('/')} style={{ margin: '5px', padding: '10px 20px' }}>
          Go to Home
        </button>
      </div>
      {status && (
        <div style={{ 
          padding: '10px', 
          border: '1px solid #ccc', 
          backgroundColor: '#f9f9f9',
          marginTop: '10px' 
        }}>
          {status}
        </div>
      )}
    </div>
  );
};

export default TestAuth;
