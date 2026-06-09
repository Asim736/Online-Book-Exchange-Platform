import express from 'express';
import { login, register, verifyEmail, forgotPassword, resetPassword, validateToken } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Email verification
router.get('/verify-email', verifyEmail);

// Forgot / reset password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Token validation
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

// Verify route is registered
console.log('[ROUTES] Auth routes registered: GET /verify-email, POST /forgot-password, POST /reset-password');