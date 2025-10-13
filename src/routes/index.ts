import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
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
      deleteUser: 'DELETE /api/users/:login'
    }
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
