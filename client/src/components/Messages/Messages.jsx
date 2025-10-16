import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import BookCard from '../Books/BookCard';
import './styles/Messages.css';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [showAttachment, setShowAttachment] = useState(false);
  const chatBoxRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sample data - replace with API calls
  useEffect(() => {
    setConversations([
      {
        id: 1,
        user: {
          id: 2,
          name: 'Sarah Johnson',
          username: 'sarah_j',
          email: 'sarah@example.com',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          joinedYear: '2022',
          booksShared: 12,
          booksReceived: 5
        },
        book: {
          id: 1,
          title: 'The Secret Garden',
          author: 'Frances Hodgson Burnett',
          cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
          condition: 'Good',
          edition: '2nd Edition',
          language: 'English',
          genre: 'Classic Literature',
          status: 'AVAILABLE'
        },
        messages: [
          {
            id: 1,
            senderId: 2,
            text: "Hi Alex, I'm interested in your copy of 'The Secret Garden'. Is it still available?",
            timestamp: '2024-09-16T10:30:00'
          },
          {
            id: 2,
            senderId: 1,
            text: "Hi Sarah, yes it is! Are you available to meet up this week?",
            timestamp: '2024-09-16T11:45:00'
          },
          {
            id: 3,
            senderId: 2,
            text: "Yes, I am. How about Wednesday evening?",
            timestamp: '2024-09-16T14:20:00'
          },
          {
            id: 4,
            senderId: 1,
            text: "Wednesday works for me. Let's meet at the Central Library at 6 PM?",
            timestamp: '2024-09-16T14:35:00'
          },
          {
            id: 5,
            senderId: 2,
            text: "Perfect, see you then!",
            timestamp: '2024-09-16T14:40:00'
          }
        ],
        unread: false,
        lastMessageTime: '2024-09-16T14:40:00'
      },
      {
        id: 2,
        user: {
          id: 3,
          name: 'Mike Chen',
          username: 'mike_c',
          email: 'mike@example.com',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          joinedYear: '2023',
          booksShared: 8,
          booksReceived: 3
        },
        book: {
          id: 2,
          title: '1984',
          author: 'George Orwell',
          cover: 'https://images.unsplash.com/photo-1541963463532-d68292c34d19?w=300&h=400&fit=crop',
          condition: 'Excellent',
          edition: '1st Edition',
          language: 'English',
          genre: 'Dystopian Fiction',
          status: 'REQUESTED'
        },
        messages: [
          {
            id: 1,
            senderId: 3,
            text: "Hello! I saw your request for '1984'. I have a copy I'd be willing to exchange.",
            timestamp: '2024-09-15T16:20:00'
          }
        ],
        unread: true,
        lastMessageTime: '2024-09-15T16:20:00'
      }
    ]);
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      senderId: 1, // Current user ID
      text: message,
      timestamp: new Date().toISOString()
    };

    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeChat
          ? { 
              ...conv, 
              messages: [...conv.messages, newMessage],
              unread: false,
              lastMessageTime: newMessage.timestamp
            }
          : conv
      )
    );

    setMessage('');
    // TODO: Send message to backend
  };

  const handleAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // TODO: Handle file upload
      console.log('File selected:', file);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [activeChat, conversations]);

  const activeConversation = conversations.find(c => c.id === activeChat);

  return (
    <div className="messages-layout">
      {/* Conversations Panel */}
      <div className="conversations-panel">
        <div className="conversations-header">
          <h2>Conversations</h2>
        </div>
        <div className="conversations-list">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`conversation-item ${activeChat === conv.id ? 'active' : ''} ${conv.unread ? 'unread' : ''}`}
              onClick={() => setActiveChat(conv.id)}
            >
              <div className="conversation-avatar">
                <img src={conv.user.avatar} alt={conv.user.name} />
                {conv.unread && <div className="unread-indicator"></div>}
              </div>
              <div className="conversation-content">
                <div className="conversation-top">
                  <h3 className="user-name">{conv.user.name}</h3>
                  <span className="last-time">{formatTimestamp(conv.lastMessageTime)}</span>
                </div>
                <p className="book-title">{conv.book.title}</p>
                <p className="last-message">
                  {conv.messages[conv.messages.length - 1]?.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {activeChat ? (
          <>
            <div className="chat-header">
              <div className="chat-user-info">
                <img src={activeConversation?.user.avatar} alt="User avatar" />
                <div>
                  <h3>Conversation with {activeConversation?.user.name}</h3>
                  <p className="chat-status">Active now</p>
                </div>
              </div>
            </div>

            <div className="chat-messages" ref={chatBoxRef}>
              {activeConversation?.messages.map((msg, index) => {
                const isCurrentUser = msg.senderId === 1;
                const showAvatar = index === 0 || 
                  activeConversation.messages[index - 1].senderId !== msg.senderId;
                
                return (
                  <div
                    key={msg.id}
                    className={`message-wrapper ${isCurrentUser ? 'sent' : 'received'}`}
                  >
                    {!isCurrentUser && showAvatar && (
                      <img 
                        src={activeConversation.user.avatar} 
                        alt="" 
                        className="message-avatar"
                      />
                    )}
                    <div className={`message-bubble ${isCurrentUser ? 'current-user' : 'other-user'}`}>
                      <p>{msg.text}</p>
                      <span className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="message-input-container">
              <form onSubmit={handleSendMessage} className="message-input-form">
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <button
                    type="button"
                    onClick={handleAttachment}
                    className="attachment-btn"
                    title="Attach file"
                  >
                    📎
                  </button>
                </div>
                <button 
                  type="submit" 
                  className="send-btn"
                  disabled={!message.trim()}
                >
                  ➤
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-content">
              <div className="no-chat-icon">💬</div>
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar - Book & User Details */}
      {activeChat && (
        <div className="details-sidebar">
          <div className="book-details-section">
            <h3>Book Details</h3>
            <div className="book-card">
              <div className="book-status">
                <span className={`status-badge ${activeConversation?.book.status.toLowerCase()}`}>
                  {activeConversation?.book.status}
                </span>
              </div>
              <img 
                src={activeConversation?.book.cover} 
                alt={activeConversation?.book.title}
                className="book-cover"
              />
              <div className="book-info">
                <h4>{activeConversation?.book.title}</h4>
                <p className="book-author">{activeConversation?.book.author}</p>
                <div className="book-metadata">
                  <div className="metadata-item">
                    <span className="label">Condition:</span>
                    <span className="value">{activeConversation?.book.condition}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="label">Edition:</span>
                    <span className="value">{activeConversation?.book.edition}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="label">Language:</span>
                    <span className="value">{activeConversation?.book.language}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="label">Genre:</span>
                    <span className="value">{activeConversation?.book.genre}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="user-details-section">
            <h3>User Details</h3>
            <div className="user-profile-card">
              <img 
                src={activeConversation?.user.avatar} 
                alt={activeConversation?.user.name}
                className="profile-avatar"
              />
              <h4>{activeConversation?.user.name}</h4>
              <p className="join-date">Joined {activeConversation?.user.joinedYear}</p>
              <div className="user-stats">
                <div className="stat-item">
                  <span className="stat-number">{activeConversation?.user.booksShared}</span>
                  <span className="stat-label">Books Shared</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{activeConversation?.user.booksReceived}</span>
                  <span className="stat-label">Books Received</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;