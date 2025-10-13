import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { UserCreateInput, UserUpdateInput, AuthenticatedRequest } from '../types';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import logger from '../utils/logger';

export class UserController {
  
  static async createUser(req: Request, res: Response, _next: NextFunction) {
    try {
      const userData: UserCreateInput = req.body;

      const user = await UserService.createUser(userData);

      // Remove password from response
      const { cp064, ...userResponse } = user;

      logger.info(`User ${userData.cp050} created successfully for company ${userData.cp010}`);
      
      res.status(201).json(createSuccessResponse('User created successfully', userResponse));
    } catch (error) {
      logger.error(`User creation failed: ${error}`);
      res.status(400).json(createErrorResponse('User creation failed', [error instanceof Error ? error.message : 'Unknown error']));
    }
  }

  static async updateUser(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { login } = req.params;
      const userData: UserUpdateInput = req.body;
      const authenticatedReq = req as unknown as AuthenticatedRequest;

      // Users can only update users from their own company
      const companyId = authenticatedReq.user!.cp010;

      const user = await UserService.updateUser(login, companyId, userData);

      if (!user) {
        res.status(404).json(createErrorResponse('User not found'));
        return;
      }

      // Remove password from response
      const { cp064, ...userResponse } = user;

      logger.info(`User ${login} updated successfully`);
      
      res.json(createSuccessResponse('User updated successfully', userResponse));
    } catch (error) {
      logger.error(`User update failed: ${error}`);
      res.status(400).json(createErrorResponse('User update failed', [error instanceof Error ? error.message : 'Unknown error']));
    }
  }

  static async deleteUser(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { login } = req.params;
      const authenticatedReq = req as unknown as AuthenticatedRequest;

      // Users can only delete users from their own company
      const companyId = authenticatedReq.user!.cp010;

      // Prevent users from deleting themselves
      if (login === authenticatedReq.user!.cp050) {
        res.status(400).json(createErrorResponse('Cannot delete your own user'));
        return;
      }

      const deleted = await UserService.deleteUser(login, companyId);

      if (!deleted) {
        res.status(404).json(createErrorResponse('User not found'));
        return;
      }

      logger.info(`User ${login} deleted successfully`);
      
      res.json(createSuccessResponse('User deleted successfully'));
    } catch (error) {
      logger.error(`User deletion failed: ${error}`);
      res.status(400).json(createErrorResponse('User deletion failed', [error instanceof Error ? error.message : 'Unknown error']));
    }
  }

  static async getUser(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { login } = req.params;
      const authenticatedReq = req as unknown as AuthenticatedRequest;

      // Users can only get users from their own company
      const companyId = authenticatedReq.user!.cp010;

      const user = await UserService.getUser(login, companyId);

      res.json(createSuccessResponse('User retrieved successfully', user));
    } catch (error) {
      logger.error(`User retrieval failed: ${error}`);
      res.status(404).json(createErrorResponse('User not found', [error instanceof Error ? error.message : 'Unknown error']));
    }
  }

  static async getUsers(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const authenticatedReq = req as unknown as AuthenticatedRequest;
      const companyId = authenticatedReq.user!.cp010;
      
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = Math.min(parseInt(req.query['limit'] as string) || 50, 100); // Max 100 per page

      const result = await UserService.getUsersByCompany(companyId, page, limit);

      res.json(createSuccessResponse('Users retrieved successfully', result));
    } catch (error) {
      logger.error(`Users retrieval failed: ${error}`);
      res.status(400).json(createErrorResponse('Users retrieval failed', [error instanceof Error ? error.message : 'Unknown error']));
    }
  }

  static async getCurrentUser(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const authenticatedReq = req as unknown as AuthenticatedRequest;
      const { cp050, cp010 } = authenticatedReq.user!;

      const user = await UserService.getUser(cp050, cp010);

      res.json(createSuccessResponse('Current user retrieved successfully', user));
    } catch (error) {
      logger.error(`Current user retrieval failed: ${error}`);
      res.status(404).json(createErrorResponse('Current user not found', [error instanceof Error ? error.message : 'Unknown error']));
    }
  }
}
