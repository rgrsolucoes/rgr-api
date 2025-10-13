import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { createErrorResponse } from '../utils/response';

// Validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    res.status(400).json(createErrorResponse('Validation failed', errorMessages));
    return;
  }
  next();
};

// Login validation
export const validateLogin = [
  body('login')
    .trim()
    .notEmpty()
    .withMessage('Login is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Login must be between 3 and 50 characters'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  handleValidationErrors
];

// User creation validation
export const validateUserCreation = [
  body('cp050')
    .trim()
    .notEmpty()
    .withMessage('Login (cp050) is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Login must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Login can only contain letters, numbers, dots, hyphens, and underscores'),
  
  body('cp064')
    .notEmpty()
    .withMessage('Password (cp064) is required')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('cp010')
    .isInt({ min: 1 })
    .withMessage('Company ID (cp010) must be a positive integer'),
  
  handleValidationErrors
];

// User update validation
export const validateUserUpdate = [
  body('cp050')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Login must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Login can only contain letters, numbers, dots, hyphens, and underscores'),
  
  body('cp064')
    .optional()
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('cp010')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Company ID (cp010) must be a positive integer'),
  
  handleValidationErrors
];

// Login parameter validation
export const validateLoginParam = [
  param('login')
    .trim()
    .notEmpty()
    .withMessage('Login parameter is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Login must be between 3 and 50 characters'),
  
  handleValidationErrors
];

// Refresh token validation
export const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
  
  handleValidationErrors
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

// Company creation validation
export const validateCompanyCreation = [
  body('cp020')
    .trim()
    .notEmpty()
    .withMessage('Razão social is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Razão social must be between 3 and 100 characters'),
  
  body('cp030')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Nome fantasia must not exceed 100 characters'),
  
  body('cp040')
    .optional()
    .trim()
    .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)
    .withMessage('CNPJ must be in the format XX.XXX.XXX/XXXX-XX'),
  
  body('cp050')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address'),
  
  body('cp060')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Telefone must not exceed 20 characters'),
  
  body('cp070')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Endereço must not exceed 500 characters'),
  
  body('cp080')
    .optional()
    .isBoolean()
    .withMessage('Active status must be boolean'),
  
  handleValidationErrors
];

// Company update validation
export const validateCompanyUpdate = [
  body('cp020')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Razão social must be between 3 and 100 characters'),
  
  body('cp030')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Nome fantasia must not exceed 100 characters'),
  
  body('cp040')
    .optional()
    .trim()
    .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)
    .withMessage('CNPJ must be in the format XX.XXX.XXX/XXXX-XX'),
  
  body('cp050')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address'),
  
  body('cp060')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Telefone must not exceed 20 characters'),
  
  body('cp070')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Endereço must not exceed 500 characters'),
  
  body('cp080')
    .optional()
    .isBoolean()
    .withMessage('Active status must be boolean'),
  
  handleValidationErrors
];
