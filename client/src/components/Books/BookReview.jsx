import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/constants.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import './styles/BookReview.css';

const BookReview = ({ bookId, ownerId }) => {
  const { token } = useAuth();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookId,
          ownerId,
          rating,
          review,
        }),
      });
      if (response.ok) {
        setRating(0);
        setReview('');
        alert('Review submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <div className="book-review">
      <h3>Leave a Review</h3>
      <form onSubmit={handleSubmitReview} className="review-form">
        <div className="rating-container">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= rating ? 'active' : ''}`}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write your review here..."
          required
          className="review-textarea"
        />
        <button type="submit" className="btn btn-primary">Submit Review</button>
      </form>
    </div>
  );
};

export default BookReview;