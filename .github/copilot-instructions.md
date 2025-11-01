# Book Exchange Platform - AI Coding Instructions

## Architecture Overview

This is a **MERN stack** application with a clear client-server separation:
- **Frontend**: React 18 + Vite (client/) → Deployed on AWS Amplify
- **Backend**: Node.js + Express (server/) → Deployed on AWS EC2
- **Database**: MongoDB via Mongoose ODM

## Critical Development Patterns

### 1. Dual-Mode Development System
The app supports **frontend-only mode** for UI development without a running backend:
- Controlled via `VITE_FRONTEND_ONLY` env var in `client/src/config/constants.js`
- `AuthContext.jsx` includes backend availability checks that gracefully clear auth state when server is unreachable
- Never bypass these checks - they prevent misleading auth states during development

### 2. Authentication Flow
- **JWT-based** auth stored in localStorage (`token` + serialized `user` object)
- `AuthContext` (`client/src/contexts/AuthContext.jsx`) provides: `token`, `user`, `isAuthenticated`, `login()`, `logout()`
- All components use `useAuth()` hook - never access localStorage directly
- Protected routes use `PrivateRoute.jsx` wrapper component
- Backend middleware: `server/middleware/auth.js` validates JWT and attaches `req.user`

### 3. API Configuration
**IMPORTANT**: The codebase is transitioning from axios to fetch + constants approach:
- **Legacy (3 files only)**: `client/src/config/axios.js` - hardcoded `localhost:5001/api`
  - Only used in: `TestAuth.jsx`, `UserProfile.jsx`, `SignUp.jsx`
  - **DO NOT use for new code** - breaks in production and frontend-only mode
- **Modern (everywhere else)**: `fetch()` + `API_BASE_URL` from `client/src/config/constants.js`
  - Used in: Login, BookList, BookDetail, BookUpload, Inbox, BookRequests, WishList, etc.
  - Supports environment-based URLs via `VITE_API_URL`
  - Works with MongoDB Atlas and AWS EC2 deployment
  - Compatible with frontend-only development mode

**Migration recommendation**: Replace axios imports with fetch + API_BASE_URL pattern:
```javascript
// OLD (don't use)
import axios from '../../config/axios';
const response = await axios.get('/books');

// NEW (use this)
import { API_BASE_URL } from '../../config/constants.js';
const response = await fetch(`${API_BASE_URL}/books`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```
- Vite proxy configured in `vite.config.js` for `/api` routes in development

### 4. Mongoose Model Architecture
- Models live in `server/models/` with ES6 exports (`export default`)
- Key relationships:
  - `Book.owner` → `User._id` (required, populated with username/avatar)
  - **Request Model**: Simple book interest requests (one-way: `requester` → `book` owner)
    - Used for: Initial interest in a book, no book offered in return yet
    - Fields: `book`, `requester`, `owner`, `message`, `status` (pending/accepted/rejected)
  - **Exchange Model**: Formal book-for-book exchanges (two-way)
    - Used for: Actual exchange negotiations with specific books from both parties
    - Fields: `requestor`, `owner`, `requestedBook`, `offeredBook`, `status` (pending/accepted/rejected/completed)
    - Additional `completed` status for finalized exchanges
- Book status enum: `'available' | 'exchanged' | 'unavailable'`
- Always use `.populate('owner', 'username email avatar bio')` when fetching books for display

### 5. Component Organization
```
client/src/components/
├── Auth/           # Login, SignUp, ForgotPassword, PrivateRoute
├── Books/          # BookCard, BookDetail, BookList, BookUpload, BookRequests, WishList
├── common/         # AutoCompleteInput, CustomSelect, ErrorBoundary, LoadingSpinner, SkeletonCard
├── Home/           # HomePage
├── Inbox/          # Inbox - Main messaging interface (special layout - no Footer)
├── Layout/         # Header, Footer, SearchBar
├── Notifications/  # Notifications
└── Profile/        # UserProfile
```
- Each component folder has dedicated `styles/` subdirectory with matching CSS file
- Use lazy loading with `React.lazy()` in `App.jsx` for code splitting
- Wrap routes with `<div className="container">` EXCEPT `/inbox` (custom layout)
- **Note**: All messaging functionality is in `Inbox/` - no separate Messages component

### 6. Server Controller Patterns
- Controllers in `server/controllers/` follow async/await with try-catch
- Standard error response: `res.status(500).json({ message: 'Error...', error: error.message })`
- Use `req.user` for authenticated user (set by auth middleware)
- Book queries default to `filter.status = 'available'` unless explicitly querying all statuses
- Pagination pattern: `page`, `limit`, `skip` query params → return `{ books, total, page, pages }`

### 7. Environment Variables
**Server (.env):**
```env
MONGODB_URI=<mongodb-connection-string>
JWT_SECRET=<secret-key>
PORT=5001
NODE_ENV=development|production
CORS_ORIGINS=<comma-separated-origins>
```

**Client (Vite env vars):**
- `VITE_API_URL` - Backend API base URL
- `VITE_FRONTEND_ONLY` - Enable frontend-only mode (`'true'` as string)

### 8. Development Commands
```bash
# Start backend (with auto-reload)
cd server && npm run dev              # Uses nodemon, port 5001

# Start frontend
cd client && npm run dev              # Vite dev server, port 5173

# Production build
cd client && npm run build            # Outputs to client/dist/
```

## Common Gotchas

1. **Module System**: Server uses ES6 modules (`"type": "module"` in package.json) - use `import/export`, not `require`
2. **Image Storage**: Currently using base64 strings in MongoDB (`Book.images` array and `User.avatar`)
   - Express configured with 50MB payload limit in `server/index.js`
   - **⚠️ CRITICAL**: MongoDB Atlas free tier = 512MB limit. Base64 images (~2MB/book) = ~256 books max!
   - **MUST migrate to AWS S3** for production to avoid storage limits
   - When implementing S3: Use `multer-s3` for uploads, store S3 URLs in MongoDB instead of base64
   - S3 benefits: First 5GB free (12 months), then $0.023/GB/month, unlimited scalability
   - S3 aligns with existing AWS deployment (Amplify + EC2)
3. **Route Naming**: SignUp route is `/signup` (lowercase, no hyphen) - matches both route definition and component imports
4. **CORS Configuration**: Dynamic based on NODE_ENV - add origins to `CORS_ORIGINS` env var for production
5. **Footer Conditional**: `App.jsx` checks `location.pathname === '/inbox'` to hide footer - extend this pattern for other special layouts
6. **MongoDB Connection**: Error in `server/config/db.js` uses CommonJS but `server/index.js` uses inline Mongoose connection - index.js is the active pattern

## AWS Deployment Notes

- Frontend: AWS Amplify auto-builds from `client/` using `amplify.yml`
- Backend: EC2 with PM2 process manager (`aws/ecosystem.config.js`)
- Reference `guide/AWS_DEPLOYMENT_GUIDE.md` for full infrastructure setup
- Security groups must allow port 5001 for backend API access

## Testing & Debugging

- Test auth endpoint exists: `POST /api/test-user` (creates/returns test user)
- Health check: `GET /api/health` returns server status
- Backend logs all requests with timestamp via middleware in `server/index.js`
- Frontend performance monitoring utilities in `client/src/utils/performance.js`

## Inbox/Messaging System

**Fully implemented and actively used** - conversation-based messaging between users:

### Architecture:
- **Inbox Component** (`client/src/components/Inbox/Inbox.jsx`): Main messaging interface (~1300 lines)
  - Custom layout: No footer (handled in `App.jsx` via `location.pathname === '/inbox'` check)
  - Mobile-responsive with separate chat detail view on small screens
  - Pagination for conversations and requests
  - Real-time status updates for book requests
  
- **Backend Routes**:
  - `GET /api/requests/conversations/:userId` - Fetch grouped conversations by participant
  - `GET /api/requests/owner/:userId` - Incoming book requests (paginated)
  - `GET /api/requests/user/:userId` - Outgoing book requests
  - `PUT /api/requests/:id` - Update request status (accept/reject)

### Key Patterns:
- Conversations are **request-based** (not standalone messages) - grouped by participant
- Uses Request model to track conversation history
- `getConversationsForUser()` in `requestController.js` groups requests by participant
- Inbox has extensive developer documentation in `guide/INBOX_*.md` files
- CSS-only redesign with complete design system (colors, typography, spacing)

### Important Notes:
- **Single messaging interface**: All messaging functionality consolidated in `Inbox.jsx`
- Inbox handles requests, conversations, and status updates in a unified interface
- Route: `/inbox` (protected route, no footer)

## File Locations for Common Tasks

- Add new API route → `server/routes/*.js` + update `server/index.js` imports
- Add protected page → Create component + add route in `App.jsx` wrapped with `<PrivateRoute>`
- Modify auth logic → `client/src/contexts/AuthContext.jsx` (frontend) + `server/middleware/auth.js` (backend)
- Update Book schema → `server/models/Book.js` (remember to handle migrations)
- Add search filters → `server/controllers/bookController.js` `getAllBooks()` filter object
- Modify inbox/messaging → `client/src/components/Inbox/Inbox.jsx` + `server/controllers/requestController.js`
- Update inbox styles → `client/src/components/Inbox/styles/Inbox.css` (extensive design system documented)
