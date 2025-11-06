import express from 'express';
const router = express.Router();
import { authenticateToken } from '../middleware/auth.js';
import { 
    getAllBooks, 
    getBookById, 
    createBook, 
    updateBook, 
    deleteBook,
    getUserBooks,
    getBooksByIds
} from '../controllers/bookController.js';
import { upload } from '../middleware/upload.js';
// Bulk fetch books by IDs (for wishlist)
router.post('/bulk', getBooksByIds);

// Public routes
router.get('/', getAllBooks);

// Protected routes (specific routes must come before parameterized routes)
router.get('/my-books', authenticateToken, getUserBooks);

// Public parameterized routes (must come before auth middleware to remain public)
router.get('/:id', getBookById);

// Apply auth middleware for remaining protected routes
router.use(authenticateToken);
// Create with multipart upload: field name 'images'
router.post('/', upload.array('images', 3), createBook);
// Update can also accept additional images
router.put('/:id', upload.array('images', 3), updateBook);
router.delete('/:id', deleteBook);

export default router;