import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { API_BASE_URL } from '../../config/constants.js';
import BookCard from './BookCard';
import { SkeletonCardGrid } from '../common/SkeletonCard';
import './styles/BookList.css';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const LIMIT = 12;
  
  // Compact search bar state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchContext, setSearchContext] = useState('title');
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  
  // Refs
  const contextButtonRef = useRef(null);


  
  // Search contexts with their configurations
  const searchContexts = {
    title: {
      icon: '📖',
      placeholder: 'Search by title...',
      label: 'Title'
    },
    author: {
      icon: '👤',
      placeholder: 'Search by author...',
      label: 'Author'
    },
    genre: {
      icon: '🏷️',
      placeholder: 'Search by genre...',
      label: 'Genre',
      suggestions: [
        'Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Romance',
        'Thriller', 'Self-Help', 'Biography', 'History', 'Fantasy',
        'Horror', 'Comedy', 'Drama', 'Adventure'
      ]
    },
    location: {
      icon: '📍',
      placeholder: 'Search by location...',
      label: 'Location'
    }
  };


  useEffect(() => {
    fetchBooks(1, true);
  }, []);

  // Handle global clicks to close dropdowns
  useEffect(() => {
    const handleGlobalClick = (e) => {
      // Don't close if clicking on context selector, its children, or the context menu itself
      if (
        e.target.closest('.search-context-selector') ||
        e.target.closest('.context-menu')
      ) {
        return;
      }
      // Close only when clicking outside the search bar entirely
      if (!e.target.closest('.compact-search-bar')) {
        setShowContextMenu(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleGlobalClick, true); // Use capture phase
    return () => document.removeEventListener('click', handleGlobalClick, true);
  }, []);

  const fetchBooks = async (fetchPage = 1, reset = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/books?page=${fetchPage}&limit=${LIMIT}`);
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      const data = await response.json();
      // If backend returns { books, total, page, pages }
      const booksArray = Array.isArray(data.books) ? data.books : (Array.isArray(data) ? data : []);
      setBooks(reset ? booksArray : prev => [...prev, ...booksArray]);
      setPage(data.page || fetchPage);
      setTotalPages(data.pages || 1);
      setTotalBooks(data.total || booksArray.length);
    } catch (error) {
      console.error('Error fetching books:', error);
      setError(error.message);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreBooks = () => {
    if (page < totalPages) {
      fetchBooks(page + 1, false);
    }
  };

  // Handle search context selection
  const handleContextSelect = (context) => {
    setSearchContext(context);
    setShowContextMenu(false);
    setSearchQuery(''); // Clear search when context changes
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Handle search input changes
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Show suggestions for genre context
    if (searchContext === 'genre' && value.trim() !== '') {
      const filtered = searchContexts.genre.suggestions.filter(item => 
        item.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      setShowSuggestions(false);
      // Search is handled by the filteredBooks logic below
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  // Handle clicks outside to close dropdowns
  const handleClickOutside = (e) => {
    // Don't close if clicking on the context selector button or menu
    if (e && e.relatedTarget && (
      e.relatedTarget.closest('.search-context-selector') || 
      e.relatedTarget.closest('.context-menu')
    )) {
      return;
    }
    
    setTimeout(() => {
      setShowContextMenu(false);
      setShowSuggestions(false);
    }, 150);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const filteredBooks = Array.isArray(books) ? books.filter(book => {
    // If no search query, show all books
    if (!searchQuery.trim()) {
      return true;
    }

    const query = searchQuery.toLowerCase();
    
    // Context-aware search filtering
    switch (searchContext) {
      case 'title':
        return book.title && book.title.toLowerCase().includes(query);
      
      case 'author':
        return book.author && book.author.toLowerCase().includes(query);
      
      case 'genre':
        return book.genre && book.genre.toLowerCase().includes(query);
      
      case 'location':
        return book.location && book.location.toLowerCase().includes(query);
      
      default:
        // Fallback: search across title and author (like original behavior)
        return (book.title && book.title.toLowerCase().includes(query)) ||
               (book.author && book.author.toLowerCase().includes(query));
    }
  }) : [];

  if (error) return (
    <div className="book-list-container">
      <div className="error-message">
        <p>Error loading books: {error}</p>
        <button onClick={() => { setError(null); fetchBooks(); }}>Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="book-list-container">
      {/* Compact Context-Aware Search Bar */}
      <div className="compact-search-container">
        <div className="compact-search-bar">
          
          {/* Context Selector */}
          <div className="search-context-selector">
            <button
              ref={contextButtonRef}
              className="context-selector-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Calculate position for fixed positioning
                if (contextButtonRef.current) {
                  const rect = contextButtonRef.current.getBoundingClientRect();
                  const position = {
                    top: rect.bottom + 8,
                    left: rect.left
                  };
                  setMenuPosition(position);
                }
                
                setShowContextMenu(prev => !prev);
              }}
              aria-label="Select search context"
            >
              <span className="context-icon">{searchContexts[searchContext].icon}</span>
              <span className="context-chevron" style={{
                transform: showContextMenu ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>▼</span>
            </button>
            

          </div>
          
          {/* Main Search Input */}
          <div className="search-input-wrapper">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchSubmit}
              onBlur={handleClickOutside}
              onFocus={() => searchContext === 'genre' && searchQuery && setShowSuggestions(suggestions.length > 0)}
              placeholder={searchContexts[searchContext].placeholder}
              className="compact-search-input"
            />
            
            {/* Clear Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="clear-search-btn"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
            
            {/* Search Button */}
            <button
              type="button"
              onClick={handleSearchSubmit}
              className="search-submit-btn"
              aria-label="Search"
            >
              <span style={{ fontSize: '24px', fontWeight: 'normal', color: '#64748b' }}>⌕</span>
            </button>
          </div>
          
          {/* Suggestions Dropdown (for genre context) */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="search-suggestion"
                  onClick={() => handleSuggestionSelect(suggestion)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <span className="suggestion-icon">{searchContexts[searchContext].icon}</span>
                  <span className="suggestion-text">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
          
        </div>
      </div>

      {/* Books Grid */}
      <div className="books-grid">
        {loading && books.length === 0 ? (
          <SkeletonCardGrid count={6} />
        ) : filteredBooks.length > 0 ? (
          <>
            {filteredBooks.map((book, index) => (
              <BookCard 
                key={book._id} 
                book={book} 
                priority={index < 3} // Priority load for first 3 cards
              />
            ))}
            {page < totalPages && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button onClick={loadMoreBooks} className="btn-primary">Load More</button>
              </div>
            )}
          </>
        ) : (
          <div className="no-books-message">
            <p>No books found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Context Menu Dropdown - Rendered as Portal */}
      {showContextMenu && createPortal(
        <div 
          className="context-menu"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`
          }}
        >
          {Object.entries(searchContexts).map(([key, config]) => (
            <button
              key={key}
              className={`context-option ${searchContext === key ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleContextSelect(key);
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <span className="option-icon">{config.icon}</span>
              <span className="option-label">{config.label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default BookList;