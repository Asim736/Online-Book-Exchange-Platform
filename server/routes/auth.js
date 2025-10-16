import express from 'express';
import { login, register, validateToken } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Add the validate endpoint
router.get('/validate', authenticateToken, validateToken);

router.post('/login', login);
router.post('/register', register);

export default router;