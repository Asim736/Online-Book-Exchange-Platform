import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
    getAllBooks, 
    getBookById, 
    createBook, 
    updateBook, 
    deleteBook,
    getUserBooks
} from '../controllers/bookController.js';

const router = express.Router();

// Public routes
router.get('/', getAllBooks);

// Protected routes (specific routes must come before parameterized routes)
router.get('/my-books', authenticateToken, getUserBooks);

// Public parameterized routes (must come before auth middleware to remain public)
router.get('/:id', getBookById);

// Apply auth middleware for remaining protected routes
router.use(authenticateToken);
router.post('/', createBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

export default router;