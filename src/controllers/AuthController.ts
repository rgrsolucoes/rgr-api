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

  static async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(createSuccessResponse('Logout successful'));
    } catch (error) {
      next(error);
    }
  }
}
