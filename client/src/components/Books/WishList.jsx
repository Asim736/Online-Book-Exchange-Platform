import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Book } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/constants.js';
import './styles/WishList.css';

const WishList = () => {
  const { user, token } = useAuth();
  const [wishlistBooks, setWishlistBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get wishlist from localStorage
  const getStoredWishlist = () => {
    if (!user?._id) return [];
    const stored = localStorage.getItem(`wishlist_${user._id}`);
    return stored ? JSON.parse(stored) : [];
  };

  // Save wishlist to localStorage
  const saveWishlistToStorage = (bookIds) => {
    if (!user?._id) return;
    localStorage.setItem(`wishlist_${user._id}`, JSON.stringify(bookIds));
  };

  // Fetch books from API and filter wishlist
  const fetchWishlistBooks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all books from API
      const response = await fetch(`${API_BASE_URL}/books`);
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      
      const allBooks = await response.json();
      const wishlistIds = getStoredWishlist();
      
      // Filter books that are in wishlist and not owned by current user
      const filteredBooks = allBooks.filter(book => 
        wishlistIds.includes(book._id) && 
        book.owner?._id !== user?._id
      ).map(book => ({
        _id: book._id,
        title: book.title,
        author: book.author,
        owner: book.owner,
        condition: book.condition,
        location: book.location,
        cover: book.images?.[0] || getDefaultBookCover(book.title)
      }));

      setWishlistBooks(filteredBooks);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError('Failed to load wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate a default book cover based on title
  const getDefaultBookCover = (title) => {
    const colors = ['#4f46e5', '#059669', '#dc2626', '#7c3aed', '#ea580c'];
    const colorIndex = title.length % colors.length;
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${colors[colorIndex]}"/>
        <text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dy=".3em">
          ${title}
        </text>
      </svg>
    `)}`;
  };

  // Load wishlist on component mount and when user changes
  useEffect(() => {
    if (user?._id) {
      fetchWishlistBooks();
    } else {
      setWishlistBooks([]);
      setLoading(false);
    }
  }, [user?._id]);

  const removeBook = (bookId) => {
    const updatedIds = getStoredWishlist().filter(id => id !== bookId);
    saveWishlistToStorage(updatedIds);
    setWishlistBooks(prev => prev.filter(book => book._id !== bookId));
  };

  const handleNotifyAvailability = () => {
    if (wishlistBooks.length === 0) {
      alert('Your wishlist is empty. Add some books first!');
      return;
    }
    alert(`You will be notified when these ${wishlistBooks.length} book(s) become available for exchange!`);
  };

  if (!user) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="wishlist-header">
            <h1>My Wishlist</h1>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">
              <Book size={64} />
            </div>
            <h4>Please log in to view your wishlist</h4>
            <p>Sign in to save and manage your favorite books!</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="wishlist-header">
            <h1>My Wishlist</h1>
          </div>
          <div className="loading-state">
            <p>Loading your wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="wishlist-header">
            <h1>My Wishlist</h1>
          </div>
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchWishlistBooks} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1>My Wishlist</h1>
          <button className="notify-btn" onClick={handleNotifyAvailability}>
            <Bell size={18} />
            Notify Me of Availability
          </button>
        </div>

        {/* Book List */}
        <div className="wishlist-content">
          {wishlistBooks.map(book => (
            <div key={book._id} className="book-card">
              <img src={book.cover} alt={book.title} className="book-cover" />
              <div className="book-info">
                <h5 className="book-title">{book.title}</h5>
                <p className="book-author">by {book.author}</p>
                <div className="book-details">
                  <span className="book-condition">Condition: {book.condition}</span>
                  <span className="book-location">Location: {book.location}</span>
                  <span className="book-owner">Owner: {book.owner?.username || 'Unknown'}</span>
                </div>
              </div>
              <button className="delete-btn" onClick={() => removeBook(book._id)} title="Remove from wishlist">
                <Trash2 size={20} color="#6b7280" />
              </button>
            </div>
          ))}

          {wishlistBooks.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Book size={64} />
              </div>
              <h4>Your wishlist is empty</h4>
              <p>Browse books and add them to your wishlist to keep track of books you want to exchange!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishList;