import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/constants.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import "./styles/BookRequests.css";

const BookRequests = () => {
    const { user, token } = useAuth();
    const [activeTab, setActiveTab] = useState("incoming");
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch requests based on active tab
    useEffect(() => {
        if (user?._id && token) {
            if (activeTab === "incoming") {
                fetchIncomingRequests();
            } else {
                fetchOutgoingRequests();
            }
        }
    }, [activeTab, user?._id, token]);

    const fetchIncomingRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch requests where current user is the book owner
            const response = await fetch(
                `${API_BASE_URL}/requests/owner/${user._id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (!response.ok) {
                throw new Error("Failed to fetch incoming requests");
            }
            const data = await response.json();

            // Map backend request data to shape your component expects:
            const formattedRequests = data.map((req) => ({
                id: req._id,
                bookId: req.book?._id,
                bookCover: req.book?.images?.[0] || req.book?.imageUrl || "/placeholder-book.jpg",
                bookTitle: req.book?.title || "No Title",
                bookAuthor: req.book?.author || "Unknown Author",
                requesterName: req.requester?.username || "Unknown",
                requesterEmail: req.requester?.email || "",
                requestDate: new Date(req.createdAt).toLocaleDateString(),
                message: req.message || "No message provided",
                status: req.status || "pending",
                originalRequest: req
            }));

            setIncomingRequests(formattedRequests);
        } catch (error) {
            console.error("Error fetching incoming requests:", error);
            setError("Failed to load incoming requests");
            setIncomingRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchOutgoingRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch requests where current user is the requester
            const response = await fetch(
                `${API_BASE_URL}/requests/user/${user._id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (!response.ok) {
                throw new Error("Failed to fetch outgoing requests");
            }
            const data = await response.json();

            // Map backend request data to shape your component expects:
            const formattedRequests = data.map((req) => ({
                id: req._id,
                bookId: req.book?._id,
                bookCover: req.book?.images?.[0] || req.book?.imageUrl || "/placeholder-book.jpg",
                bookTitle: req.book?.title || "No Title",
                bookAuthor: req.book?.author || "Unknown Author",
                ownerName: req.owner?.username || "Unknown",
                ownerEmail: req.owner?.email || "",
                requestDate: new Date(req.createdAt).toLocaleDateString(),
                message: req.message || "No message provided",
                status: req.status || "pending",
                originalRequest: req
            }));

            setOutgoingRequests(formattedRequests);
        } catch (error) {
            console.error("Error fetching outgoing requests:", error);
            setError("Failed to load outgoing requests");
            setOutgoingRequests([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle accept/reject action
    const onAction = async (requestId, newStatus, bookId) => {
        try {
            setLoading(true);
            
            // Update request status
            const res = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to update request");
            }

            // If accepted, also update the book status to 'reserved' or 'not available'
            if (newStatus === 'accepted' && bookId) {
                try {
                    await fetch(`${API_BASE_URL}/books/${bookId}/status`, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ status: 'reserved' }),
                    });
                } catch (bookUpdateError) {
                    console.warn("Failed to update book status:", bookUpdateError);
                    // Don't fail the whole operation if book status update fails
                }
            }

            // Update local state
            setIncomingRequests((prev) =>
                prev.map((req) => 
                    req.id === requestId 
                        ? { ...req, status: newStatus }
                        : req
                )
            );

            // Show success message
            const statusMessage = newStatus === 'accepted' ? 'accepted' : 'rejected';
            alert(`Request has been ${statusMessage} successfully!`);
            
        } catch (error) {
            console.error("Error updating request:", error);
            alert(`Failed to update request: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="requests-container">
            <div className="requests-header">
                <h1>Book Exchange Requests</h1>
                <div className="tabs">
                    <button
                        className={`tab ${
                            activeTab === "incoming" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("incoming")}
                    >
                        Incoming Requests
                    </button>
                    <button
                        className={`tab ${
                            activeTab === "outgoing" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("outgoing")}
                    >
                        Outgoing Requests
                    </button>
                </div>
            </div>

            <div className="requests-list">
                {loading ? (
                    <div className="loading-message">Loading requests...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : activeTab === "incoming" ? (
                    <IncomingRequests
                        requests={incomingRequests}
                        onAction={onAction}
                        loading={loading}
                    />
                ) : (
                    <OutgoingRequests 
                        requests={outgoingRequests}
                        loading={loading} 
                    />
                )}
            </div>
        </div>
    );
};

const IncomingRequests = ({ requests, onAction, loading }) => {
    return (
        <div className="requests-grid">
            {requests.length === 0 ? (
                <div className="no-requests-message">
                    <h3>No incoming requests</h3>
                    <p>You haven't received any book exchange requests yet.</p>
                </div>
            ) : (
                requests.map((request) => (
                    <div key={request.id} className="request-card">
                        <div className="request-book-info">
                            <img 
                                src={request.bookCover} 
                                alt={`${request.bookTitle} cover`}
                                onError={(e) => {
                                    e.target.src = "/placeholder-book.jpg";
                                }}
                            />
                            <div className="request-details">
                                <h3>{request.bookTitle}</h3>
                                <p className="book-author">By {request.bookAuthor}</p>
                                <p className="requester-info">
                                    <strong>Requested by:</strong> {request.requesterName}
                                </p>
                                {request.requesterEmail && (
                                    <p className="requester-email">
                                        Email: {request.requesterEmail}
                                    </p>
                                )}
                                <p className="request-date">
                                    Date: {request.requestDate}
                                </p>
                            </div>
                        </div>
                        
                        {request.message && (
                            <div className="request-message">
                                <strong>Message:</strong>
                                <p>"{request.message}"</p>
                            </div>
                        )}

                        {request.status === "pending" ? (
                            <div className="request-actions">
                                <button
                                    className="accept-button"
                                    onClick={() => onAction(request.id, 'accepted', request.bookId)}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Accept'}
                                </button>
                                <button
                                    className="reject-button"
                                    onClick={() => onAction(request.id, 'rejected', request.bookId)}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Reject'}
                                </button>
                            </div>
                        ) : (
                            <div className={`request-status ${request.status}`}>
                                <strong>Status:</strong> {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

const OutgoingRequests = ({ requests, loading }) => {
    return (
        <div className="requests-grid">
            {requests.length === 0 ? (
                <div className="no-requests-message">
                    <h3>No outgoing requests</h3>
                    <p>You haven't made any book exchange requests yet.</p>
                </div>
            ) : (
                requests.map((request) => (
                    <div key={request.id} className="request-card">
                        <div className="request-book-info">
                            <img 
                                src={request.bookCover} 
                                alt={`${request.bookTitle} cover`}
                                onError={(e) => {
                                    e.target.src = "/placeholder-book.jpg";
                                }}
                            />
                            <div className="request-details">
                                <h3>{request.bookTitle}</h3>
                                <p className="book-author">By {request.bookAuthor}</p>
                                <p className="owner-info">
                                    <strong>Book Owner:</strong> {request.ownerName}
                                </p>
                                {request.ownerEmail && (
                                    <p className="owner-email">
                                        Email: {request.ownerEmail}
                                    </p>
                                )}
                                <p className="request-date">
                                    Date: {request.requestDate}
                                </p>
                            </div>
                        </div>
                        
                        {request.message && (
                            <div className="request-message">
                                <strong>Your message:</strong>
                                <p>"{request.message}"</p>
                            </div>
                        )}
                        
                        <div className={`request-status ${request.status}`}>
                            <strong>Status:</strong> {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            {request.status === 'accepted' && (
                                <p className="status-note">✅ Great! The owner has accepted your request. Contact them to arrange the exchange.</p>
                            )}
                            {request.status === 'rejected' && (
                                <p className="status-note">❌ Unfortunately, this request was declined.</p>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default BookRequests;
