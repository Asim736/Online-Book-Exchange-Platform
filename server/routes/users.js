import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { userCreationLimiter, profileUpdateLimiter, deleteOperationLimiter } from '../middleware/rateLimiter.js';
import { 
    getAllUsers, 
    getUserById, 
    createUser, 
    updateUser, 
    deleteUser,
    getUserMessages,
    updateProfile,
    changePassword
} from '../controllers/userController.js';

const router = express.Router();

// Protected routes
router.use(authenticateToken);

router.get('/', getAllUsers);
router.get('/messages', getUserMessages);
router.put('/profile', profileUpdateLimiter, updateProfile);
router.put('/change-password', profileUpdateLimiter, changePassword);
router.post('/', userCreationLimiter, createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteOperationLimiter, deleteUser);

export default router;