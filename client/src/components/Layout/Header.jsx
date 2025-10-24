import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './styles/Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isMobileMenuOpen]);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container" onClick={() => handleNavigation('/')}>
          <h1 className="logo">BookExchange</h1>
        </div>
        
        <button 
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          ☰
        </button>
        
        <nav className={`main-nav ${isMobileMenuOpen ? 'mobile-nav-open' : ''}`}>
          <ul className="nav-links">
            <li><div onClick={() => handleNavigation('/')} className="nav-link">Home</div></li>
            <li><div onClick={() => handleNavigation('/browse')} className="nav-link">Explore</div></li>
            {user ? (
              <>
                <li><div onClick={() => handleNavigation('/upload')} className="nav-link">List Book</div></li>
                <li><div onClick={() => handleNavigation('/wishlist')} className="nav-link">Wishlist</div></li>
                <li><div onClick={() => handleNavigation('/inbox')} className="nav-link">Inbox</div></li>
              </>
            ) : null}
          </ul>
        </nav>
        
        <div className="auth-links">
          {user ? (
            <>
              <div onClick={() => handleNavigation('/profile')} className="btn btn-profile">Profile</div>
              <div onClick={handleLogout} className="btn btn-logout">Logout</div>
            </>
          ) : (
            <>
              <div onClick={() => handleNavigation('/login')} className="btn btn-login">Login</div>
              <div onClick={() => handleNavigation('/signup')} className="btn btn-signup">Sign Up</div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay and Slide-in Menu */}
      {isMobileMenuOpen && (
        <>
          <div 
            className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
          />
          <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            <div className="mobile-menu-header">
              <span className="mobile-menu-title">Menu</span>
              <button 
                className="mobile-menu-close"
                onClick={toggleMobileMenu}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            
            <div className="mobile-menu-content">
              <ul className="mobile-nav-links">
                <li><div onClick={() => handleNavigation('/')} className="mobile-nav-link">Home</div></li>
                <li><div onClick={() => handleNavigation('/browse')} className="mobile-nav-link">Explore</div></li>
                {user ? (
                  <>
                    <li><div onClick={() => handleNavigation('/upload')} className="mobile-nav-link">List Book</div></li>
                    <li><div onClick={() => handleNavigation('/wishlist')} className="mobile-nav-link">Wishlist</div></li>
                    <li><div onClick={() => handleNavigation('/inbox')} className="mobile-nav-link">Inbox</div></li>
                  </>
                ) : (
                  <>
                    <li><div onClick={() => handleNavigation('/login')} className="mobile-nav-link">Login</div></li>
                    <li><div onClick={() => handleNavigation('/signup')} className="mobile-nav-link">Sign Up</div></li>
                  </>
                )}
              </ul>
            </div>
            
            {user && (
              <div className="mobile-auth-section">
                <button 
                  className="mobile-profile-btn"
                  onClick={() => handleNavigation('/profile')}
                >
                  Profile
                </button>
                <button 
                  className="mobile-logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default Header;

