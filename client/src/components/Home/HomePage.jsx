import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

 const featuredBooks = [
    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Classic", image: "📖" },
    { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Fiction", image: "📚" },
    { id: 3, title: "1984", author: "George Orwell", genre: "Dystopian", image: "📘" },
    { id: 4, title: "Pride and Prejudice", author: "Jane Austen", genre: "Romance", image: "💕" }
  ];

  return (
    <div className="home-container">
      {/* Enhanced Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="floating-books">
            <span className="floating-book book-1">📚</span>
            <span className="floating-book book-2">📖</span>
            <span className="floating-book book-3">📘</span>
            <span className="floating-book book-4">📙</span>
            <span className="floating-book book-5">📗</span>
          </div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span>✨ New Community Feature Available</span>
          </div>
          <h1>Discover, Share, and Connect Through Books</h1>
          <p>Join thousands of book lovers in your community. Exchange books, share stories, and build meaningful connections through the power of literature.</p>
          <div className="hero-buttons">
            <button className="cta-button primary" onClick={() => navigate('/browse')}>
              <span>Start Exploring</span>
              <span className="button-icon">→</span>
            </button>
           
          </div>
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Simple steps to start your book exchange journey</p>
        </div>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">📚</div>
            <h3>List Your Books</h3>
            <p>Upload books you're willing to share or exchange with others in your community. Add photos and descriptions to attract readers.</p>
            <div className="step-arrow">→</div>
          </div>
          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon">🔍</div>
            <h3>Discover & Browse</h3>
            <p>Search through thousands of books available in your area. Filter by genre, author, or location to find exactly what you're looking for.</p>
            <div className="step-arrow">→</div>
          </div>
          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">🤝</div>
            <h3>Connect & Exchange</h3>
            <p>Message book owners, arrange safe meetups, and complete your exchanges. Build lasting friendships through shared reading interests.</p>
          </div>
        </div>
      </section>
    

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="section-header">
          <h2>What Our Community Says</h2>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"I've discovered amazing books and made great friends through BookExchange. It's transformed my reading experience!"</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">👩‍🦳</div>
              <div>
                <h4>Sarah Johnson</h4>
                <span>Active since 2023</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card featured">
            <div className="testimonial-content">
              <p>"The local community aspect is fantastic. I've exchanged over 50 books and never run out of great reads!"</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">👨‍💼</div>
              <div>
                <h4>Mike Chen</h4>
                <span>Top Exchanger</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"Perfect platform for sustainable reading. Love how easy it is to find and share books with neighbors."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">👩‍🎓</div>
              <div>
                <h4>Emily Rodriguez</h4>
                <span>Book Enthusiast</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Join Community Section */}
      <section className="join-community">
        <div className="join-background">
          <div className="join-pattern"></div>
        </div>
        <div className="join-content">
          <div className="join-icon">🚀</div>
          <h2>Ready to Start Your Book Journey?</h2>
          <p>Join our growing community of book lovers and start exchanging today. It's free, fun, and sustainable!</p>
          <div className="join-buttons">
            <button className="signup-button primary" onClick={() => navigate('/signup')}>
              <span>Join Now - It's Free</span>
              <span className="button-sparkle">✨</span>
            </button>
            <button className="signup-button secondary" onClick={() => navigate('/browse')}>
              Browse Books First
            </button>
          </div>
          <div className="join-features">
            <div className="join-feature">
              <span>✓</span>
              <span>Free forever</span>
            </div>
            <div className="join-feature">
              <span>✓</span>
              <span>No hidden fees</span>
            </div>
            <div className="join-feature">
              <span>✓</span>
              <span>Safe & secure</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;