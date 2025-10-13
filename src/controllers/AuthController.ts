import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { LoginRequest } from '../types';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import logger from '../utils/logger';

export class AuthController {
  
  static async login(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const loginData: LoginRequest = req.body;

      const result = await AuthService.login(loginData);

      const AuditLogModel = require('../models/AuditLog').AuditLogModel;
      await AuditLogModel.create({
        user_login: result.user.cp050,
        company_id: result.user.cp010,
        action: 'login',
        resource: 'auth',
        ip_address: req.ip || req.socket.remoteAddress,
        user_agent: req.headers['user-agent']
      }).catch((err: Error) => logger.error('Failed to log login audit', err));

      logger.info(`User ${loginData.login} logged in successfully`);
      
      res.json(createSuccessResponse('Login successful', result));
    } catch (error) {
      logger.warn(`Login failed for user ${req.body.login}: ${error}`);
      res.status(401).json(createErrorResponse('Login failed', [error instanceof Error ? error.message : 'Unknown error']));
    }
  }

  static async refreshToken(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json(createErrorResponse('Refresh token is required'));
        return;
      }

      const tokens = await AuthService.refreshToken(refreshToken);

      res.json(createSuccessResponse('Token refreshed successfully', tokens));
    } catch (error) {
      logger.warn(`Token refresh failed: ${error}`);
      res.status(401).json(createErrorResponse('Token refresh failed', [error instanceof Error ? error.message : 'Invalid refresh token']));
    }
  }

  static async verifyToken(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json(createErrorResponse('Token is required'));
        return;
      }

      const token = authHeader.substring(7);
      const decoded = await AuthService.verifyToken(token);

      res.json(createSuccessResponse('Token is valid', {
        user: {
          cp050: decoded.cp050,
          cp010: decoded.cp010
        },
        expiresAt: new Date(decoded.exp * 1000)
      }));
    } catch (error) {
      logger.warn(`Token verification failed: ${error}`);
      res.status(401).json(createErrorResponse('Token verification failed', [error instanceof Error ? error.message : 'Invalid token']));
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json(createErrorResponse('Access token is required'));
        return;
      }

      const token = authHeader.substring(7);
      
      // Decode token to get expiration and user info
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(token) as any;
      
      if (decoded && decoded.exp) {
        const expiresAt = new Date(decoded.exp * 1000);
        await AuthService.blacklistToken(token, decoded.cp050, expiresAt);
      }
      
      logger.info(`User ${decoded?.cp050} logged out successfully`);
      res.json(createSuccessResponse('Logout successful'));
    } catch (error) {
      next(error);
    }
  }
}
