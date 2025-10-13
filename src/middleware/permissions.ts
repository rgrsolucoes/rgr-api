import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { RoleModel } from '../models/Role';
import { createErrorResponse } from '../utils/response';
import logger from '../utils/logger';

export const requirePermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as unknown as AuthenticatedRequest).user;
      
      if (!user) {
        res.status(401).json(createErrorResponse('Authentication required'));
        return;
      }

      const role = await RoleModel.getUserRole(user.cp050, user.cp010);
      
      if (!role) {
        logger.warn(`User ${user.cp050} has no role assigned`);
        res.status(403).json(createErrorResponse('No role assigned to user'));
        return;
      }

      const hasPermission = await RoleModel.hasPermission(role.id, resource, action);
      
      if (!hasPermission) {
        logger.warn(`User ${user.cp050} attempted ${action} on ${resource} without permission`);
        res.status(403).json(createErrorResponse('Insufficient permissions', [
          `You don't have permission to ${action} ${resource}`
        ]));
        return;
      }

      next();
    } catch (error) {
      logger.error('Permission check error', error);
      res.status(500).json(createErrorResponse('Permission check failed'));
    }
  };
};

export const requireRole = (roleName: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as unknown as AuthenticatedRequest).user;
      
      if (!user) {
        res.status(401).json(createErrorResponse('Authentication required'));
        return;
      }

      const role = await RoleModel.getUserRole(user.cp050, user.cp010);
      
      if (!role || role.name !== roleName) {
        logger.warn(`User ${user.cp050} attempted to access ${roleName}-only resource`);
        res.status(403).json(createErrorResponse('Insufficient privileges', [
          `This action requires ${roleName} role`
        ]));
        return;
      }

      next();
    } catch (error) {
      logger.error('Role check error', error);
      res.status(500).json(createErrorResponse('Role check failed'));
    }
  };
};
