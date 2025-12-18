import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * Public routes (no authentication required)
 */
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);

/**
 * Protected routes (authentication required)
 */
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/logout', authenticate, authController.logout);

// Alias for frontend compatibility
router.get('/me', authenticate, authController.getProfile);

export default router;