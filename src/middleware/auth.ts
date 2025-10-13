import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { AuthenticatedRequest } from '../types';
import { createErrorResponse } from '../utils/response';
import logger from '../utils/logger';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json(createErrorResponse('Access token is required'));
      return;
    }

    const token = authHeader.substring(7);
    
    const decoded = await AuthService.verifyToken(token);
    
    // Add user info to request object
    (req as unknown as AuthenticatedRequest).user = {
      cp050: decoded.cp050,
      cp010: decoded.cp010
    };

    next();
  } catch (error) {
    logger.warn(`Authentication failed: ${error}`);
    res.status(401).json(createErrorResponse('Invalid or expired token', [error instanceof Error ? error.message : 'Authentication failed']));
  }
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = await AuthService.verifyToken(token);
      
      (req as unknown as AuthenticatedRequest).user = {
        cp050: decoded.cp050,
        cp010: decoded.cp010
      };
    }

    next();
  } catch (error) {
    // For optional auth, we don't return error, just continue without user
    next();
  }
};
