import { Request, Response, NextFunction } from 'express';
import { CompanyService } from '../services/CompanyService';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import logger from '../utils/logger';

export class CompanyController {
  
  static async create(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const company = await CompanyService.createCompany(req.body);
      logger.info(`Company ${company?.cp010} created successfully`);
      res.status(201).json(createSuccessResponse('Company created successfully', company));
    } catch (error) {
      logger.error('Error creating company', error);
      res.status(400).json(createErrorResponse('Failed to create company', [error instanceof Error ? error.message : 'Unknown error']));
    }
  }

  static async getById(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params['id']);
      
      if (isNaN(id)) {
        res.status(400).json(createErrorResponse('Invalid company ID'));
        return;
      }

      const company = await CompanyService.getCompanyById(id);
      res.json(createSuccessResponse('Company retrieved successfully', company));
    } catch (error) {
      logger.error('Error retrieving company', error);
      res.status(404).json(createErrorResponse('Company not found', [error instanceof Error ? error.message : 'Unknown error']));
    }
  }

  static async getAll(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 50;
      const activeOnly = req.query['active'] === 'true';
      const search = req.query['search'] as string;
      const sortBy = req.query['sortBy'] as string;
      const sortOrder = (req.query['sortOrder'] as 'ASC' | 'DESC') || 'DESC';

      const result = await CompanyService.getAllCompanies(page, limit, {
        activeOnly,
        search,
        sortBy,
        sortOrder
      });

      res.json(createSuccessResponse('Companies retrieved successfully', {
        companies: result.companies,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        },
        filters: {
          activeOnly,
          search,
          sortBy,
          sortOrder
        }
      }));
    } catch (error) {
      logger.error('Error retrieving companies', error);
      res.status(500).json(createErrorResponse('Failed to retrieve companies', [error instanceof Error ? error.message : 'Unknown error']));
    }
  }

  static async update(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params['id']);
      
      if (isNaN(id)) {
        res.status(400).json(createErrorResponse('Invalid company ID'));
        return;
      }

      const company = await CompanyService.updateCompany(id, req.body);
      logger.info(`Company ${id} updated successfully`);
      res.json(createSuccessResponse('Company updated successfully', company));
    } catch (error) {
      logger.error('Error updating company', error);
      res.status(400).json(createErrorResponse('Failed to update company', [error instanceof Error ? error.message : 'Unknown error']));
    }
  }

  static async delete(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params['id']);
      
      if (isNaN(id)) {
        res.status(400).json(createErrorResponse('Invalid company ID'));
        return;
      }

      await CompanyService.deleteCompany(id);
      logger.info(`Company ${id} deleted successfully`);
      res.json(createSuccessResponse('Company deleted successfully'));
    } catch (error) {
      logger.error('Error deleting company', error);
      res.status(404).json(createErrorResponse('Failed to delete company', [error instanceof Error ? error.message : 'Unknown error']));
    }
  }

  static async deactivate(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params['id']);
      
      if (isNaN(id)) {
        res.status(400).json(createErrorResponse('Invalid company ID'));
        return;
      }

      await CompanyService.deactivateCompany(id);
      logger.info(`Company ${id} deactivated successfully`);
      res.json(createSuccessResponse('Company deactivated successfully'));
    } catch (error) {
      logger.error('Error deactivating company', error);
      res.status(404).json(createErrorResponse('Failed to deactivate company', [error instanceof Error ? error.message : 'Unknown error']));
    }
  }

  static async activate(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params['id']);
      
      if (isNaN(id)) {
        res.status(400).json(createErrorResponse('Invalid company ID'));
        return;
      }

      await CompanyService.activateCompany(id);
      logger.info(`Company ${id} activated successfully`);
      res.json(createSuccessResponse('Company activated successfully'));
    } catch (error) {
      logger.error('Error activating company', error);
      res.status(404).json(createErrorResponse('Failed to activate company', [error instanceof Error ? error.message : 'Unknown error']));
    }
  }
}
