import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../../config/constants.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import "./styles/BookCard.css";

const BookCard = ({ book }) => {
    const navigate = useNavigate();
    const { user, token, isAuthenticated } = useAuth();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Wishlist helper functions
    const getStoredWishlist = () => {
        if (!user?._id) return [];
        const stored = localStorage.getItem(`wishlist_${user._id}`);
        return stored ? JSON.parse(stored) : [];
    };

    const saveWishlistToStorage = (bookIds) => {
        if (!user?._id) return;
        localStorage.setItem(`wishlist_${user._id}`, JSON.stringify(bookIds));
    };

    // Check if book is in wishlist when book or user changes
    useEffect(() => {
        if (book?._id && user?._id) {
            const wishlist = getStoredWishlist();
            setIsWishlisted(wishlist.includes(book._id));
        } else {
            setIsWishlisted(false);
        }
    }, [book?._id, user?._id]);

    const handleWishlistToggle = (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        if (!user || !book) {
            alert('Please log in to add books to your wishlist');
            return;
        }

        const currentWishlist = getStoredWishlist();
        const bookId = book._id;
        
        if (isWishlisted) {
            // Remove from wishlist
            const updatedWishlist = currentWishlist.filter(id => id !== bookId);
            saveWishlistToStorage(updatedWishlist);
            setIsWishlisted(false);
        } else {
            // Add to wishlist
            const updatedWishlist = [...currentWishlist, bookId];
            saveWishlistToStorage(updatedWishlist);
            setIsWishlisted(true);
        }
    };

    const handleNextImage = (e) => {
        e.stopPropagation();
        if (book.images && book.images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % book.images.length);
        }
    };

    const handlePrevImage = (e) => {
        e.stopPropagation();
        if (book.images && book.images.length > 1) {
            setCurrentImageIndex(
                (prev) => (prev - 1 + book.images.length) % book.images.length
            );
        }
    };

    const currentImage = book.images && book.images.length > 0
        ? book.images[currentImageIndex]
        : book.imageUrl || book.cover || "/placeholder-book.jpg";

    const handleCardClick = () => {
        if (!isAuthenticated) {
            // Redirect to login if not authenticated
            navigate('/login');
        } else {
            // Navigate to book details if authenticated
            navigate(`/books/${book._id || book.id}`);
        }
    };

    return (
        <div className="book-card" onClick={handleCardClick}>
            {/* Book Image */}
            <div className="book-image-container">
                <img
                    src={currentImage}
                    alt={book.title}
                    className="book-cover"
                />
                
                {/* Wishlist Heart Button */}
                {user && user._id !== book.owner?._id && (
                    <button 
                        className={`wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
                        onClick={handleWishlistToggle}
                        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                    </button>
                )}
                
                {/* Image Navigation Arrows - Only show if multiple images */}
                {book.images && book.images.length > 1 && (
                    <>
                        <button 
                            className="image-nav-btn prev-btn"
                            onClick={handlePrevImage}
                            aria-label="Previous image"
                        >
                            ‹
                        </button>
                        <button 
                            className="image-nav-btn next-btn"
                            onClick={handleNextImage}
                            aria-label="Next image"
                        >
                            ›
                        </button>
                    </>
                )}
            </div>

            {/* Book Info */}
            <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">By {book.author}</p>
                
                {/* Meta Tags */}
                <div className="book-meta">
                    <span className="genre-tag">{book.genre || 'Bestseller'}</span>
                    {book.volume && <span className="volume-tag">Volume</span>}
                </div>
            </div>
        </div>
    );
};

export default BookCard;


