import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/constants.js';
import { Image } from 'lucide-react';
import AutoCompleteInput from '../common/AutoCompleteInput';
import './styles/BookUpload.css';

// Suggestion lists for autocomplete
const genreSuggestions = [
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Science Fiction',
  'Romance',
  'Thriller',
  'Self-Help',
  'Biography',
  'Fantasy',
  'Historical Fiction',
  'Horror',
  'Poetry',
  'Drama',
  'Adventure',
  'Young Adult',
  'Children',
  'Graphic Novel',
  'Memoir',
  'True Crime',
  'Philosophy'
];

const conditionSuggestions = [
  'New',
  'Like New',
  'Very Good',
  'Good',
  'Acceptable',
  'Fair',
  'Poor'
];

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

    const formattedData = {
      ...bookData,
      title: bookData.title.trim(),
      author: bookData.author.trim(),
      location: bookData.location.trim(),
      description: bookData.description.trim(),
      externalUrls: bookData.externalUrls.filter(url => url.trim()),
      images: bookData.images,
      owner: user._id,
      status: isEditMode ? bookData.status : 'available' // New books are automatically available
    };

    try {
      const url = isEditMode ? `${API_BASE_URL}/books/${id}` : `${API_BASE_URL}/books`;
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${isEditMode ? 'update' : 'upload'} book`);
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
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 2 * 1024 * 1024; // Reduced to 2MB limit per file
    const maxTotalImages = 3; // Reduced to max 3 images
    
    // Check if adding these images would exceed the total limit
    if (bookData.images.length + files.length > maxTotalImages) {
      setError(`Maximum ${maxTotalImages} images allowed. You currently have ${bookData.images.length} images.`);
      return;
    }
    
    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      setError(`Some files are too large. Maximum file size is 2MB. Please compress your images.`);
      return;
    }
    
    const imagePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          // Strict base64 size limit to prevent MongoDB document size issues
          const result = e.target.result;
          if (result.length > 3 * 1024 * 1024) { // ~2.25MB base64 limit
            reject(new Error('Image too large after encoding'));
          } else {
            resolve(result);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises)
      .then(images => {
        // Calculate total estimated document size
        const currentImageSize = bookData.images.join('').length;
        const newImageSize = images.join('').length;
        const totalSize = currentImageSize + newImageSize;
        
        // MongoDB document limit is 16MB, let's keep it under 10MB to be safe
        if (totalSize > 10 * 1024 * 1024) {
          setError('Total image size too large. Please use smaller or fewer images.');
          return;
        }
        
        setBookData(prev => ({
          ...prev,
          images: [...prev.images, ...images]
        }));
        setError(null); // Clear any previous errors
      })
      .catch(error => {
        setError(`Image upload failed: ${error.message}. Please use smaller images.`);
      });
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