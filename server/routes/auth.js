import express from 'express';
import { login, register, validateToken } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Add the validate endpoint
router.get('/validate', authenticateToken, validateToken);

router.post('/login', login);
router.post('/register', register);

// GET /auth/login returns "Method Not Allowed"
router.get('/login', (req, res) => {
    res.status(405).json({
        error: 'Method Not Allowed',
        message: 'Use POST /api/auth/login for login',
        details: 'Send email and password as JSON body'
    });
});

export default router;