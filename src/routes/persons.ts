import { Router } from 'express';
import { PersonController } from '../controllers/PersonController';
import { authenticateToken } from '../middleware/auth';
//import { requirePermission } from '../middleware/permissions';
import { auditLog } from '../middleware/audit';

const router = Router();

router.get(
  '/',
  authenticateToken,
 // requirePermission('persons', 'read'),
  PersonController.getPersons
);

router.get(
  '/search/name',
  authenticateToken,
//  requirePermission('persons', 'read'),
  PersonController.findByName
);

router.get(
  '/:id',
  authenticateToken,
 // requirePermission('persons', 'read'),
  PersonController.getPerson
);

router.post(
  '/',
  authenticateToken,
//  requirePermission('persons', 'create'),
  PersonController.validateCreate,
  auditLog('persons'),
  PersonController.createPerson
);

router.put(
  '/:id',
  authenticateToken,
//  requirePermission('persons', 'update'),
  PersonController.validateUpdate,
  auditLog('persons'),
  PersonController.updatePerson
);

router.delete(
  '/:id',
  authenticateToken,
//  requirePermission('persons', 'delete'),
  auditLog('persons'),
  PersonController.deletePerson
);

router.patch(
  '/:id/activate',
  authenticateToken,
//  requirePermission('persons', 'update'),
  auditLog('persons'),
  PersonController.activatePerson
);

router.patch(
  '/:id/deactivate',
  authenticateToken,
 // requirePermission('persons', 'update'),
  auditLog('persons'),
  PersonController.deactivatePerson
);

export default router;
