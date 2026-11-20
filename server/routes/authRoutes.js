import express from 'express';
import { registerUser, loginUser, googleAuth, updateUserRole, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-auth', googleAuth);
router.post('/update-role', updateUserRole);
router.get('/me', protect, getMe);

export default router;
