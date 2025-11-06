import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/constants.js';
import { Image } from 'lucide-react';
import AutoCompleteInput from '../common/AutoCompleteInput';
import './styles/BookUpload.css';

// Suggestion lists for autocomplete (must match server enum via mapping below)
// Keep suggestions user-friendly, then map to schema-safe values when submitting
const genreSuggestions = [
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Science Fiction',
  'Romance',
  'Thriller',
  'Self-Help'
];

const conditionSuggestions = [
  'New',
  'Like New',
  'Good',
  'Fair',
  'Poor'
];

// Maps display values -> server enum values defined in server/models/Book.js
const GENRE_MAP = {
  'Fiction': 'fiction',
  'Non-Fiction': 'non-fiction',
  'Mystery': 'mystery',
  'Science Fiction': 'sci-fi',
  'Romance': 'romance',
  'Thriller': 'thriller',
  'Self-Help': 'self-help'
};

const CONDITION_MAP = {
  'New': 'new',
  'Like New': 'like-new',
  'Good': 'good',
  'Fair': 'fair',
  'Poor': 'poor'
};

const BookUpload = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token, user, isAuthenticated } = useAuth();
  const isEditMode = Boolean(id);
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    genre: '',
    condition: '',
    location: '',
    description: '',
    externalUrls: [''],
    images: [],
    status: 'available'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newFiles, setNewFiles] = useState([]); // selected image files for upload

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch book data if in edit mode
  useEffect(() => {
    if (isEditMode && id && isAuthenticated) {
      fetchBookData();
    }
  }, [isEditMode, id, isAuthenticated]);

  const fetchBookData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch book data');
      }

      const book = await response.json();
      
      // Check if user owns this book
      if (book.owner._id !== user._id) {
        setError('You can only edit your own books');
        navigate('/profile');
        return;
      }

      setBookData({
        title: book.title || '',
        author: book.author || '',
        genre: book.genre || '',
        condition: book.condition || '',
        location: book.location || '',
        description: book.description || '',
        externalUrls: book.externalUrls && book.externalUrls.length > 0 ? book.externalUrls : [''],
        images: book.images || [],
        status: book.status || 'available'
      });
    } catch (error) {
      setError(error.message);
      console.error('Error fetching book:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!bookData.title.trim()) return 'Title is required';
    if (!bookData.author.trim()) return 'Author is required';
    if (!bookData.genre) return 'Genre is required';
    if (!bookData.condition) return 'Condition is required';
    if (!bookData.location.trim()) return 'Location is required';
    if (bookData.images.length > 3) return 'Maximum 3 images allowed';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please log in to upload a book');
      return;
    }

    setLoading(true);
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    // Build multipart form data for server (multer-s3)
    const form = new FormData();
    form.append('title', bookData.title.trim());
    form.append('author', bookData.author.trim());
    form.append('genre', GENRE_MAP[bookData.genre] || bookData.genre?.toLowerCase?.());
    form.append('condition', CONDITION_MAP[bookData.condition] || bookData.condition?.toLowerCase?.());
    form.append('location', bookData.location.trim());
    form.append('description', bookData.description.trim());
    form.append('externalUrls', JSON.stringify(bookData.externalUrls.filter(url => url.trim())));
    // For edit mode, pass existing image URLs we want to keep
    if (isEditMode) {
      const keepExisting = (bookData.images || []).filter((img) => typeof img === 'string' && img.startsWith('http'));
      form.append('existingImages', JSON.stringify(keepExisting));
      form.append('status', bookData.status);
    }
    // Append files
    newFiles.forEach((file) => form.append('images', file));

    try {
      const url = isEditMode ? `${API_BASE_URL}/books/${id}` : `${API_BASE_URL}/books`;
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: form
      });

      const data = await response.json();

      if (!response.ok) {
        // Prefer detailed server error if provided
        throw new Error(
          data?.detail || data?.message || `Failed to ${isEditMode ? 'update' : 'upload'} book`
        );
      }

  navigate(isEditMode ? '/profile' : '/browse');
    } catch (error) {
      setError(error.message);
      console.error(`Error ${isEditMode ? 'updating' : 'uploading'} book:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUrlChange = (index, value) => {
    const newUrls = [...bookData.externalUrls];
    newUrls[index] = value;
    setBookData(prev => ({
      ...prev,
      externalUrls: newUrls
    }));
  };

  const addUrlField = () => {
    setBookData(prev => ({
      ...prev,
      externalUrls: [...prev.externalUrls, '']
    }));
  };

  const removeImage = (index) => {
    setBookData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    // If the preview is a blob URL, it corresponds to a newly selected file
    const preview = bookData.images[index];
    if (typeof preview === 'string' && preview.startsWith('blob:')) {
      // Map global index to blob-only index
      const blobIndex = bookData.images
        .slice(0, index + 1)
        .filter(u => typeof u === 'string' && u.startsWith('blob:'))
        .length - 1;
      setNewFiles(prev => prev.filter((_, i) => i !== blobIndex));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const maxTotalImages = 3;
    const combinedCount = (bookData.images?.length || 0) + newFiles.length + files.length;
    if (combinedCount > maxTotalImages) {
      setError(`Maximum ${maxTotalImages} images allowed.`);
      return;
    }
    // basic size validation to 5MB (server also enforces)
    const tooLarge = files.find(f => f.size > 5 * 1024 * 1024);
    if (tooLarge) {
      setError('Each image must be 5MB or smaller.');
      return;
    }
    // For preview, create object URLs
    const previews = files.map(f => URL.createObjectURL(f));
    setNewFiles(prev => [...prev, ...files]);
    setBookData(prev => ({ ...prev, images: [...prev.images, ...previews] }));
    setError(null);
  };

  return (
    <div className="book-upload-container">
      <div className="header-with-back">
        {isEditMode && (
          <button 
            type="button" 
            onClick={() => navigate('/profile')} 
            className="back-btn"
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            ← Back to Profile
          </button>
        )}
        <div className="header-section">
          <h1 className="main-title">{isEditMode ? 'Edit Book Details' : 'List a New Book'}</h1>
          <p className="subtitle">Fill in the details below to add a book to the exchange platform.</p>
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="upload-form">
        {/* Book Title & Author Side by Side */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title" className="form-label">Book Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={bookData.title}
              onChange={handleChange}
              placeholder="e.g., The Midnight Library"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="author" className="form-label">Author</label>
            <input
              type="text"
              id="author"
              name="author"
              value={bookData.author}
              onChange={handleChange}
              placeholder="e.g., Matt Haig"
              required
            />
          </div>
        </div>

        {/* Genre & Condition Side by Side */}
        <div className="form-row">
          <div className="form-group">
            <AutoCompleteInput
              label="Genre"
              name="genre"
              value={bookData.genre}
              onChange={handleChange}
              suggestions={genreSuggestions}
              placeholder="Enter or select genre"
              required
            />
          </div>

          <div className="form-group">
            <AutoCompleteInput
              label="Condition"
              name="condition"
              value={bookData.condition}
              onChange={handleChange}
              suggestions={conditionSuggestions}
              placeholder="Enter or select condition"
              required
            />
          </div>
        </div>

        {/* Book Description Full Width */}
        <div className="form-group full-width">
          <label htmlFor="description" className="form-label">Book Description</label>
          <textarea
            id="description"
            name="description"
            value={bookData.description}
            onChange={handleChange}
            rows="6"
            placeholder="Provide a detailed description of the book, its plot, or any relevant notes..."
          />
        </div>

        {/* Location Full Width */}
        <div className="form-group full-width">
          <label htmlFor="location" className="form-label">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={bookData.location}
            onChange={handleChange}
            placeholder="e.g., London, UK"
            required
          />
        </div>

        {/* Upload Photos Section */}
        <div className="form-group full-width">
          <label className="form-label">Upload Photos</label>
          <div className="upload-area" onClick={() => document.getElementById('book-images').click()}>
            <Image size={48} className="upload-icon" />
            <p className="upload-text">Drag & drop photos here</p>
            <p className="upload-subtext">or click to browse your files</p>
            <button type="button" className="browse-btn">
              Browse Files
            </button>
          </div>
          <input
            type="file"
            id="book-images"
            name="book-images"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="file-input"
            style={{ display: 'none' }}
          />
          
          {bookData.images.length > 0 && (
            <div className="image-preview-container">
              <p className="preview-label">Selected Images ({bookData.images.length}/3):</p>
              <div className="image-preview-grid">
                {bookData.images.map((image, index) => (
                  <div key={index} className="image-preview-item">
                    <img 
                      src={image} 
                      alt={`Preview ${index + 1}`} 
                      className="preview-image"
                    />
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)}
                      className="remove-image-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="form-group">
          <p className="form-label">External URLs (Amazon, Daraz etc.)</p>
          {bookData.externalUrls.map((url, index) => (
            <div key={index} className="url-input-group">
              <label htmlFor={`external-url-${index}`}>URL #{index + 1}</label>
              <input
                type="url"
                id={`external-url-${index}`}
                name={`external-url-${index}`}
                value={url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
                placeholder="https://"
                autoComplete="url"
              />
            </div>
          ))}
          <button type="button" onClick={addUrlField} className="add-url-btn">
            Add Another URL
          </button>
        </div>

        {/* Submit Button */}
        <div className="submit-section">
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
          >
            {loading ? (isEditMode ? 'Updating...' : 'Listing...') : (isEditMode ? 'Update Book' : 'List My Book')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookUpload;