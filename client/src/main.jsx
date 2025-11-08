import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import { measureWebVitals } from './utils/performance';

// Start performance monitoring
if (process.env.NODE_ENV === 'development') {
  measureWebVitals();
}

// Simple console marker to bust caches via new hash on deploys
// This no-op change helps trigger a fresh Vite asset filename
// and ensures Amplify/CloudFront serves the latest bundle.
console.debug('[deploy]', 'frontend build', import.meta.env?.MODE || process.env.NODE_ENV || 'production');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);