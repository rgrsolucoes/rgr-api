import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { auditLog } from '../middleware/audit';
import { 
  validateUserCreation, 
  validateUserUpdate, 
  validateLoginParam, 
  validatePagination 
} from '../middleware/validation';

const router = Router();

router.use(authenticateToken);

router.get('/me', UserController.getCurrentUser);

router.get('/', requirePermission('users', 'read'), auditLog('users'), validatePagination, UserController.getUsers);

router.post('/', requirePermission('users', 'create'), auditLog('users'), validateUserCreation, UserController.createUser);

router.get('/:login', requirePermission('users', 'read'), auditLog('users'), validateLoginParam, UserController.getUser);

router.put('/:login', requirePermission('users', 'update'), auditLog('users'), validateLoginParam, validateUserUpdate, UserController.updateUser);

router.delete('/:login', requirePermission('users', 'delete'), auditLog('users'), validateLoginParam, UserController.deleteUser);

export default router;
