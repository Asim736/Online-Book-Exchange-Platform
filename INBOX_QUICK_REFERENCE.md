# Inbox Component - Quick Reference Guide

## Component Overview

The Inbox component is a modern messaging interface built with React and Bootstrap 5.3, featuring a WhatsApp/Telegram-style layout with contact list and chat area.

---

## Quick Start

### Import and Use:
```javascript
import Inbox from './components/Inbox/Inbox';

function App() {
  return <Inbox />;
}
```

### Requirements:
- React 17+
- AuthContext for user authentication
- API_BASE_URL constant from config

---

## Component Props

**No props required** - Component is self-contained and uses context for authentication.

---

## State Variables

| Variable | Type | Initial Value | Purpose |
|----------|------|---------------|---------|
| `selectedChat` | string | 'sarah' | Currently active chat ID |
| `message` | string | '' | Current input message |
| `conversations` | object | {...} | All chat messages |
| `incomingRequests` | array | [] | Incoming book requests |
| `outgoingRequests` | array | [] | Outgoing book requests |
| `requestsLoading` | boolean | false | Request fetch status |
| `messagesLoading` | boolean | false | Messages fetch status |

---

## Key Functions

### `handleSendMessage()`
Sends a new message in the current chat.
```javascript
// Usage: Called on Send button click or Enter key
// Updates: conversations state
// Returns: void
```

### `getStatusBadge(status)`
Returns appropriate badge component for request status.
```javascript
// Parameters: status ('pending' | 'accepted' | 'rejected')
// Returns: JSX.Element (Bootstrap badge)
```

### `handleRequestAction(requestId, newStatus, bookId)`
Handles approve/reject actions on book requests.
```javascript
// Parameters: requestId, newStatus ('approved'|'rejected'), bookId
// Makes: PATCH request to API
// Updates: incomingRequests state
```

---

## Data Structures

### Contact Object:
```javascript
{
  id: string,           // Unique identifier
  name: string,         // Display name
  message: string,      // Last message preview
  time: string,         // Last message time
  status: string|null,  // 'online'|'pending'|'accepted'|'rejected'
  avatar: string,       // Avatar URL
  unread: number        // Unread count (optional)
}
```

### Message Object:
```javascript
{
  id: number,           // Unique identifier
  sender: string,       // 'me' or 'other'
  text: string,         // Message content
  time: string          // Formatted time (e.g., '10:32 AM')
}
```

---

## Styling Classes

### Bootstrap Utilities:
```css
/* Layout */
.container-fluid, .row, .col-md-4, .col-lg-3

/* Flexbox */
.d-flex, .align-items-center, .justify-content-between

/* Spacing */
.p-3, .p-4, .mb-2, .me-3, .ms-2

/* Components */
.btn, .btn-success, .btn-danger, .badge, .rounded-circle

/* Typography */
.fw-bold, .text-muted, .text-success, .small
```

### Custom Classes:
```css
/* Main containers */
.app-container        // Full-height app wrapper
.sidebar              // Left contacts sidebar
.chat-container       // Right chat area

/* Contact list */
.contact-item         // Individual contact item
.contact-item.active  // Selected contact
.online-indicator     // Green online dot
.unread-badge         // Unread message count

/* Messages */
.messages-area        // Scrollable messages container
.message-bubble       // Message wrapper
.message-sent         // Sent message (green)
.message-received     // Received message (white)
.message-avatar       // Message avatar

/* Request banner */
.request-banner       // Yellow notification banner
.request-title        // Banner heading
.request-text         // Banner text

/* Input */
.message-input        // Message input field
.attach-button        // Attachment button
.send-button          // Send message button
```

---

## Events and Interactions

### Contact Selection:
```javascript
onClick={() => setSelectedChat(contact.id)}
// Switches active chat when contact is clicked
```

### Message Sending:
```javascript
// Method 1: Click Send button
onClick={handleSendMessage}

// Method 2: Press Enter key
onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
```

### Request Actions:
```javascript
// Show banner when selectedChat === 'alex'
{selectedChat === 'alex' && <RequestBanner />}
```

---

## Conditional Rendering

### Request Banner:
```javascript
// Only shows when Alex chat is selected
{selectedChat === 'alex' && (
  <div className="request-banner">
    {/* Banner content */}
  </div>
)}
```

### Online Indicator:
```javascript
// Only shows when contact.status === 'online'
{contact.status === 'online' && (
  <span className="online-indicator bg-success rounded-circle"></span>
)}
```

### Unread Badge:
```javascript
// Only shows when contact.unread exists
{contact.unread && (
  <span className="badge bg-success rounded-circle">{contact.unread}</span>
)}
```

### Status Badges:
```javascript
// Shows for contacts with status
{contact.status && <div>{getStatusBadge(contact.status)}</div>}
```

---

## Responsive Behavior

### Desktop (> 768px):
- **Sidebar**: 33.33% width (col-md-4)
- **Chat**: 66.67% width (col-md-8)
- **Layout**: Side-by-side
- **Message bubbles**: Max 60% width

### Tablet (768px):
- **Sidebar**: 25% width (col-lg-3)
- **Chat**: 75% width (col-lg-9)
- **Layout**: Side-by-side
- **Height**: Full viewport

### Mobile (< 768px):
- **Sidebar**: 100% width (stacks above)
- **Chat**: 100% width (stacks below)
- **Layout**: Vertical stack
- **Message bubbles**: Max 80% width
- **Height**: Auto (scrollable)

---

## API Integration Points

### Fetch Requests:
```javascript
// Endpoint: GET /requests/owner/:userId
// Headers: { Authorization: 'Bearer <token>' }
// Updates: incomingRequests state
```

### Update Request Status:
```javascript
// Endpoint: PATCH /requests/:requestId
// Body: { status: 'approved' | 'rejected' }
// Headers: { Authorization: 'Bearer <token>' }
// Updates: Local state
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Send message |
| Escape | (Not implemented) |
| ↑/↓ | (Not implemented - could navigate contacts) |

---

## Accessibility Features

✅ **Implemented:**
- Semantic HTML structure
- Alt text on images
- Keyboard navigation (Enter to send)
- Clear focus states
- Color contrast compliance

⚠️ **To Add:**
- ARIA labels for icon buttons
- Role attributes for custom components
- Keyboard navigation for contact list
- Screen reader announcements

---

## Performance Considerations

### Optimizations:
- ✅ CDN for Bootstrap (cached)
- ✅ Inline styles (no separate CSS file)
- ✅ Conditional rendering (request banner)

### Potential Improvements:
- Virtual scrolling for long message lists
- Lazy loading contact avatars
- Debounced search input
- Memoized contact list

---

## Common Customizations

### Change Primary Color:
```css
/* In <style> tag */
.message-sent {
  background-color: #007bff; /* Change from #28a745 */
}

.btn-success {
  background-color: #007bff; /* Override Bootstrap */
}
```

### Add Dark Mode:
```css
@media (prefers-color-scheme: dark) {
  .app-container {
    background-color: #1a1a1a;
  }
  .sidebar, .chat-container {
    background-color: #2d2d2d;
    color: #ffffff;
  }
}
```

### Customize Avatar Size:
```javascript
// In contact list
<img src={contact.avatar} width="60" height="60" /> {/* Change from 50 */}

// In chat header
<img src={selectedContact?.avatar} width="60" height="60" /> {/* Change from 50 */}
```

---

## Troubleshooting

### Issue: Bootstrap styles not loading
**Solution:** Check internet connection for CDN access

### Issue: Messages not sending
**Solution:** Verify `selectedChat` is set and `message` is not empty

### Issue: Request banner not showing
**Solution:** Ensure `selectedChat === 'alex'`

### Issue: Contacts not clickable
**Solution:** Check `onClick` handler is attached to contact-item

### Issue: Responsive layout broken
**Solution:** Verify Bootstrap grid classes (col-md-*, col-lg-*)

---

## Testing Examples

### Unit Tests:
```javascript
// Test message sending
test('sends message when Send clicked', () => {
  const { getByPlaceholderText, getByText } = render(<Inbox />);
  const input = getByPlaceholderText('Type your message...');
  const sendBtn = getByText('Send');
  
  fireEvent.change(input, { target: { value: 'Hello' } });
  fireEvent.click(sendBtn);
  
  expect(input.value).toBe('');
});

// Test contact selection
test('selects contact when clicked', () => {
  const { getByText } = render(<Inbox />);
  const contact = getByText('Alex Ray');
  
  fireEvent.click(contact);
  
  expect(/* selectedChat updated */).toBeTruthy();
});
```

### Integration Tests:
```javascript
// Test request approval
test('approves request when button clicked', async () => {
  const { getByText } = render(<Inbox />);
  
  // Select Alex chat
  fireEvent.click(getByText('Alex Ray'));
  
  // Click approve
  const approveBtn = getByText('Approve Request');
  fireEvent.click(approveBtn);
  
  // Wait for API call
  await waitFor(() => {
    expect(/* request approved */).toBeTruthy();
  });
});
```

---

## Component Tree

```
<Inbox>
  ├─ <link> Bootstrap CDN
  ├─ <style> Inline CSS
  └─ <div.app-container>
      └─ <div.container-fluid>
          └─ <div.row>
              ├─ <div.sidebar>
              │   ├─ <h4> Inbox
              │   ├─ <input> Search
              │   └─ <div.contact-item> × 5
              │       ├─ <img> Avatar
              │       ├─ <div> Name + Time
              │       ├─ <span> Online indicator
              │       ├─ <span> Unread badge
              │       └─ <span> Status badge
              └─ <div.chat-container>
                  ├─ <div.chat-header>
                  │   ├─ <img> Avatar
                  │   ├─ <div> Name + Status
                  │   └─ <div> Action buttons
                  ├─ <div.request-banner> (conditional)
                  │   ├─ <svg> Warning icon
                  │   ├─ <h6> Title
                  │   ├─ <p> Description
                  │   └─ <div> Action buttons
                  ├─ <div.messages-area>
                  │   ├─ <div> Date divider
                  │   └─ <div.message-group> × N
                  │       ├─ <img> Avatar
                  │       ├─ <div.message-bubble>
                  │       └─ <small> Timestamp
                  └─ <div.message-input-container>
                      └─ <div.input-group>
                          ├─ <input> Message
                          ├─ <button> Attach
                          └─ <button> Send
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.0 | Oct 8, 2025 | Bootstrap migration |
| 2.0 | Oct 8, 2025 | CSS redesign |
| 1.0 | - | Initial version |

---

## Resources

- [Bootstrap 5.3 Docs](https://getbootstrap.com/docs/5.3/)
- [React Docs](https://react.dev/)
- [Bootstrap Icons](https://icons.getbootstrap.com/)

---

**Status:** ✅ Production Ready
**Maintained By:** Development Team
**Last Review:** October 8, 2025
