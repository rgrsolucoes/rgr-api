import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateLogin, validateRefreshToken } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc User login
 * @access Public
 */
router.post('/login', validateLogin, AuthController.login);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh', validateRefreshToken, AuthController.refreshToken);

/**
 * @route GET /api/auth/verify
 * @desc Verify token validity
 * @access Private
 */
router.get('/verify', AuthController.verifyToken);

/**
 * @route POST /api/auth/logout
 * @desc User logout
 * @access Private
 */
router.post('/logout', authenticateToken, AuthController.logout);

export default router;
