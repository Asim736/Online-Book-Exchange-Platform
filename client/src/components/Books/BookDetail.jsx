import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/constants.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import './styles/BookDetail.css';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [book, setBook] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const zoomModalRef = useRef(null);

  // Heights used by the modal bars (px). Keep in sync with styles below.
  const TOP_BAR_HEIGHT = 50; // px

  // Process images array with useMemo to avoid initialization errors
  const images = useMemo(() => {
    if (!book) return ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJvb2sgSW1hZ2U8L3RleHQ+PC9zdmc+'];
    
    let processedImages = [];
    
    if (book.images && Array.isArray(book.images) && book.images.length > 0) {
      // If book.images is an array with items
      processedImages = book.images.filter(img => img && img.trim() !== '');
    } else if (book.imageUrl) {
      // Fallback to single imageUrl
      processedImages = [book.imageUrl];
    }
    
    // If no valid images found, use a guaranteed working SVG data URL
    if (processedImages.length === 0) {
      processedImages = ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJvb2sgSW1hZ2U8L3RleHQ+PC9zdmc+'];
    }
    
    return processedImages;
  }, [book]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/books/${id}`);
        if (!response.ok) {
          throw new Error('Book not found');
        }
        const bookData = await response.json();
        setBook(bookData);
      } catch (error) {
        console.error('Error fetching book:', error);
        navigate('/browse');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBook();
    }
  }, [id, user?._id, token, navigate]);

  // detect mobile viewport & update on resize so we can compute available image area
  useEffect(() => {
    const check = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Keyboard event handler for zoom modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isZoomed) {
        switch (e.key) {
          case 'Escape':
            closeZoomView();
            break;
          case 'ArrowLeft':
            if (images.length > 1) prevImage();
            break;
          case 'ArrowRight':
            if (images.length > 1) nextImage();
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed, images.length, currentImageIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Handle touch events with proper passive settings
  useEffect(() => {
    const zoomModal = zoomModalRef.current;
    if (!zoomModal || !isZoomed) return;

    const handleTouchMovePassive = (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (isDragging && zoomLevel > 1) {
          e.preventDefault();
          setPanX(touch.clientX - dragStart.x);
          setPanY(touch.clientY - dragStart.y);
        }
      }
    };

    // Add event listener with passive: false to allow preventDefault
    zoomModal.addEventListener('touchmove', handleTouchMovePassive, { passive: false });

    return () => {
      zoomModal.removeEventListener('touchmove', handleTouchMovePassive);
    };
  }, [isZoomed, isDragging, zoomLevel, dragStart]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !token) {
      alert('Please login to send a request');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookId: book._id,
          requesterId: user._id,
          ownerId: book.owner._id,
          message: requestMessage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send request');
      }

      alert('Request sent successfully!');
      setShowRequestForm(false);
      setRequestMessage('');
    } catch (error) {
      console.error('Error sending request:', error);
      alert('Failed to send request. Please try again.');
    }
  };



  const nextImage = () => {
    if (book?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % book.images.length);
    }
  };

  const prevImage = () => {
    if (book?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + book.images.length) % book.images.length);
    }
  };

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

  const handleWishlistToggle = () => {
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

  // Check if book is in wishlist when book or user changes
  useEffect(() => {
    if (book && user) {
      const wishlist = getStoredWishlist();
      setIsWishlisted(wishlist.includes(book._id));
    } else {
      setIsWishlisted(false);
    }
  }, [book?._id, user?._id]);

  const openZoomView = () => {
    setIsZoomed(true);
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeZoomView = () => {
    setIsZoomed(false);
    setZoomLevel(1);
    setRotation(0);
    setPanX(0);
    setPanY(0);
    setIsDragging(false);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 2));
  };

  const handleZoomOut = () => {
    if (zoomLevel <= 1) {
      setPanX(0);
      setPanY(0);
    }
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleZoomSlider = (value) => {
    const newZoom = value / 100;
    setZoomLevel(newZoom);
    if (newZoom <= 1) {
      setPanX(0);
      setPanY(0);
    }
  };

  const resetView = () => {
    setZoomLevel(1);
    setRotation(0);
    setPanX(0);
    setPanY(0);
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - panX,
        y: e.clientY - panY
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile support with swipe navigation
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (zoomLevel > 1) {
        setIsDragging(true);
        setDragStart({
          x: touch.clientX - panX,
          y: touch.clientY - panY
        });
      } else {
        // Store initial touch position for swipe detection
        setDragStart({
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        });
      }
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (isDragging && zoomLevel > 1) {
        e.preventDefault();
        setPanX(touch.clientX - dragStart.x);
        setPanY(touch.clientY - dragStart.y);
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (zoomLevel <= 1 && images.length > 1 && dragStart.time) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - dragStart.x;
      const deltaY = touch.clientY - dragStart.y;
      const deltaTime = Date.now() - dragStart.time;
      
      // Check if this was a swipe (minimum distance and maximum time)
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) && deltaTime < 300) {
        if (deltaX > 0 && currentImageIndex > 0) {
          // Swipe right - previous image
          prevImage();
        } else if (deltaX < 0 && currentImageIndex < images.length - 1) {
          // Swipe left - next image
          nextImage();
        }
      }
    }
    setIsDragging(false);
  };

  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={i < rating ? "text-green-600" : "text-gray-300"}>★</span>
    ));
  };

  const isOwner = user?._id === book?.owner?._id;


    if (loading) {
      return (
        <>
          {/* Bootstrap CSS */}
          <link 
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" 
            rel="stylesheet" 
            integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" 
            crossOrigin="anonymous"
          />
          <div className="min-vh-100 bg-light py-4">
            <div className="container-fluid">
              {/* Breadcrumb Skeleton */}
              <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <span style={{ width: 60, height: 18, display: 'inline-block', background: '#e9ecef', borderRadius: 6, animation: 'skeleton-wave 1.6s linear infinite' }} />
                  </li>
                  <li className="breadcrumb-item">
                    <span style={{ width: 40, height: 18, display: 'inline-block', background: '#f3f3f3', borderRadius: 6, animation: 'skeleton-wave 1.6s linear infinite' }} />
                  </li>
                  <li className="breadcrumb-item active">
                    <span style={{ width: 80, height: 18, display: 'inline-block', background: '#e9ecef', borderRadius: 6, animation: 'skeleton-wave 1.6s linear infinite' }} />
                  </li>
                </ol>
              </nav>
              <div className="card shadow-lg border-0">
                <div className="row g-0">
                  {/* Book Image Skeleton */}
                  <div 
                    className="col-md-5"
                    style={{
                      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
                      padding: '35px 25px',
                      borderRadius: '24px',
                      position: 'sticky',
                      top: '20px',
                      height: 'fit-content',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    <div 
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        maxWidth: '420px',
                        margin: '0 auto'
                      }}
                    >
                      <div 
                        style={{
                          position: 'relative',
                          marginBottom: '25px',
                          width: '350px',
                          height: '350px',
                          minWidth: '350px',
                          minHeight: '350px',
                          contain: 'layout size',
                          borderRadius: '20px',
                          background: '#e9ecef',
                          overflow: 'hidden'
                        }}
                      >
                        <div className="skeleton-wave" style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, #f3f3f3 25%, #e9ecef 50%, #f3f3f3 75%)',
                          animation: 'skeleton-wave 1.6s linear infinite'
                        }} />
                      </div>
                      {/* Thumbnail gallery skeleton */}
                      <div style={{ width: '100%', maxWidth: '380px', padding: '15px 10px', background: 'rgba(255,255,255,0.7)', borderRadius: '12px', marginTop: 16 }}>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', padding: '5px 0' }}>
                          {[1,2,3].map((_, idx) => (
                            <div key={idx} style={{ width: 60, height: 76, borderRadius: 8, background: '#e9ecef', animation: 'skeleton-wave 1.6s linear infinite' }} />
                          ))}
                        </div>
                        <div className="mobile-swipe-hint" aria-hidden="true">
                          <small style={{ color: '#bbb' }}>Tap to view • Swipe to browse</small>
                        </div>
                      </div>
                      <div className="image-counter" style={{ marginTop: 8, color: '#bbb', fontWeight: 500 }}>1 of 3</div>
                    </div>
                  </div>
                  {/* Book Details Skeleton */}
                  <div className="col-md-7">
                    <div className="card-body p-4 p-md-5">
                      <div className="display-4 fw-bold mb-2" style={{ width: '60%', height: 38, background: '#e9ecef', borderRadius: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                      <div className="text-muted mb-4 fs-5" style={{ width: '40%', height: 24, background: '#f3f3f3', borderRadius: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                      <div className="row mb-4">
                        <div className="col-sm-6 mb-3">
                          <small className="text-muted d-block">Genre</small>
                          <div style={{ width: '60%', height: 18, background: '#e9ecef', borderRadius: 6, animation: 'skeleton-wave 1.6s linear infinite' }} />
                        </div>
                        <div className="col-sm-6 mb-3">
                          <small className="text-muted d-block">Condition</small>
                          <div style={{ width: '40%', height: 18, background: '#f3f3f3', borderRadius: 6, animation: 'skeleton-wave 1.6s linear infinite' }} />
                        </div>
                      </div>
                      <div className="row mb-4">
                        <div className="col-sm-6 mb-3">
                          <small className="text-muted d-block">Availability</small>
                          <div style={{ width: '50%', height: 18, background: '#e9ecef', borderRadius: 6, animation: 'skeleton-wave 1.6s linear infinite' }} />
                        </div>
                        <div className="col-sm-6 mb-3">
                          <small className="text-muted d-block">Location</small>
                          <div style={{ width: '60%', height: 18, background: '#f3f3f3', borderRadius: 6, animation: 'skeleton-wave 1.6s linear infinite' }} />
                        </div>
                      </div>
                      <div className="row mb-4">
                        <div className="col-sm-6 mb-3">
                          <small className="text-muted d-block">Edition</small>
                          <div style={{ width: '40%', height: 18, background: '#e9ecef', borderRadius: 6, animation: 'skeleton-wave 1.6s linear infinite' }} />
                        </div>
                        <div className="col-sm-6 mb-3">
                          <small className="text-muted d-block">Language</small>
                          <div style={{ width: '50%', height: 18, background: '#f3f3f3', borderRadius: 6, animation: 'skeleton-wave 1.6s linear infinite' }} />
                        </div>
                      </div>
                      <div className="mb-4">
                        <h5 className="fw-bold mb-3">Description</h5>
                        <div style={{ width: '100%', height: 60, background: '#e9ecef', borderRadius: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                      </div>
                      {/* Owner Info Skeleton */}
                      <div className="mb-4 p-3 bg-light rounded">
                        <h5 className="fw-bold mb-3">Owner</h5>
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#e9ecef', border: '2px solid #0dcaf0', animation: 'skeleton-wave 1.6s linear infinite' }} />
                          </div>
                          <div>
                            <div style={{ width: 90, height: 18, background: '#e9ecef', borderRadius: 6, marginBottom: 6, animation: 'skeleton-wave 1.6s linear infinite' }} />
                            <div style={{ width: 60, height: 14, background: '#f3f3f3', borderRadius: 6, animation: 'skeleton-wave 1.6s linear infinite' }} />
                          </div>
                        </div>
                      </div>
                      {/* Action Buttons Skeleton */}
                      <div className="d-flex flex-column flex-sm-row gap-3 mb-4">
                        <div style={{ width: 180, height: 44, background: '#e9ecef', borderRadius: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                        <div style={{ width: 180, height: 44, background: '#f3f3f3', borderRadius: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                      </div>
                      {/* Purchase Links Skeleton */}
                      <div className="mb-4">
                        <h5 className="fw-bold mb-3">Buy New Copy</h5>
                        <div className="d-flex gap-2 flex-wrap">
                          {[1,2].map((_, idx) => (
                            <div key={idx} style={{ width: 120, height: 38, background: '#e9ecef', borderRadius: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                          ))}
                        </div>
                      </div>
                      {/* Reviews Skeleton */}
                      <div className="mb-4">
                        <h5 className="fw-bold mb-3">Reviews</h5>
                        <div className="mb-3">
                          <div style={{ width: 120, height: 24, background: '#e9ecef', borderRadius: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                        </div>
                        <div className="border-bottom pb-3 mb-3">
                          <div className="d-flex">
                            <div style={{ width: 45, height: 45, borderRadius: '50%', background: '#e9ecef', marginRight: 12, animation: 'skeleton-wave 1.6s linear infinite' }} />
                            <div className="flex-grow-1">
                              <div style={{ width: 120, height: 18, background: '#e9ecef', borderRadius: 6, marginBottom: 6, animation: 'skeleton-wave 1.6s linear infinite' }} />
                              <div style={{ width: 80, height: 16, background: '#f3f3f3', borderRadius: 6, marginBottom: 6, animation: 'skeleton-wave 1.6s linear infinite' }} />
                              <div style={{ width: '100%', height: 24, background: '#e9ecef', borderRadius: 6, animation: 'skeleton-wave 1.6s linear infinite' }} />
                            </div>
                          </div>
                        </div>
                        <div style={{ width: 120, height: 24, background: '#f3f3f3', borderRadius: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Skeleton animation keyframes */}
          <style>{`
            @keyframes skeleton-wave {
              0% { background-position: -200px 0; }
              100% { background-position: 200px 0; }
            }
          `}</style>
        </>
      );
    }

  if (!book) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="card shadow-lg p-4" style={{ maxWidth: '400px' }}>
            <h2 className="text-danger mb-3">Book not found</h2>
            <p className="text-muted mb-4">The book you're looking for doesn't exist or has been removed.</p>
            <button 
              onClick={() => navigate('/browse')} 
              className="btn btn-success"
            >
              Back to Browse
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = images[currentImageIndex] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJvb2sgSW1hZ2U8L3RleHQ+PC9zdmc+';



  return (
    <>
      {/* Bootstrap CSS */}
      <link 
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" 
        rel="stylesheet" 
        integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" 
        crossOrigin="anonymous"
      />
      
      <div className="min-vh-100 bg-light py-4">
        <div className="container-fluid">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <button 
                onClick={() => navigate('/browse')} 
                className="btn btn-link p-0 text-decoration-none"
                style={{ color: '#6c757d' }}
              >
                Books
              </button>
            </li>
            <li className="breadcrumb-item text-muted">{book.genre}</li>
            <li className="breadcrumb-item active" aria-current="page">{book.title}</li>
          </ol>
        </nav>

        <div className="card shadow-lg border-0">
          <div className="row g-0">
            {/* Modern Square Book Image Section */}
            <div 
              className="col-md-5"
              style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
                padding: '35px 25px',
                borderRadius: '24px',
                position: 'sticky',
                top: '20px',
                height: 'fit-content',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            >
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  maxWidth: '420px',
                  margin: '0 auto'
                }}
              >
                {/* Modern Square Main Image Display */}
                <div 
                  style={{
                    position: 'relative',
                    marginBottom: '25px',
                    width: '350px',
                    height: '350px',
                    minWidth: '350px',
                    minHeight: '350px',
                    contain: 'layout size'
                  }}
                >
                  <div 
                    className="square-image-container"
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      borderRadius: '20px',
                      background: '#ffffff',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -8px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      overflow: 'hidden',
                      border: '3px solid rgba(255, 255, 255, 0.9)',
                      cursor: 'pointer',
                      contain: 'layout style paint',
                      willChange: 'transform'
                    }}
                    onMouseEnter={(e) => {
                      if (e.target) {
                        e.target.style.boxShadow = '0 35px 70px -12px rgba(0, 0, 0, 0.35), 0 15px 30px -8px rgba(0, 0, 0, 0.15)';
                        e.target.style.transform = 'translateY(-12px) scale(1.02)';
                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                        // Show navigation arrows
                        const prevArrow = e.target.querySelector('.prev-arrow');
                        const nextArrow = e.target.querySelector('.next-arrow');
                        if (prevArrow && currentImageIndex > 0) prevArrow.style.opacity = '1';
                        if (nextArrow && currentImageIndex < images.length - 1) nextArrow.style.opacity = '1';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (e.target) {
                        e.target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -8px rgba(0, 0, 0, 0.1)';
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.9)';
                        // Hide navigation arrows
                        const prevArrow = e.target.querySelector('.prev-arrow');
                        const nextArrow = e.target.querySelector('.next-arrow');
                        if (prevArrow) prevArrow.style.opacity = '0';
                        if (nextArrow) nextArrow.style.opacity = '0';
                      }
                    }}
                    onClick={openZoomView}
                  >
                    {/* Square Image Wrapper with Modern Styling */}
                    <div 
                      role="button"
                      tabIndex={0}
                      aria-label="Zoom book image"
                      style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        borderRadius: '17px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openZoomView();
                        }
                      }}
                    >
                      <img 
                        src={currentImage}
                        alt={book.title}
                        className="modern-square-book-image"
                        onClick={openZoomView}
                        width="350"
                        height="350"
                        fetchpriority="high"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          cursor: 'pointer',
                          transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                          display: 'block',
                          filter: 'contrast(1.05) saturate(1.1)',
                          aspectRatio: '1 / 1'
                        }}
                        onMouseEnter={(e) => {
                          if (e.target) {
                            e.target.style.transform = 'scale(1.08)';
                            e.target.style.filter = 'contrast(1.1) saturate(1.2) brightness(1.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (e.target) {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.filter = 'contrast(1.05) saturate(1.1)';
                          }
                        }}
                        onTouchStart={(e) => {
                          // Add touch feedback
                          if (e.currentTarget && e.currentTarget.style) {
                            e.currentTarget.style.transform = 'scale(0.96)';
                          }
                        }}
                        onTouchEnd={(e) => {
                          // Reset touch feedback
                          setTimeout(() => {
                            if (e.currentTarget && e.currentTarget.style) {
                              e.currentTarget.style.transform = 'scale(1)';
                            }
                          }, 150);
                        }}
                        onError={(e) => {
                          e.target.src = "/placeholder-book.jpg";
                        }}
                        loading="eager"
                        draggable="false"
                      />
                      
                      {/* Modern Overlay Gradient */}
                      <div 
                        style={{
                          position: 'absolute',
                          top: '0',
                          left: '0',
                          right: '0',
                          bottom: '0',
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',
                          opacity: '0',
                          transition: 'opacity 0.3s ease',
                          pointerEvents: 'none'
                        }}
                        className="modern-overlay"
                      />
                    </div>
                    
                    {/* Modern Zoom Indicator */}
                    <div 
                      className="zoom-indicator"
                      style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        opacity: '0',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)',
                        zIndex: '10'
                      }}
                    >
                      <span style={{ fontSize: '14px' }}>🔍</span>
                      <small>Click to zoom</small>
                    </div>


                  </div>
                </div>

                {/* Mobile-Optimized Thumbnail Gallery - Amazon Style */}
                {images.length > 1 && (
                  <div 
                    className="thumbnail-gallery-container"
                    style={{
                      width: '100%',
                      maxWidth: '380px',
                      padding: '15px 10px',
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div 
                      className="thumbnail-gallery"
                      role="tablist"
                      aria-label="Book image gallery"
                      style={{
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        padding: '5px 0'
                      }}
                    >
                      {images.map((img, idx) => (
                        <div
                          key={idx}
                          className={`thumbnail-item ${currentImageIndex === idx ? 'active' : ''}`}
                          onClick={() => {
                            setCurrentImageIndex(idx);
                          }}
                          style={{
                            position: 'relative',
                            width: '60px',
                            height: '76px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: currentImageIndex === idx ? '2px solid #ff9900' : '2px solid transparent',
                            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            background: '#ffffff',
                            boxShadow: currentImageIndex === idx 
                              ? '0 0 0 1px #ff9900, 0 4px 12px rgba(255, 153, 0, 0.25), 0 2px 6px rgba(255, 153, 0, 0.3)'
                              : '0 2px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
                            transform: currentImageIndex === idx ? 'translateY(-2px)' : 'translateY(0)'
                          }}
                          onMouseEnter={(e) => {
                            if (currentImageIndex !== idx && e.target) {
                              e.target.style.borderColor = '#232f3e';
                              e.target.style.transform = 'translateY(-3px) scale(1.02)';
                              e.target.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentImageIndex !== idx && e.target) {
                              e.target.style.borderColor = 'transparent';
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)';
                            }
                          }}
                          onTouchStart={(e) => {
                            // Add touch feedback without preventDefault (passive event)
                            if (e.currentTarget && e.currentTarget.style) {
                              e.currentTarget.style.transform = 'scale(0.95)';
                            }
                          }}
                          onTouchEnd={(e) => {
                            // Reset touch feedback
                            setTimeout(() => {
                              if (e.currentTarget && e.currentTarget.style) {
                                e.currentTarget.style.transform = 'scale(1)';
                              }
                            }, 100);
                          }}
                          role="tab"
                          tabIndex={currentImageIndex === idx ? 0 : -1}
                          aria-selected={currentImageIndex === idx}
                          aria-label={`View image ${idx + 1} of ${images.length}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setCurrentImageIndex(idx);
                            } else if (e.key === 'ArrowLeft' && idx > 0) {
                              e.preventDefault();
                              setCurrentImageIndex(idx - 1);
                            } else if (e.key === 'ArrowRight' && idx < images.length - 1) {
                              e.preventDefault();
                              setCurrentImageIndex(idx + 1);
                            }
                          }}
                        >
                          <img 
                            src={img} 
                            alt={`Book image ${idx + 1}`} 
                            loading="lazy"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                            }}
                            onError={(e) => {
                              e.target.src = "/placeholder-book.jpg";
                            }}
                            draggable="false"
                          />
                          <div className="thumbnail-overlay"></div>
                          {currentImageIndex === idx && (
                            <div 
                              className="thumbnail-active-indicator"
                              aria-hidden="true"
                            ></div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Mobile Swipe Hint */}
                    <div className="mobile-swipe-hint" aria-hidden="true">
                      <small>Tap to view • Swipe to browse</small>
                    </div>
                  </div>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="image-counter">
                    {currentImageIndex + 1} of {images.length}
                  </div>
                )}
              </div>
            </div>

            {/* Book Details Section */}
            <div className="col-md-7">
              <div className="card-body p-4 p-md-5">
                <h1 className="display-4 fw-bold mb-2">{book.title}</h1>
                <p className="text-muted mb-4 fs-5">by {book.author}</p>

                <div className="row mb-4">
                  <div className="col-sm-6 mb-3">
                    <small className="text-muted d-block">Genre</small>
                    <span className="fw-medium">{book.genre}</span>
                  </div>
                  <div className="col-sm-6 mb-3">
                    <small className="text-muted d-block">Condition</small>
                    <span className={`fw-medium ${getConditionColor(book.condition)}`}>
                      {book.condition ? book.condition.charAt(0).toUpperCase() + book.condition.slice(1) : 'Good'}
                    </span>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-sm-6 mb-3">
                    <small className="text-muted d-block">Availability</small>
                    <span className={`fw-medium ${book.status === 'available' ? 'text-success' : 'text-danger'}`}>
                      ● {book.status === 'available' ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                  <div className="col-sm-6 mb-3">
                    <small className="text-muted d-block">Location</small>
                    <span className="fw-medium">{book.location}</span>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="row mb-4">
                  <div className="col-sm-6 mb-3">
                    <small className="text-muted d-block">Edition</small>
                    <span className="fw-medium">{book.edition || 'First Edition'}</span>
                  </div>
                  <div className="col-sm-6 mb-3">
                    <small className="text-muted d-block">Language</small>
                    <span className="fw-medium">{book.language || 'English'}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Description</h5>
                  <p className="text-muted lh-lg">
                    {book.description || "No description available for this book."}
                  </p>
                </div>

                {/* Owner Information */}
                <div className="mb-4 p-3 bg-light rounded">
                  <h5 className="fw-bold mb-3">Owner</h5>
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <img
                        src={book.owner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(book.owner?.username || 'User')}&background=0dcaf0&color=fff&size=50`}
                        alt={book.owner?.username || 'User'}
                        className="rounded-circle"
                        style={{ 
                          width: '50px', 
                          height: '50px', 
                          objectFit: 'cover',
                          border: '2px solid #0dcaf0'
                        }}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(book.owner?.username || 'User')}&background=0dcaf0&color=fff&size=50`;
                        }}
                      />
                    </div>
                    <div>
                      <p className="mb-1 fw-medium">{book.owner?.username || 'Anonymous'}</p>
                      <small className="text-muted">Active User</small>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex flex-column flex-sm-row gap-3 mb-4">
                  {!isOwner ? (
                    <>
                      <button 
                        className="btn btn-success btn-lg px-4 py-2 fw-medium"
                        onClick={() => setShowRequestForm(true)}
                        disabled={book.status !== 'available'}
                      >
                        Request Book
                      </button>
                      
                      {user && (
                        <button 
                          className={`btn btn-lg px-4 py-2 fw-medium ${
                            isWishlisted ? 'btn-outline-danger' : 'btn-outline-secondary'
                          }`}
                          onClick={handleWishlistToggle}
                          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          {isWishlisted ? '♥ Remove from Wishlist' : '♡ Add to Wishlist'}
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="alert alert-info text-center mb-0 py-2">
                      <i className="bi bi-info-circle me-2"></i>
                      You own this book
                    </div>
                  )}
                </div>

                {/* Purchase Links */}
                {book.newBookUrls && (Object.keys(book.newBookUrls).length > 0) && (
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">Buy New Copy</h5>
                    <div className="d-flex gap-2 flex-wrap">
                      {book.newBookUrls.amazon && (
                        <a 
                          href={book.newBookUrls.amazon}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-warning d-flex align-items-center gap-2"
                        >
                          <span>🛒</span>
                          Amazon
                        </a>
                      )}
                      {book.newBookUrls.daraz && (
                        <a 
                          href={book.newBookUrls.daraz}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-danger d-flex align-items-center gap-2"
                        >
                          <span>🛒</span>
                          Daraz
                        </a>
                      )}
                      {book.newBookUrls.other && (
                        <a 
                          href={book.newBookUrls.other}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary d-flex align-items-center gap-2"
                        >
                          <span>🛒</span>
                          Buy Online
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Mock Reviews Section */}
                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Reviews</h5>
                  <div className="mb-3">
                    <span className="fs-4 me-2">{renderStars(4)}</span>
                    <span className="text-muted">4.2 (23 reviews)</span>
                  </div>

                  <div className="border-bottom pb-3 mb-3">
                    <div className="d-flex">
                      <div 
                        className="bg-secondary text-white rounded-circle d-flex align-items-center justify-center me-3 flex-shrink-0 fw-medium"
                        style={{ width: '45px', height: '45px', fontSize: '14px' }}
                      >
                        JD
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <h6 className="fw-semibold mb-0">John Doe</h6>
                          <small className="text-muted">2 weeks ago</small>
                        </div>
                        <div className="mb-2">{renderStars(4)}</div>
                        <p className="text-muted mb-0">
                          Great book and in good condition as described. The owner was very responsive and easy to work with!
                        </p>
                      </div>
                    </div>
                  </div>

                  <button className="btn btn-link p-0 text-success text-decoration-none">
                    View all reviews
                  </button>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Modern Mobile Image Viewer */}
      {isZoomed && (
        <div 
          className="position-fixed d-flex flex-column zoom-modal-white-background" 
          style={{ 
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#ffffff !important',
            background: '#ffffff !important',
            backgroundImage: 'none !important',
            zIndex: 9999,
            animation: 'fadeIn 0.3s ease-out',
            margin: 0,
            padding: 0
          }}
          onClick={closeZoomView}
        >
          {/* Top Navigation Bar */}
          <div 
            className="d-flex justify-content-between align-items-center px-3 py-1"
            style={{ 
              backgroundColor: 'white',
              borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
              zIndex: 10001,
              minHeight: '50px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeZoomView}
              className="d-flex align-items-center justify-content-center"
              style={{ 
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid rgba(0, 0, 0, 0.15)',
                color: '#333',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                if (e.target) {
                  e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                  e.target.style.borderColor = 'rgba(220, 53, 69, 0.4)';
                  e.target.style.color = '#dc3545';
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.boxShadow = '0 6px 16px rgba(220, 53, 69, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (e.target) {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                  e.target.style.borderColor = 'rgba(0, 0, 0, 0.15)';
                  e.target.style.color = '#333';
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }
              }}
            >
              <svg 
                width="20" 
                height="20" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{
                  display: 'block',
                  strokeWidth: '2.5',
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round'
                }}
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Book Title */}
            <div className="text-center flex-grow-1">
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#333', letterSpacing: '0.3px' }}>
                {book?.title || 'The Alchemist'}
              </div>
              {/* Image Counter */}
              {images.length > 1 && (
                <div style={{ 
                  fontSize: '14px', 
                  color: '#666', 
                  marginTop: '2px',
                  fontWeight: '500'
                }}>
                  {currentImageIndex + 1} of {images.length}
                </div>
              )}
            </div>

            {/* Zoom Percentage */}
            <div 
              style={{ 
                fontSize: '16px',
                fontWeight: '600',
                color: '#333',
                minWidth: '60px',
                textAlign: 'center'
              }}
            >
              {Math.round(zoomLevel * 100)}%
            </div>
          </div>

          {/* Central Image Container */}
          <div 
            ref={zoomModalRef}
            className="flex-grow-1 d-flex align-items-center justify-content-center position-relative"
            style={{ 
              overflow: 'hidden',
              cursor: 'default',
              padding: isMobile ? '2px' : '5px',
              height: isMobile ? `calc(100vh - ${TOP_BAR_HEIGHT}px)` : 'auto',
              margin: 0
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Previous Image Button */}
            {images.length > 1 && currentImageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="position-absolute d-flex align-items-center justify-content-center"
                style={{
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '2px solid rgba(0, 0, 0, 0.1)',
                  color: '#333',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  zIndex: 10002,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  opacity: '0.7'
                }}
                onMouseEnter={(e) => {
                  if (e.target) {
                    e.target.style.opacity = '1';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                    e.target.style.transform = 'translateY(-50%) scale(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (e.target) {
                    e.target.style.opacity = '0.7';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    e.target.style.transform = 'translateY(-50%) scale(1)';
                  }
                }}
              >
                <svg 
                  width="22" 
                  height="22" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{
                    display: 'block',
                    strokeWidth: '2.5',
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round'
                  }}
                >
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Next Image Button */}
            {images.length > 1 && currentImageIndex < images.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="position-absolute d-flex align-items-center justify-content-center"
                style={{
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '2px solid rgba(0, 0, 0, 0.1)',
                  color: '#333',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  zIndex: 10002,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  opacity: '0.7'
                }}
                onMouseEnter={(e) => {
                  if (e.target) {
                    e.target.style.opacity = '1';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                    e.target.style.transform = 'translateY(-50%) scale(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (e.target) {
                    e.target.style.opacity = '0.7';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    e.target.style.transform = 'translateY(-50%) scale(1)';
                  }
                }}
              >
                <svg 
                  width="22" 
                  height="22" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{
                    display: 'block',
                    strokeWidth: '2.5',
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round'
                  }}
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            <img 
              src={currentImage}
              alt={`${book?.title || 'Book'} - Image ${currentImageIndex + 1}`}
              style={{
                maxWidth: isMobile ? '99%' : '98%',
                maxHeight: isMobile ? `calc(100vh - ${TOP_BAR_HEIGHT + 10}px)` : '98%',
                width: 'auto',
                height: 'auto',
                transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                objectFit: 'contain',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (isMobile) {
                  // Mobile: Tap to cycle through zoom levels (1x → 1.5x → 2x → 1x)
                  if (zoomLevel < 1.25) {
                    handleZoomIn(); // Go to 1.25x
                  } else if (zoomLevel < 1.75) {
                    handleZoomIn(); // Go to 1.5x then 1.75x then 2x
                  } else if (zoomLevel < 2) {
                    handleZoomIn(); // Go to 2x
                  } else {
                    // Reset to 1x
                    resetView();
                  }
                } else {
                  // Desktop: Left click - zoom out
                  if (zoomLevel > 0.5) {
                    handleZoomOut();
                  } else {
                    resetView();
                  }
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isMobile) {
                  // Desktop only: Right click - zoom in
                  if (zoomLevel < 2) {
                    handleZoomIn();
                  }
                }
              }}
              onError={(e) => {
                if (e.target.src.includes('placeholder-book.jpg')) {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJvb2sgSW1hZ2U8L3RleHQ+PC9zdmc+';
                } else {
                  e.target.src = "/placeholder-book.jpg";
                }
              }}
              draggable={false}
            />
          </div>

          {/* Mobile Zoom Controls */}
          {isMobile && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              zIndex: '10001'
            }}>
              {/* Zoom In Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (zoomLevel < 2) {
                    handleZoomIn();
                  }
                }}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#333',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: zoomLevel >= 2 ? 0.5 : 1,
                  userSelect: 'none'
                }}
                disabled={zoomLevel >= 2}
              >
                +
              </button>
              
              {/* Zoom Out Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (zoomLevel > 0.5) {
                    handleZoomOut();
                  } else {
                    resetView();
                  }
                }}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#333',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: zoomLevel <= 0.5 ? 0.5 : 1,
                  userSelect: 'none'
                }}
                disabled={zoomLevel <= 0.5}
              >
                −
              </button>
            </div>
          )}

        </div>
      )}



      {/* Request Exchange Modal */}
      {showRequestForm && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-4" 
             style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} 
             onClick={() => setShowRequestForm(false)}>
          <div className="bg-white rounded shadow-lg w-100" 
               style={{ maxWidth: '28rem', maxHeight: '90vh', overflowY: 'auto' }} 
               onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
              <h2 className="h4 fw-bold mb-0">Request Book Exchange</h2>
              <button 
                className="btn btn-outline-secondary btn-sm rounded-circle p-2"
                onClick={() => setShowRequestForm(false)}
                style={{ width: '40px', height: '40px' }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded">
                <img src={currentImage} alt={book.title} className="rounded" 
                     style={{ width: '4rem', height: '5rem', objectFit: 'cover' }} />
                <div>
                  <h5 className="fw-bold mb-1">{book.title}</h5>
                  <p className="text-muted mb-1">by {book.author}</p>
                  <small className="text-muted">Owner: {book.owner?.username}</small>
                </div>
              </div>
              
              <form onSubmit={handleRequestSubmit}>
                <div className="mb-3">
                  <label htmlFor="request-message" className="form-label fw-medium">
                    Message to Owner:
                  </label>
                  <textarea
                    id="request-message"
                    className="form-control"
                    placeholder={`Hi ${book.owner?.username}, I'm interested in exchanging books with you. I'd like to borrow "${book.title}". Please let me know if you're available for an exchange.`}
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    required
                    rows={5}
                    style={{ resize: 'none' }}
                  />
                </div>
                <div className="d-flex gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-success flex-fill fw-medium"
                  >
                    Send Request
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary flex-fill fw-medium"
                    onClick={() => setShowRequestForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default BookDetail;