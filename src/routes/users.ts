import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken } from '../middleware/auth';
import { 
  validateUserCreation, 
  validateUserUpdate, 
  validateLoginParam, 
  validatePagination 
} from '../middleware/validation';

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

/**
 * @route GET /api/users/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', UserController.getCurrentUser);

/**
 * @route GET /api/users
 * @desc Get all users for the authenticated user's company
 * @access Private
 */
router.get('/', validatePagination, UserController.getUsers);

/**
 * @route POST /api/users
 * @desc Create a new user
 * @access Private
 */
router.post('/', validateUserCreation, UserController.createUser);

/**
 * @route GET /api/users/:login
 * @desc Get user by login
 * @access Private
 */
router.get('/:login', validateLoginParam, UserController.getUser);

/**
 * @route PUT /api/users/:login
 * @desc Update user by login
 * @access Private
 */
router.put('/:login', validateLoginParam, validateUserUpdate, UserController.updateUser);

/**
 * @route DELETE /api/users/:login
 * @desc Delete user by login
 * @access Private
 */
router.delete('/:login', validateLoginParam, UserController.deleteUser);

export default router;
