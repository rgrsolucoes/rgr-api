import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import companyRoutes from './companies';
import personRoutes from './persons';
import { config } from '../config/env';

const router = Router();

// API version and info
router.get('/', (_req, res) => {
  res.json({
    service: 'RGR-API',
    version: '1.0.0',
    description: 'REST API for SaaS management system',
    environment: config.NODE_ENV,
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      companies: '/api/companies',
      persons: '/api/persons',
      health: '/health'
    },
    documentation: {
      login: 'POST /api/auth/login',
      refresh: 'POST /api/auth/refresh',
      verify: 'GET /api/auth/verify',
      logout: 'POST /api/auth/logout',
      currentUser: 'GET /api/users/me',
      users: 'GET /api/users',
      createUser: 'POST /api/users',
      getUser: 'GET /api/users/:login',
      updateUser: 'PUT /api/users/:login',
      deleteUser: 'DELETE /api/users/:login',
      companies: 'GET /api/companies',
      createCompany: 'POST /api/companies',
      getCompany: 'GET /api/companies/:id',
      updateCompany: 'PUT /api/companies/:id',
      deleteCompany: 'DELETE /api/companies/:id',
      deactivateCompany: 'PATCH /api/companies/:id/deactivate',
      activateCompany: 'PATCH /api/companies/:id/activate',
      persons: 'GET /api/persons',
      createPerson: 'POST /api/persons',
      getPerson: 'GET /api/persons/:id',
      findPersonByName: 'GET /api/persons/search/name?name=:name',
      updatePerson: 'PUT /api/persons/:id',
      deletePerson: 'DELETE /api/persons/:id',
      activatePerson: 'PATCH /api/persons/:id/activate',
      deactivatePerson: 'PATCH /api/persons/:id/deactivate'
    }
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/companies', companyRoutes);
router.use('/persons', personRoutes);

export default router;
