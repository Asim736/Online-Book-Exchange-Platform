import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
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
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/', createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;