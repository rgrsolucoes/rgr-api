import { Router } from 'express';
import { CompanyController } from '../controllers/CompanyController';
import { authenticateToken } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { auditLog } from '../middleware/audit';
import { validateCompanyCreation, validateCompanyUpdate } from '../middleware/validation';

const router = Router();

router.use(authenticateToken);

router.post('/', requirePermission('companies', 'create'), auditLog('companies'), validateCompanyCreation, CompanyController.create);

router.get('/', requirePermission('companies', 'read'), auditLog('companies'), CompanyController.getAll);

router.get('/:id', requirePermission('companies', 'read'), auditLog('companies'), CompanyController.getById);

router.put('/:id', requirePermission('companies', 'update'), auditLog('companies'), validateCompanyUpdate, CompanyController.update);

router.delete('/:id', requirePermission('companies', 'delete'), auditLog('companies'), CompanyController.delete);

router.patch('/:id/deactivate', requirePermission('companies', 'update'), auditLog('companies'), CompanyController.deactivate);

router.patch('/:id/activate', requirePermission('companies', 'update'), auditLog('companies'), CompanyController.activate);

export default router;
