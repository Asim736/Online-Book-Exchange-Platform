import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../config/axios';
import './styles/UserProfile.css';

const UserProfile = () => {
  const { user, login } = useAuth();
  
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    contact: '',
    bio: ''
  });

  const [userBooks, setUserBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [booksPage, setBooksPage] = useState(1);
  const [booksTotal, setBooksTotal] = useState(0);
  const [booksPages, setBooksPages] = useState(1);
  const BOOKS_LIMIT = 8;
  const [profileImage, setProfileImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [openSection, setOpenSection] = useState({
    accountSettings: true,
    editProfile: true,
    listedBooks: true
  });
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setProfileLoading(true);
        setLoading(true);

        // If user is available from auth context, use it
        if (user) {
          setProfile({
            name: user.username || '',
            email: user.email || '',
            contact: user.contact || '',
            bio: user.bio || ''
          });
        }

        // Fetch user's books (paginated)
        const booksResponse = await axios.get(`/books/my-books?page=1&limit=${BOOKS_LIMIT}`);
        setUserBooks(booksResponse.data.books || []);
        setBooksTotal(booksResponse.data.total || 0);
        setBooksPages(booksResponse.data.pages || 1);
        setBooksPage(1);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Set fallback data if user exists in auth context
        if (user) {
          setProfile({
            name: user.username || 'User',
            email: user.email || '',
            contact: '',
            bio: ''
          });
        }
        // Set empty books array on error
        setUserBooks([]);
        setBooksTotal(0);
        setBooksPages(1);
        setBooksPage(1);
      } finally {
        setLoading(false);
        setProfileLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    } else {
      setProfileLoading(false);


  // Load more books (pagination)
  const loadMoreBooks = async () => {
    try {
      const nextPage = booksPage + 1;
      const booksResponse = await axios.get(`/books/my-books?page=${nextPage}&limit=${BOOKS_LIMIT}`);
      setUserBooks(prev => [...prev, ...(booksResponse.data.books || [])]);
      setBooksPage(nextPage);
    } catch (error) {
      console.error('Error loading more books:', error);
    }
  };
      setLoading(false);
    }
  }, [user]);

  const toggleSection = (section) => {
    setOpenSection({
      ...openSection,
      [section]: !openSection[section]
    });
  };

  const handlePasswordChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdatePassword = async () => {
    if (passwords.newPass !== passwords.confirm) {
      alert('New passwords do not match!');
      return;
    }
    if (passwords.newPass.length < 6) {
      alert('New password must be at least 6 characters long!');
      return;
    }
    
    try {
      await axios.put('/users/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass
      });
      alert('Password updated successfully!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating password');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await axios.put('/users/profile', {
        username: profile.name,
        email: profile.email,
        contact: profile.contact,
        bio: profile.bio
      });
      
      // Update the auth context with new user data
      if (response.data.user) {
        login(localStorage.getItem('token'), response.data.user);
      }
      
      alert('Profile updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating profile');
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await axios.delete(`/books/${bookId}`);
        setUserBooks(userBooks.filter(book => book._id !== bookId));
        alert('Book deleted successfully!');
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting book');
      }
    }
  };

  const handleEditBook = (bookId) => {
    // Navigate to edit book page (you can implement this route)
    window.location.href = `/books/edit/${bookId}`;
  };

  const handleRemoveImage = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    try {
      setUploadingImage(true);
      
      // Update profile with null avatar
      const response = await axios.put('/users/profile', {
        username: profile.name,
        email: profile.email,
        contact: profile.contact,
        bio: profile.bio,
        avatar: null
      });
      
      // Update the auth context with new user data
      if (response.data.user) {
        login(localStorage.getItem('token'), response.data.user);
      }
      
      alert('Profile picture removed successfully!');
      
    } catch (error) {
      console.error('Error removing image:', error);
      alert(error.response?.data?.message || 'Error removing profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Image = event.target.result;
          
          // Update profile with new image
          const response = await axios.put('/users/profile', {
            username: profile.name,
            email: profile.email,
            contact: profile.contact,
            bio: profile.bio,
            avatar: base64Image
          });
          
          // Update the auth context with new user data
          if (response.data.user) {
            login(localStorage.getItem('token'), response.data.user);
          }
          
          alert('Profile image updated successfully!');
          
        } catch (error) {
          console.error('Error uploading image:', error);
          alert(error.response?.data?.message || 'Error updating profile image');
        } finally {
          setUploadingImage(false);
        }
      };
      
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image');
      setUploadingImage(false);
    }
  };

  const ChevronIcon = ({ isOpen }) => (
    <svg 
      width="24" 
      height="24" 
      fill="currentColor" 
      viewBox="0 0 16 16" 
      className={`chevron-icon ${isOpen ? 'open' : ''}`}
    >
      <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
    </svg>
  );

  

  const memberSince = user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();

  // Show loading state if user is not yet loaded
  if (profileLoading) {
    return (
      <div className="profile-page">
        <div className="container">
          <h1 className="page-title">My Profile</h1>
          <div className="profile-layout">
            {/* Left Sidebar - Profile Card Skeleton */}
            <div className="profile-sidebar">
              <div className="profile-card">
                <div className="profile-image-container">
                  <div style={{
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: '#e9ecef',
                    margin: '0 auto',
                    marginBottom: 24,
                    animation: 'skeleton-wave 1.6s linear infinite'
                  }} />
                </div>
                <div style={{ width: 100, height: 24, background: '#e9ecef', borderRadius: 8, margin: '0 auto 8px', animation: 'skeleton-wave 1.6s linear infinite' }} />
                <div style={{ width: 80, height: 16, background: '#f3f3f3', borderRadius: 8, margin: '0 auto 8px', animation: 'skeleton-wave 1.6s linear infinite' }} />
                <div style={{ width: 120, height: 16, background: '#e9ecef', borderRadius: 8, margin: '0 auto', animation: 'skeleton-wave 1.6s linear infinite' }} />
              </div>
            </div>
            {/* Right Content Area Skeleton */}
            <div className="profile-content">
              {/* Account Settings Section Skeleton */}
              <div className="profile-section">
                <div className="section-header">
                  <div style={{ width: 160, height: 20, background: '#e9ecef', borderRadius: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                  <div style={{ width: 24, height: 24, background: '#f3f3f3', borderRadius: '50%', animation: 'skeleton-wave 1.6s linear infinite' }} />
                </div>
                <div className="section-content">
                  {[1,2,3].map((_, i) => (
                    <div key={i} className="form-group">
                      <div style={{ width: 120, height: 16, background: '#e9ecef', borderRadius: 6, marginBottom: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                      <div style={{ width: '100%', height: 36, background: '#f3f3f3', borderRadius: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                    </div>
                  ))}
                  <div className="form-actions">
                    <div style={{ width: 160, height: 40, background: '#e9ecef', borderRadius: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                  </div>
                </div>
              </div>
              {/* Edit Profile Information Section Skeleton */}
              <div className="profile-section">
                <div className="section-header">
                  <div style={{ width: 200, height: 20, background: '#e9ecef', borderRadius: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                  <div style={{ width: 24, height: 24, background: '#f3f3f3', borderRadius: '50%', animation: 'skeleton-wave 1.6s linear infinite' }} />
                </div>
                <div className="section-content">
                  {[1,2,3,4].map((_, i) => (
                    <div key={i} className="form-group">
                      <div style={{ width: 120, height: 16, background: '#e9ecef', borderRadius: 6, marginBottom: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                      <div style={{ width: '100%', height: 36, background: '#f3f3f3', borderRadius: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                    </div>
                  ))}
                  {/* Profile picture skeleton */}
                  <div className="form-group">
                    <div style={{ width: 120, height: 16, background: '#e9ecef', borderRadius: 6, marginBottom: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                    <div style={{ width: 80, height: 80, background: '#f3f3f3', borderRadius: '50%', marginBottom: 12, animation: 'skeleton-wave 1.6s linear infinite' }} />
                    <div style={{ width: 180, height: 36, background: '#e9ecef', borderRadius: 8, marginBottom: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                  </div>
                  <div className="form-actions">
                    <div style={{ width: 160, height: 40, background: '#e9ecef', borderRadius: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                  </div>
                </div>
              </div>
              {/* My Listed Books Section Skeleton */}
              <div className="profile-section">
                <div className="section-header">
                  <div style={{ width: 160, height: 20, background: '#e9ecef', borderRadius: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                  <div style={{ width: 24, height: 24, background: '#f3f3f3', borderRadius: '50%', animation: 'skeleton-wave 1.6s linear infinite' }} />
                </div>
                <div className="section-content">
                  {[1,2].map((_, i) => (
                    <div key={i} className="book-item" style={{ background: '#f8f9fa', borderRadius: 12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16, padding: 16 }}>
                      <div style={{ width: 60, height: 80, background: '#e9ecef', borderRadius: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ width: 120, height: 16, background: '#e9ecef', borderRadius: 6, marginBottom: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                        <div style={{ width: 80, height: 14, background: '#f3f3f3', borderRadius: 6, marginBottom: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                        <div style={{ width: 100, height: 12, background: '#e9ecef', borderRadius: 6, animation: 'skeleton-wave 1.6s linear infinite' }} />
                      </div>
                      <div style={{ width: 60, height: 32, background: '#e9ecef', borderRadius: 8, animation: 'skeleton-wave 1.6s linear infinite' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <style>{`
            @keyframes skeleton-wave {
              0% { background-position: -200px 0; }
              100% { background-position: 200px 0; }
            }
            .skeleton-wave {
              background: linear-gradient(90deg, #f3f3f3 25%, #e9ecef 50%, #f3f3f3 75%);
              background-size: 400% 100%;
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Show error state if no user is logged in
  if (!user) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="no-user" style={{ textAlign: 'center', paddingTop: '3rem' }}>
            <p>Please log in to view your profile.</p>
            <button 
              className="btn-primary"
              onClick={() => window.location.href = '/login'}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="page-title">My Profile</h1>

        <div className="profile-layout">
          {/* Left Sidebar - Profile Card */}
          <div className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-image-container">
                <img 
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || user?.username || 'User')}&background=0dcaf0&color=fff&size=150`} 
                  alt={profile.name || user?.username || 'User'} 
                  className="profile-image"
                />
              </div>
              <h3 className="profile-name">
                {profile.name || user?.username || 'User'}
              </h3>
              <p className="member-since">Member since {memberSince}</p>
              {profile.bio && (
                <p className="profile-bio" style={{ 
                  color: '#6c757d', 
                  fontSize: '0.9rem', 
                  marginTop: '0.5rem',
                  fontStyle: 'italic'
                }}>
                  "{profile.bio}"
                </p>
              )}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="profile-content">
            {/* Account Settings Section */}
            <div className="profile-section">
              <div 
                className="section-header" 
                onClick={() => toggleSection('accountSettings')}
              >
                <h3>Account Settings</h3>
                <ChevronIcon isOpen={openSection.accountSettings} />
              </div>
              {openSection.accountSettings && (
                <div className="section-content">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter current password"
                      name="current"
                      value={passwords.current}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter new password"
                      name="newPass"
                      value={passwords.newPass}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input 
                      type="password" 
                      placeholder="Confirm new password"
                      name="confirm"
                      value={passwords.confirm}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="form-actions">
                    <button onClick={handleUpdatePassword} className="btn-primary">
                      Update Password
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Edit Profile Information Section */}
            <div className="profile-section">
              <div 
                className="section-header" 
                onClick={() => toggleSection('editProfile')}
              >
                <h3>Edit Profile Information</h3>
                <ChevronIcon isOpen={openSection.editProfile} />
              </div>
              {openSection.editProfile && (
                <div className="section-content">
                  <div className="form-group">
                    <label>Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Number</label>
                    <input 
                      type="tel" 
                      name="contact"
                      value={profile.contact}
                      onChange={handleProfileChange}
                      placeholder="Enter your contact number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea 
                      name="bio"
                      value={profile.bio}
                      onChange={handleProfileChange}
                      placeholder="Tell us about yourself..."
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e9ecef',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        background: 'white',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Profile Picture</label>
                    <div className="profile-picture-upload">
                      {user?.avatar && (
                        <div className="current-avatar">
                          <img 
                            src={user.avatar} 
                            alt="Current profile" 
                            style={{
                              width: '80px',
                              height: '80px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '3px solid #0dcaf0',
                              marginBottom: '1rem'
                            }}
                          />
                        </div>
                      )}
                      <div className="upload-buttons">
                        <input
                          id="profile-image-input"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                        />
                        <button 
                          type="button"
                          onClick={() => document.getElementById('profile-image-input').click()}
                          className="btn-upload"
                          disabled={uploadingImage}
                          style={{
                            background: '#0dcaf0',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            marginRight: '1rem',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {uploadingImage ? 'Uploading...' : (user?.avatar ? 'Change Picture' : 'Upload Picture')}
                        </button>
                        {user?.avatar && (
                          <button 
                            type="button"
                            onClick={handleRemoveImage}
                            className="btn-remove"
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '0.75rem 1.5rem',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Remove Picture
                          </button>
                        )}
                      </div>
                      <small style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                        Supported formats: JPG, PNG, GIF. Max size: 5MB
                      </small>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button onClick={handleUpdateProfile} className="btn-primary">
                      Update Profile
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* My Listed Books Section */}
            <div className="profile-section">
              <div 
                className="section-header" 
                onClick={() => toggleSection('listedBooks')}
              >
                <h3>My Listed Books</h3>
                <ChevronIcon isOpen={openSection.listedBooks} />
              </div>
              {openSection.listedBooks && (
                <div className="section-content">
                  {loading ? (
                    <div className="loading">Loading books...</div>
                  ) : userBooks.length === 0 ? (
                    <div className="no-books">
                      <p>You haven't listed any books yet.</p>
                      <button 
                        className="btn-primary"
                        onClick={() => window.location.href = '/upload'}
                      >
                        Add Your First Book
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="books-list">
                        {userBooks.map(book => (
                          <div key={book._id} className="book-item">
                            <div className="book-info">
                              <div style={{ width: 60, height: 90, borderRadius: '0.5rem', overflow: 'hidden', background: '#f3f3f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img 
                                  src={book.images?.[0] || '/placeholder-book.png'} 
                                  alt={book.title}
                                  className="book-cover"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '2/3', display: 'block' }}
                                />
                              </div>
                              <div className="book-details">
                                <h6 className="book-title">{book.title}</h6>
                                <p className="book-genre">{book.genre}</p>
                                {book.condition && (
                                  <p className="book-condition">Condition: {book.condition}</p>
                                )}
                              </div>
                            </div>
                            <div className="book-actions">
                              <button 
                                className="btn-edit"
                                onClick={() => handleEditBook(book._id)}
                              >
                                Edit
                              </button>
                              <button 
                                className="btn-delete"
                                onClick={() => handleDeleteBook(book._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {booksPage < booksPages && (
                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                          <button onClick={loadMoreBooks} className="btn-primary">Load More</button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;