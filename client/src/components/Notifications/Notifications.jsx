import React, { useState, useEffect } from 'react';
import './styles/Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Sample data - replace with API calls
  useEffect(() => {
    setNotifications([
      {
        id: 1,
        type: 'request',
        message: 'John Doe requested to exchange "The Great Gatsby"',
        timestamp: '2024-05-20T10:30:00',
        read: false
      },
      {
        id: 2,
        type: 'message',
        message: 'New message from Jane Smith',
        timestamp: '2024-05-20T09:15:00',
        read: true
      }
    ]);
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications-wrapper">
      <button 
        className="notifications-trigger"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="material-icons">notifications</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notifications-dropdown">
          <h3>Notifications</h3>
          {notifications.length > 0 ? (
            <div className="notifications-list">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <span className={`notification-icon ${notification.type}`}>
                    {notification.type === 'request' ? '📚' : '✉️'}
                  </span>
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-notifications">No notifications</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;