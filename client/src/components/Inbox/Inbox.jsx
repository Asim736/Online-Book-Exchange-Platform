import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/constants.js';

const Inbox = () => {
  const { user, token } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showChatDetail, setShowChatDetail] = useState(false);
  
  // Request Details Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);
  
  // Requests data (pagination)
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsTotal, setRequestsTotal] = useState(0);
  const [requestsPages, setRequestsPages] = useState(1);

  // Conversations data (pagination)
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [conversationsPage, setConversationsPage] = useState(1);
  const [conversationsTotal, setConversationsTotal] = useState(0);
  const [conversationsPages, setConversationsPages] = useState(1);
  
  // Messages data - simplified structure for now
  const [messages, setMessages] = useState({});
  
  const chatBoxRef = useRef(null);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch requests and conversations data on component mount
  useEffect(() => {
    if (user?._id && token && typeof user._id === 'string') {
      fetchRequests(1);
      fetchConversations(1);
    } else {
      // Clear conversations if user is not logged in
      setConversations([]);
      setMessages({});
      setSelectedChat(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, token]);

  const fetchRequests = async (page = 1) => {
    setRequestsLoading(true);
    try {
      // Incoming requests (paginated)
      const incomingRes = await fetch(`${API_BASE_URL}/requests/owner/${user._id}?page=${page}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (incomingRes.ok) {
        const incomingData = await incomingRes.json();
        if (Array.isArray(incomingData.requests)) {
          setIncomingRequests(page === 1 ? incomingData.requests.map(req => ({
            id: String(req._id || ''),
            bookId: String(req.book?._id || ''),
            bookTitle: String(req.book?.title || "Unknown Book"),
            bookCover: String(req.book?.images?.[0] || "/placeholder-book.jpg"),
            requesterName: String(req.requester?.username || "Unknown"),
            requesterId: String(req.requester?._id || ''),
            message: String(req.message || ""),
            status: String(req.status || "pending"),
            createdAt: req.createdAt,
            type: 'incoming'
          })) : [
            ...incomingRequests,
            ...incomingData.requests.map(req => ({
              id: String(req._id || ''),
              bookId: String(req.book?._id || ''),
              bookTitle: String(req.book?.title || "Unknown Book"),
              bookCover: String(req.book?.images?.[0] || "/placeholder-book.jpg"),
              requesterName: String(req.requester?.username || "Unknown"),
              requesterId: String(req.requester?._id || ''),
              message: String(req.message || ""),
              status: String(req.status || "pending"),
              createdAt: req.createdAt,
              type: 'incoming'
            }))
          ]);
          setRequestsTotal(incomingData.total || 0);
          setRequestsPages(incomingData.pages || 1);
          setRequestsPage(incomingData.page || 1);
        } else {
          setIncomingRequests([]);
        }
      }
      // Outgoing requests (not paginated yet)
      const outgoingRes = await fetch(`${API_BASE_URL}/requests/user/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (outgoingRes.ok) {
        const outgoingData = await outgoingRes.json();
        if (Array.isArray(outgoingData)) {
          setOutgoingRequests(outgoingData.map(req => ({
            id: String(req._id || ''),
            bookId: String(req.book?._id || ''),
            bookTitle: String(req.book?.title || "Unknown Book"),
            bookCover: String(req.book?.images?.[0] || "/placeholder-book.jpg"),
            ownerName: String(req.owner?.username || "Unknown"),
            ownerId: String(req.owner?._id || ''),
            message: String(req.message || ""),
            status: String(req.status || "pending"),
            createdAt: req.createdAt,
            type: 'outgoing'
          })));
        } else {
          setOutgoingRequests([]);
        }
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchConversations = async (page = 1) => {
    setConversationsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/requests/conversations/${user._id}?page=${page}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const conversationsData = await response.json();
        if (Array.isArray(conversationsData.conversations)) {
          setConversations(page === 1 ? conversationsData.conversations.map(conv => ({
            id: conv.id,
            name: conv.participant.username,
            message: conv.lastMessage,
            time: formatTime(conv.lastMessageTime),
            status: conv.status,
            avatar: `https://i.pravatar.cc/150?u=${conv.participant.email}`,
            unread: conv.unreadCount,
            book: conv.book,
            requestId: conv.requestId,
            isOwner: conv.isOwner,
            participantId: conv.id
          })) : [
            ...conversations,
            ...conversationsData.conversations.map(conv => ({
              id: conv.id,
              name: conv.participant.username,
              message: conv.lastMessage,
              time: formatTime(conv.lastMessageTime),
              status: conv.status,
              avatar: `https://i.pravatar.cc/150?u=${conv.participant.email}`,
              unread: conv.unreadCount,
              book: conv.book,
              requestId: conv.requestId,
              isOwner: conv.isOwner,
              participantId: conv.id
            }))
          ]);
          setConversationsTotal(conversationsData.total || 0);
          setConversationsPages(conversationsData.pages || 1);
          setConversationsPage(conversationsData.page || 1);

          // Initialize message threads
          const initialMessages = {};
          conversationsData.conversations.forEach(conv => {
            initialMessages[conv.id] = [
              {
                id: 1,
                sender: conv.isOwner ? 'other' : 'me',
                text: conv.lastMessage,
                time: formatTime(conv.lastMessageTime)
              }
            ];
          });
          setMessages(initialMessages);

          // Set the first conversation as selected if none is selected
          if (!selectedChat && conversationsData.conversations.length > 0) {
            setSelectedChat(conversationsData.conversations[0].id);
          }
        } else {
          setConversations([]);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setConversationsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Use conversations from API instead of hardcoded contacts

  const handleRequestAction = async (requestId, newStatus, bookId) => {
    if (!requestId || !newStatus || !token) {
      console.error('Missing required parameters for request action');
      alert('Unable to process request. Please try again.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update request");

      // Update local state
      setIncomingRequests(prev =>
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: newStatus }
            : req
        )
      );

      // Update conversations status
      setConversations(prev =>
        prev.map(conv => 
          conv.requestId === requestId 
            ? { ...conv, status: newStatus }
            : conv
        )
      );

      alert(`Request has been ${newStatus} successfully!`);
    } catch (error) {
      console.error("Error updating request:", error);
      alert(`Failed to update request: ${error.message}`);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        sender: 'me',
        text: message,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      };
      
      setMessages(prev => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), newMessage]
      }));
      setMessage('');
    }
  };

  const handleContactClick = (contactId) => {
    setSelectedChat(contactId);
    if (isMobile) {
      setShowChatDetail(true);
    }
  };

  const handleBackToContacts = () => {
    setShowChatDetail(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="badge bg-warning text-dark">Pending</span>,
      accepted: <span className="badge bg-success">Accepted</span>,
      rejected: <span className="badge bg-danger">Rejected</span>
    };
    return badges[status] || null;
  };

  const handleViewRequestDetails = (conversation) => {
    setSelectedRequestDetails(conversation);
    setShowRequestModal(true);
  };

  const handleCloseRequestModal = () => {
    setShowRequestModal(false);
    setSelectedRequestDetails(null);
  };

  // Check if user is authenticated
  if (!user || !token) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <h5>Please log in to access your inbox</h5>
          <p className="text-muted">You need to be logged in to see your conversations.</p>
        </div>
      </div>
    );
  }

  const selectedContact = conversations.find(c => c.id === selectedChat) || conversations[0];

  // Show loading if conversations are still loading
  if (conversationsLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading conversations...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no conversations
  if (!conversationsLoading && conversations.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <h5>No conversations yet</h5>
          <p className="text-muted">Start exchanging books to see your conversations here!</p>
        </div>
      </div>
    );
  }

  // Early return if no data is available
  if (!selectedContact) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading inbox...</p>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet" />
       <style>{`
        .app-container {
          min-height: 100vh;
          background-color: #f0f2f5;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .sidebar {
          background-color: white;
          border-right: 1px solid #e0e0e0;
          overflow-y: auto;
          height: 100vh;
        }

        .search-icon {
          background-color: white;
          border-right: 0;
        }

        .search-input {
          border-left: 0;
        }

        .contact-item {
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .contact-item:hover {
          background-color: #f8f9fa;
        }

        .contact-item.active {
          background-color: #f8f9fa;
        }

        .online-indicator {
          width: 12px;
          height: 12px;
          border: 2px solid white;
          position: absolute;
          bottom: 0;
          right: 0;
        }

        .unread-badge {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-container {
          background-color: white;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .chat-header {
          border-bottom: 1px solid #e0e0e0;
        }

        .request-banner {
          background-color: #fff9e6;
          border: 1px solid #ffe4a3;
        }

        .request-banner-accepted {
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
        }

        .request-banner-rejected {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
        }

        .request-title {
          color: #92400e;
        }

        .request-text {
          color: #92400e;
        }

        .messages-area {
          flex-grow: 1;
          overflow-y: auto;
          background-color: #fafafa;
        }

        .message-bubble {
          max-width: 60%;
        }

        .message-sent {
          background-color: #28a745;
          color: white;
          border-radius: 18px 18px 4px 18px;
        }

        .message-received {
          background-color: white;
          border-radius: 18px 18px 18px 4px;
        }

        .message-avatar {
          align-self: flex-end;
        }

        .message-input-container {
          background-color: white;
          border-top: 1px solid #e0e0e0;
        }

        .message-input {
          background-color: #f8f9fa;
          border-radius: 24px 0 0 24px;
          border: 0;
          padding: 0.75rem 1rem;
        }

        .message-input:focus {
          background-color: #f8f9fa;
          box-shadow: none;
        }

        .attach-button {
          background-color: #f8f9fa;
          border: 0;
        }

        .attach-button:hover {
          background-color: #e9ecef;
        }

        .send-button {
          border-radius: 24px;
          padding: 0.75rem 1.5rem;
        }

        .icon-button {
          width: 20px;
          height: 20px;
        }

        .mobile-chat-view {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .mobile-back-button {
          background: none;
          border: none;
          color: #007bff;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          font-size: 16px;
          font-weight: 500;
          border-radius: 6px;
        }

        .mobile-back-button:hover {
          background-color: #f8f9fa;
        }

        .mobile-header-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
        }

        .min-width-0 {
          min-width: 0;
        }

        .mobile-header-name {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          line-height: 1.2;
        }

        .mobile-header-status {
          font-size: 14px;
          margin: 0;
          line-height: 1;
        }

        .mobile-header-actions {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          flex-shrink: 0 !important;
          margin-left: auto !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        .mobile-action-btn {
          width: 40px !important;
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 50% !important;
          background-color: #f8f9fa !important;
          border: 1px solid #dee2e6 !important;
          padding: 0 !important;
          margin: 0 !important;
          min-width: 40px !important;
          flex-shrink: 0 !important;
        }

        .mobile-action-btn:hover {
          background-color: #e9ecef !important;
        }

        .mobile-action-btn:focus {
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25) !important;
        }

        .mobile-action-btn svg {
          width: 18px !important;
          height: 18px !important;
          color: #6c757d !important;
          flex-shrink: 0 !important;
        }

        @media (max-width: 768px) {
          .app-container {
            overflow-x: hidden;
          }

          .sidebar {
            height: 100vh;
            width: 100%;
          }
          
          .chat-container {
            display: none;
          }
          
          .message-bubble {
            max-width: 85%;
          }

          .mobile-sidebar-only .sidebar {
            display: block;
          }

          .mobile-sidebar-only .chat-container {
            display: none;
          }

          .mobile-chat-only .sidebar {
            display: none;
          }

          .mobile-chat-only .chat-container {
            display: flex;
            height: 100vh;
          }

          .chat-header {
            padding: 12px 16px;
            min-height: 70px;
            border-bottom: 1px solid #e0e0e0;
            flex-shrink: 0;
          }

          .messages-area {
            padding: 16px 12px;
            overflow-y: auto;
            flex: 1;
          }

          .message-input-container {
            padding: 12px 16px;
            flex-shrink: 0;
            border-top: 1px solid #e0e0e0;
          }

          .contact-item {
            padding: 16px 12px;
          }

          .mobile-chat-view .chat-header {
            position: sticky;
            top: 0;
            background: white;
            z-index: 10;
          }
        }

        @media (min-width: 769px) {
          .mobile-chat-view {
            display: none;
          }
          
          .sidebar {
            height: 100vh;
          }
          
          .chat-container {
            display: flex;
            height: 100vh;
          }
        }
      `}</style>
      
     <div className="app-container">
        <div className="container-fluid p-0" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
          <div className={`row g-0 ${isMobile ? (showChatDetail ? 'mobile-chat-only' : 'mobile-sidebar-only') : ''}`}>
            <div className="col-md-4 col-lg-3 sidebar left-sidebar">
              <div className="search-section">
                <h4 className="mb-4 fw-bold" style={{ color: '#1f2937', fontSize: '24px', fontWeight: '600' }}>Inbox</h4>
                <input type="text" className="search-bar" placeholder="Search conversations..." />
              </div>
              <div className="contacts-list">

                {conversations.map((contact) => (
                  <div
                    key={contact.id}
                    className={`contact-item d-flex align-items-start p-3 mb-2 rounded ${selectedChat === contact.id ? 'active' : ''}`}
                    onClick={() => handleContactClick(contact.id)}
                  >
                    <div className="position-relative me-3" style={{ minWidth: '50px' }}>
                      <img src={contact.avatar} alt={contact.name} className="rounded-circle" width="50" height="50" />
                      {contact.status === 'online' && (
                        <span className="online-indicator bg-success rounded-circle"></span>
                      )}
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="mb-0 fw-bold" style={{ fontSize: '16px' }}>{contact.name}</h6>
                        <small className="text-muted" style={{ fontSize: '12px', whiteSpace: 'nowrap', marginLeft: '8px' }}>{contact.time}</small>
                      </div>
                      <p className="mb-2 text-muted small text-truncate" style={{ fontSize: '14px' }}>{contact.message}</p>
                      {contact.status && <div>{getStatusBadge(contact.status)}</div>}
                      {contact.unread && contact.unread > 0 && (
                        <span className="badge bg-success rounded-circle mt-2 unread-badge">{contact.unread}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Load More Conversations Button */}
              {conversationsPage < conversationsPages && (
                <div className="d-flex justify-content-center my-3">
                  <button className="btn btn-outline-primary" onClick={() => fetchConversations(conversationsPage + 1)}>
                    Load More Conversations
                  </button>
                </div>
              )}
// Optionally, you can add a similar Load More for incoming requests if you want to paginate the requests list in the UI.
            </div>

            <div className="col-md-8 col-lg-9 chat-container">
              <div className="chat-header d-flex align-items-center justify-content-between p-3">
                <div className="d-flex align-items-center">
                  {isMobile && (
                    <button 
                      className="mobile-back-button me-3"
                      onClick={handleBackToContacts}
                    >
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                      </svg>
                      Back
                    </button>
                  )}
                  <img src={selectedContact?.avatar} alt={selectedContact?.name} className="rounded-circle me-3" width="50" height="50" />
                  <div>
                    <h5 className="mb-0 fw-bold">{selectedContact?.name}</h5>
                    <small className="text-success">Online</small>
                  </div>
                </div>
                {!isMobile && (
                  <div>
                    <button className="btn btn-light me-2">
                      <svg className="icon-button" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
                      </svg>
                    </button>
                    <button className="btn btn-light me-2">
                      <svg className="icon-button" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2v-2z"/>
                      </svg>
                    </button>
                    <button className="btn btn-light">
                      <svg className="icon-button" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                      </svg>
                    </button>
                  </div>
                )}
                {isMobile && (
                  <div className="mobile-header-actions">
                    <button type="button" className="btn mobile-action-btn" title="Call">
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
                      </svg>
                    </button>
                    <button type="button" className="btn mobile-action-btn" title="More options">
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {selectedContact && selectedContact.requestId && selectedContact.isOwner && (
                <div className={`mx-4 mt-4 p-4 rounded ${
                  selectedContact.status === 'pending' ? 'request-banner' : 
                  selectedContact.status === 'accepted' ? 'request-banner-accepted' : 
                  'request-banner-rejected'
                }`}>
                  <div className="d-flex align-items-start">
                    <svg width="24" height="24" fill={
                      selectedContact.status === 'pending' ? '#f59e0b' :
                      selectedContact.status === 'accepted' ? '#10b981' :
                      '#ef4444'
                    } viewBox="0 0 16 16" className="me-3 mt-1">
                      {selectedContact.status === 'pending' && (
                        <>
                          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                        </>
                      )}
                      {selectedContact.status === 'accepted' && (
                        <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                      )}
                      {selectedContact.status === 'rejected' && (
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                      )}
                    </svg>
                    <div className="flex-grow-1">
                      <h6 className="mb-2 fw-bold request-title">
                        {selectedContact.status === 'pending' ? 'Book Exchange Request' :
                         selectedContact.status === 'accepted' ? 'Request Accepted' :
                         'Request Rejected'}
                      </h6>
                      <p className="mb-3 request-text">
                        {selectedContact.status === 'pending' ? 
                          `${selectedContact.name} wants to exchange for "${selectedContact.book?.title}".` :
                         selectedContact.status === 'accepted' ? 
                          `You accepted ${selectedContact.name}'s request for "${selectedContact.book?.title}".` :
                          `You rejected ${selectedContact.name}'s request for "${selectedContact.book?.title}".`
                        }
                      </p>
                      {selectedContact.status === 'pending' ? (
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-success d-flex align-items-center"
                            onClick={() => handleRequestAction(selectedContact.requestId, 'accepted', selectedContact.book?._id)}
                          >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="me-2">
                              <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                            </svg>
                            Approve Request
                          </button>
                          <button 
                            className="btn btn-danger d-flex align-items-center"
                            onClick={() => handleRequestAction(selectedContact.requestId, 'rejected', selectedContact.book?._id)}
                          >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="me-2">
                              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                            </svg>
                            Reject
                          </button>
                          <button 
                            className="btn btn-light"
                            onClick={() => handleViewRequestDetails(selectedContact)}
                          >
                            View Request Details
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-light"
                            onClick={() => handleViewRequestDetails(selectedContact)}
                          >
                            View Request Details
                          </button>
                          {selectedContact.status === 'accepted' && (
                            <button className="btn btn-outline-primary">Contact for Exchange</button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="messages-area p-4">
                <div className="text-center mb-4">
                  <small className="text-muted">Today</small>
                </div>
                
                {messages[selectedChat]?.map((msg) => (
                  <div key={String(msg.id)} className={`d-flex mb-3 ${msg.sender === 'me' ? 'justify-content-end' : 'justify-content-start'}`}>
                    {msg.sender === 'other' && (
                      <img src={selectedContact?.avatar || 'https://i.pravatar.cc/150?img=1'} alt="" className="rounded-circle me-2 message-avatar" width="40" height="40" />
                    )}
                    <div className="message-bubble">
                      <div className={`p-3 rounded ${msg.sender === 'me' ? 'message-sent' : 'message-received'}`}>
                        <p className="mb-0">{String(msg.text || '')}</p>
                      </div>
                      <small className={`text-muted d-block mt-1 ${msg.sender === 'me' ? 'text-end' : ''}`}>{String(msg.time || '')}</small>
                    </div>
                    {msg.sender === 'me' && (
                      <img src={`https://i.pravatar.cc/150?u=${user?.email}`} alt="" className="rounded-circle ms-2 message-avatar" width="40" height="40" />
                    )}
                  </div>
                )) || []}
              </div>

              <div className="message-input-container p-3">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control message-input py-3"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button className="btn attach-button">
                    <svg className="icon-button" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
                      <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                  </button>
                  <button
                    className="btn btn-success ms-2 send-button"
                    onClick={handleSendMessage}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Chat Detail View */}
        {isMobile && showChatDetail && (
          <div className="mobile-chat-view">
            <div className="chat-header d-flex align-items-center" style={{ padding: '12px 16px', minHeight: '70px' }}>
              <button 
                className="mobile-back-button me-2 flex-shrink-0"
                onClick={handleBackToContacts}
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                </svg>
                Back
              </button>
              
              <img src={selectedContact?.avatar} alt={selectedContact?.name} className="rounded-circle me-3 flex-shrink-0" width="44" height="44" />
              
              <div className="mobile-header-info flex-grow-1 min-width-0">
                <h5 className="mobile-header-name text-truncate">{selectedContact?.name}</h5>
                <small className="text-success mobile-header-status">Online</small>
              </div>
              
              <div className="mobile-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <button type="button" className="mobile-action-btn" title="Call" style={{ 
                  width: '40px', 
                  height: '40px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: '50%', 
                  backgroundColor: '#f8f9fa', 
                  border: '1px solid #dee2e6',
                  padding: '0'
                }}>
                  <svg width="18" height="18" fill="#6c757d" viewBox="0 0 16 16">
                    <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.22 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
                  </svg>
                </button>
                <button type="button" className="mobile-action-btn" title="More options" style={{ 
                  width: '40px', 
                  height: '40px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: '50%', 
                  backgroundColor: '#f8f9fa', 
                  border: '1px solid #dee2e6',
                  padding: '0'
                }}>
                  <svg width="18" height="18" fill="#6c757d" viewBox="0 0 16 16">
                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                  </svg>
                </button>
              </div>
            </div>

            {selectedContact && selectedContact.requestId && selectedContact.isOwner && (
              <div className={`${
                selectedContact.status === 'pending' ? 'request-banner' : 
                selectedContact.status === 'accepted' ? 'request-banner-accepted' : 
                'request-banner-rejected'
              }`} style={{ margin: '12px 16px', padding: '16px', borderRadius: '12px' }}>
                <div className="d-flex align-items-start">
                  <svg width="20" height="20" fill={
                    selectedContact.status === 'pending' ? '#f59e0b' :
                    selectedContact.status === 'accepted' ? '#10b981' :
                    '#ef4444'
                  } viewBox="0 0 16 16" className="me-3 mt-1 flex-shrink-0">
                    {selectedContact.status === 'pending' && (
                      <>
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                      </>
                    )}
                    {selectedContact.status === 'accepted' && (
                      <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                    )}
                    {selectedContact.status === 'rejected' && (
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    )}
                  </svg>
                  <div className="flex-grow-1">
                    <h6 className="mb-2 fw-bold request-title" style={{ 
                      fontSize: '16px', 
                      color: selectedContact.status === 'pending' ? '#92400e' :
                             selectedContact.status === 'accepted' ? '#065f46' :
                             '#991b1b'
                    }}>
                      {selectedContact.status === 'pending' ? 'Book Exchange Request' :
                       selectedContact.status === 'accepted' ? 'Request Accepted' :
                       'Request Rejected'}
                    </h6>
                    <p className="mb-3 request-text" style={{ 
                      fontSize: '14px', 
                      color: selectedContact.status === 'pending' ? '#92400e' :
                             selectedContact.status === 'accepted' ? '#065f46' :
                             '#991b1b'
                    }}>
                      {selectedContact.status === 'pending' ? 
                        `${selectedContact.name} wants to exchange for "${selectedContact.book?.title}".` :
                       selectedContact.status === 'accepted' ? 
                        `You accepted ${selectedContact.name}'s request for "${selectedContact.book?.title}".` :
                        `You rejected ${selectedContact.name}'s request for "${selectedContact.book?.title}".`
                      }
                    </p>
                    {selectedContact.status === 'pending' ? (
                      <div className="d-flex flex-column gap-2">
                        <button 
                          className="btn btn-success d-flex align-items-center justify-content-center" 
                          style={{ padding: '12px', fontSize: '14px' }}
                          onClick={() => handleRequestAction(selectedContact.requestId, 'accepted', selectedContact.book?._id)}
                        >
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="me-2">
                            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                          </svg>
                          Approve Request
                        </button>
                        <button 
                          className="btn btn-danger d-flex align-items-center justify-content-center" 
                          style={{ padding: '12px', fontSize: '14px' }}
                          onClick={() => handleRequestAction(selectedContact.requestId, 'rejected', selectedContact.book?._id)}
                        >
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="me-2">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                          </svg>
                          Reject
                        </button>
                        <button 
                          className="btn btn-light" 
                          style={{ padding: '12px', fontSize: '14px' }}
                          onClick={() => handleViewRequestDetails(selectedContact)}
                        >
                          View Request Details
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-2">
                        <button 
                          className="btn btn-light" 
                          style={{ padding: '12px', fontSize: '14px' }}
                          onClick={() => handleViewRequestDetails(selectedContact)}
                        >
                          View Request Details
                        </button>
                        {selectedContact.status === 'accepted' && (
                          <button className="btn btn-outline-primary" style={{ padding: '12px', fontSize: '14px' }}>Contact for Exchange</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="messages-area flex-grow-1" style={{ backgroundColor: '#fafafa', padding: '16px 12px' }}>
              <div className="text-center mb-4">
                <small className="text-muted">Today</small>
              </div>
              
              {messages[selectedChat]?.map((msg) => (
                <div key={String(msg.id)} className={`d-flex mb-3 ${msg.sender === 'me' ? 'justify-content-end' : 'justify-content-start'}`}>
                  {msg.sender === 'other' && (
                    <img src={selectedContact?.avatar || 'https://i.pravatar.cc/150?img=1'} alt="" className="rounded-circle me-2 message-avatar" width="36" height="36" />
                  )}
                  <div className="message-bubble">
                    <div className={`p-3 rounded ${msg.sender === 'me' ? 'message-sent' : 'message-received'}`} style={{ fontSize: '15px', lineHeight: '1.4' }}>
                      <p className="mb-0">{String(msg.text || '')}</p>
                    </div>
                    <small className={`text-muted d-block mt-1 ${msg.sender === 'me' ? 'text-end' : ''}`} style={{ fontSize: '12px' }}>{String(msg.time || '')}</small>
                  </div>
                  {msg.sender === 'me' && (
                    <img src={`https://i.pravatar.cc/150?u=${user?.email}`} alt="" className="rounded-circle ms-2 message-avatar" width="36" height="36" />
                  )}
                </div>
              )) || []}
            </div>

            <div className="message-input-container border-top" style={{ padding: '12px 16px' }}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control message-input"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  style={{ padding: '12px 16px', fontSize: '16px', border: '1px solid #dee2e6', borderRadius: '24px 0 0 24px' }}
                />
                <button className="btn attach-button" style={{ padding: '12px', border: '1px solid #dee2e6', borderLeft: 0, borderRight: 0 }}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
                    <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/>
                  </svg>
                </button>
                <button
                  className="btn btn-success send-button"
                  onClick={handleSendMessage}
                  style={{ padding: '12px 20px', fontSize: '14px', fontWeight: '600', borderRadius: '0 24px 24px 0' }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {showRequestModal && selectedRequestDetails && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={handleCloseRequestModal}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Book Request Details</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseRequestModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {/* Book Information */}
                  <div className="col-md-4">
                    <div className="text-center mb-3">
                      <img 
                        src={selectedRequestDetails.book?.image || 'https://via.placeholder.com/200x300?text=No+Image'} 
                        alt={selectedRequestDetails.book?.title || 'Book cover'}
                        className="img-fluid rounded"
                        style={{ maxHeight: '250px', objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                  
                  {/* Request Details */}
                  <div className="col-md-8">
                    <div className="mb-3">
                      <h6 className="text-muted mb-1">Book Title</h6>
                      <h5 className="mb-0">{selectedRequestDetails.book?.title || 'N/A'}</h5>
                    </div>
                    
                    <div className="mb-3">
                      <h6 className="text-muted mb-1">Author</h6>
                      <p className="mb-0">{selectedRequestDetails.book?.author || 'N/A'}</p>
                    </div>
                    
                    <div className="mb-3">
                      <h6 className="text-muted mb-1">Book Owner</h6>
                      <div className="d-flex align-items-center">
                        <img 
                          src={selectedRequestDetails.book?.owner?.avatar || `https://i.pravatar.cc/150?u=${selectedRequestDetails.book?.owner?.email}`}
                          alt={selectedRequestDetails.book?.owner?.name}
                          className="rounded-circle me-2"
                          width="40"
                          height="40"
                        />
                        <div>
                          <p className="mb-0 fw-medium">{selectedRequestDetails.book?.owner?.name || 'N/A'}</p>
                          <small className="text-muted">{selectedRequestDetails.book?.owner?.email || 'N/A'}</small>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h6 className="text-muted mb-1">Requester</h6>
                      <div className="d-flex align-items-center">
                        <img 
                          src={selectedRequestDetails.avatar || `https://i.pravatar.cc/150?u=${selectedRequestDetails.email}`}
                          alt={selectedRequestDetails.name}
                          className="rounded-circle me-2"
                          width="40"
                          height="40"
                        />
                        <div>
                          <p className="mb-0 fw-medium">{selectedRequestDetails.name || 'N/A'}</p>
                          <small className="text-muted">{selectedRequestDetails.email || 'N/A'}</small>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h6 className="text-muted mb-1">Request Status</h6>
                      {getStatusBadge(selectedRequestDetails.status)}
                    </div>
                    
                    <div className="mb-3">
                      <h6 className="text-muted mb-1">Request Date</h6>
                      <p className="mb-0">{selectedRequestDetails.date || 'N/A'}</p>
                    </div>
                    
                    {selectedRequestDetails.message && (
                      <div className="mb-3">
                        <h6 className="text-muted mb-1">Request Message</h6>
                        <p className="mb-0 p-3 bg-light rounded">{selectedRequestDetails.message}</p>
                      </div>
                    )}
                    
                    {selectedRequestDetails.book?.description && (
                      <div className="mb-3">
                        <h6 className="text-muted mb-1">Book Description</h6>
                        <p className="mb-0 text-muted">{selectedRequestDetails.book.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseRequestModal}
                >
                  Close
                </button>
                {selectedRequestDetails.status === 'pending' && (
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-success"
                      onClick={() => {
                        handleRequestAction(selectedRequestDetails.requestId, 'accepted', selectedRequestDetails.book?._id);
                        handleCloseRequestModal();
                      }}
                    >
                      Accept Request
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => {
                        handleRequestAction(selectedRequestDetails.requestId, 'rejected', selectedRequestDetails.book?._id);
                        handleCloseRequestModal();
                      }}
                    >
                      Reject Request
                    </button>
                  </div>
                )}
                {selectedRequestDetails.status === 'accepted' && (
                  <button className="btn btn-primary">
                    Contact for Exchange
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

export default Inbox;