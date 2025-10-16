import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>BookExchange</h3>
          <p>Share your books with the community.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <Link to="/about">About Us</Link>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-section">
          <h4>Legal</h4>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 BookExchange. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;