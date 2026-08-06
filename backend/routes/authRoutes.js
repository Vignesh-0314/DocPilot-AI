import express from 'express';
import { register, login, googleAuth, getMe, sendVerificationLink, confirmEmail, resendVerificationLink } from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/send-verification-link', sendVerificationLink);
router.post('/confirm-email', confirmEmail);
router.post('/resend-verification-link', resendVerificationLink);
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', authenticateJWT, getMe);

export default router;
