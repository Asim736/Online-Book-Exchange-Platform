import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import PrivateRoute from './components/Auth/PrivateRoute';
import './styles/index.css';
import './styles/App.css';
import './components/Books/styles/BookCard.css';
import './styles/zoom-responsive-override.css';

// Lazy load components
const HomePage = React.lazy(() => import('./components/Home/HomePage'));
const BookList = React.lazy(() => import('./components/Books/BookList'));
const Login = React.lazy(() => import('./components/Auth/Login'));
const SignUp = React.lazy(() => import('./components/Auth/SignUp'));
const ForgotPassword = React.lazy(() => import('./components/Auth/ForgotPassword'));
const BookDetail = React.lazy(() => import('./components/Books/BookDetail'));
const BookUpload = React.lazy(() => import('./components/Books/BookUpload'));
const BookRequests = React.lazy(() => import('./components/Books/BookRequests'));
const Inbox = React.lazy(() => import('./components/Inbox/Inbox'));
const Notifications = React.lazy(() => import('./components/Notifications/Notifications'));
const WishList = React.lazy(() => import('./components/Books/WishList'));
const UserProfile = React.lazy(() => import('./components/Profile/UserProfile'));

function App() {
  const location = useLocation();
  const isInboxPage = location.pathname === '/inbox';

  return (
    <ErrorBoundary>
      <Header />
      <main className="main-content">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<div className="container"><HomePage /></div>} />
            {/* Tolerate trailing slashes or nested segments if the host normalizes to /browse/ */}
            <Route path="/browse" element={<div className="container"><BookList /></div>} />
            <Route path="/browse/*" element={<div className="container"><BookList /></div>} />
            <Route path="/login" element={<div className="container"><Login /></div>} />
            <Route path="/signup" element={<div className="container"><SignUp /></div>} />
            <Route path="/forgot-password" element={<div className="container"><ForgotPassword /></div>} />

            {/* Protected Routes */}
            <Route 
              path="/books/:id" 
              element={
                <PrivateRoute>
                  <div className="container"><BookDetail /></div>
                </PrivateRoute>
              } 
            />

            <Route 
              path="/upload" 
              element={
                <PrivateRoute>
                  <div className="container"><BookUpload /></div>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/books/edit/:id" 
              element={
                <PrivateRoute>
                  <div className="container"><BookUpload /></div>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/requests" 
              element={
                <PrivateRoute>
                  <div className="container"><BookRequests /></div>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/inbox" 
              element={
                <PrivateRoute>
                  <Inbox />
                </PrivateRoute>
              } 
            />
              <Route 
                path="/notifications" 
                element={
                  <PrivateRoute>
                    <div className="container"><Notifications /></div>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/wishlist" 
                element={
                  <PrivateRoute>
                    <WishList />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <UserProfile />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </Suspense>
      </main>
      {!isInboxPage && <Footer />}
    </ErrorBoundary>
  );
}

export default App;