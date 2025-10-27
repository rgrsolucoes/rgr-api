import { Request, Response, NextFunction } from 'express';
import { PersonService } from '../services/PersonService';
import { AuthenticatedRequest } from '../types';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import logger from '../utils/logger';
import { body, validationResult } from 'express-validator';

export class PersonController {
  
  static validateCreate = [
    body('CP011').isInt().withMessage('Branch ID (CP011) must be an integer'),
    body('CP020').isIn(['1', '2']).withMessage('Person type (CP020) must be 1 (física) or 2 (jurídica)'),
    body('CP051').trim().notEmpty().withMessage('Name (CP051) is required').isLength({ max: 200 }).withMessage('Name must be at most 200 characters'),
    body('CP028').optional().trim().isLength({ max: 30 }).withMessage('CPF must be at most 30 characters'),
    body('CP030').optional().trim().isLength({ max: 30 }).withMessage('CNPJ must be at most 30 characters'),
    body('CP066').optional().trim().isEmail().withMessage('Invalid email format').isLength({ max: 50 }).withMessage('Email must be at most 50 characters'),
    body('CP031').optional().trim().isLength({ max: 100 }).withMessage('Phone must be at most 100 characters'),
    body('CP032').optional().trim().isLength({ max: 30 }).withMessage('Mobile must be at most 30 characters'),
    body('CP034').optional().trim().isLength({ max: 15 }).withMessage('CEP must be at most 15 characters'),
    body('CP136').optional().isInt({ min: 1, max: 2 }).withMessage('Status must be 1 (active) or 2 (inactive)'),
  ];

  static validateUpdate = [
    body('CP011').optional().isInt().withMessage('Branch ID must be an integer'),
    body('CP020').optional().isIn(['1', '2']).withMessage('Person type must be 1 or 2'),
    body('CP051').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 200 }).withMessage('Name must be at most 200 characters'),
    body('CP028').optional().trim().isLength({ max: 30 }).withMessage('CPF must be at most 30 characters'),
    body('CP030').optional().trim().isLength({ max: 30 }).withMessage('CNPJ must be at most 30 characters'),
    body('CP066').optional().trim().isEmail().withMessage('Invalid email format').isLength({ max: 50 }).withMessage('Email must be at most 50 characters'),
    body('CP136').optional().isInt({ min: 1, max: 2 }).withMessage('Status must be 1 or 2'),
  ];

  static async createPerson(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(createErrorResponse('Validation failed', errors.array().map(e => e.msg)));
        return;
      }

      const authenticatedReq = req as unknown as AuthenticatedRequest;
      const companyId = authenticatedReq.user!.cp010;

      const personData = {
        ...req.body,
        CP010: companyId
      };

      const person = await PersonService.createPerson(personData);

      res.status(201).json(createSuccessResponse('Person created successfully', person));
    } catch (error) {
      logger.error(`Person creation failed: ${error}`);
      res.status(400).json(createErrorResponse('Person creation failed', [error instanceof Error ? error.message : 'Unknown error']));
    }
  }

  static async updatePerson(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(createErrorResponse('Validation failed', errors.array().map(e => e.msg)));
        return;
      }

      const authenticatedReq = req as unknown as AuthenticatedRequest;
      const companyId = authenticatedReq.user!.cp010;
      const personId = parseInt(req.params['id']);

      const updateData = { ...req.body };
      delete updateData.CP010;
      delete updateData.CP018;

      const person = await PersonService.updatePerson(personId, companyId, updateData);

      res.json(createSuccessResponse('Person updated successfully', person));
    } catch (error) {
      logger.error(`Person update failed: ${error}`);
      res.status(400).json(createErrorResponse('Person update failed', [error instanceof Error ? error.message : 'Unknown error']));
    }
  }

  static async deletePerson(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const authenticatedReq = req as unknown as AuthenticatedRequest;
      const companyId = authenticatedReq.user!.cp010;
      const personId = parseInt(req.params['id']);

      await PersonService.deletePerson(personId, companyId);

      res.json(createSuccessResponse('Person deleted successfully'));
    } catch (error) {
      logger.error(`Person deletion failed: ${error}`);
      res.status(404).json(createErrorResponse('Person not found', [error instanceof Error ? error.message : 'Unknown error']));
    }
  }

  static async getPerson(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const authenticatedReq = req as unknown as AuthenticatedRequest;
      const companyId = authenticatedReq.user!.cp010;
      const personId = parseInt(req.params['id']);

      const person = await PersonService.getPerson(personId, companyId);

      res.json(createSuccessResponse('Person retrieved successfully', person));
    } catch (error) {
      logger.error(`Person retrieval failed: ${error}`);
      res.status(404).json(createErrorResponse('Person not found', [error instanceof Error ? error.message : 'Unknown error']));
    }
  }

  static async getPersons(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const authenticatedReq = req as unknown as AuthenticatedRequest;
      const companyId = authenticatedReq.user!.cp010;
      
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = Math.min(parseInt(req.query['limit'] as string) || 50, 100);
      const search = req.query['search'] as string;
      const personType = req.query['personType'] as '1' | '2' | undefined;
      const status = req.query['status'] ? parseInt(req.query['status'] as string) : undefined;
      const sortBy = req.query['sortBy'] as string;
      const sortOrder = (req.query['sortOrder'] as 'ASC' | 'DESC') || 'DESC';

      const result = await PersonService.getPersonsByCompany(companyId, page, limit, {
        search,
        personType,
        status,
        sortBy,
        sortOrder
      });

      res.json(createSuccessResponse('Persons retrieved successfully', {
        ...result,
        filters: {
          search,
          personType,
          status,
          sortBy,
          sortOrder
        }
      }));
    } catch (error) {
      logger.error(`Persons retrieval failed: ${error}`);
      res.status(400).json(createErrorResponse('Persons retrieval failed', [error instanceof Error ? error.message : 'Unknown error']));
    }
  }

  static async activatePerson(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const authenticatedReq = req as unknown as AuthenticatedRequest;
      const companyId = authenticatedReq.user!.cp010;
      const personId = parseInt(req.params['id']);

      const person = await PersonService.activatePerson(personId, companyId);

      res.json(createSuccessResponse('Person activated successfully', person));
    } catch (error) {
      logger.error(`Person activation failed: ${error}`);
      res.status(400).json(createErrorResponse('Person activation failed', [error instanceof Error ? error.message : 'Unknown error']));
    }
  }

  static async deactivatePerson(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const authenticatedReq = req as unknown as AuthenticatedRequest;
      const companyId = authenticatedReq.user!.cp010;
      const personId = parseInt(req.params['id']);

      const person = await PersonService.deactivatePerson(personId, companyId);

      res.json(createSuccessResponse('Person deactivated successfully', person));
    } catch (error) {
      logger.error(`Person deactivation failed: ${error}`);
      res.status(400).json(createErrorResponse('Person deactivation failed', [error instanceof Error ? error.message : 'Unknown error']));
    }
  }
}
