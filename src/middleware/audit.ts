import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { AuditLogModel } from '../models/AuditLog';
import logger from '../utils/logger';

export const auditLog = (resource: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalSend = res.json;
    
    res.json = function(body: any) {
      const user = (req as unknown as AuthenticatedRequest).user;
      
      if (user && res.statusCode < 400) {
        const action = getActionFromMethod(req.method);
        const resourceId = getResourceIdFromRequest(req);
        const ipAddress = req.ip || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        
        AuditLogModel.create({
          user_login: user.cp050,
          company_id: user.cp010,
          action,
          resource,
          resource_id: resourceId,
          details: {
            method: req.method,
            path: req.path,
            query: req.query,
            body: sanitizeBody(req.body),
            statusCode: res.statusCode
          },
          ip_address: ipAddress,
          user_agent: userAgent
        }).catch(error => {
          logger.error('Failed to create audit log', error);
        });
      }
      
      return originalSend.call(this, body);
    };
    
    next();
  };
};

function getActionFromMethod(method: string): string {
  const actionMap: { [key: string]: string } = {
    'POST': 'create',
    'GET': 'read',
    'PUT': 'update',
    'PATCH': 'update',
    'DELETE': 'delete'
  };
  return actionMap[method] || 'unknown';
}

function getResourceIdFromRequest(req: Request): string | undefined {
  if (req.params['id']) return req.params['id'];
  if (req.params['login']) return req.params['login'];
  if (req.body && (req.body.cp050 || req.body.cp010)) {
    return req.body.cp050 || String(req.body.cp010);
  }
  return undefined;
}

function sanitizeBody(body: any): any {
  if (!body) return {};
  
  const sanitized = { ...body };
  
  if (sanitized.cp064) sanitized.cp064 = '[REDACTED]';
  if (sanitized.password) sanitized.password = '[REDACTED]';
  if (sanitized.refreshToken) sanitized.refreshToken = '[REDACTED]';
  if (sanitized.token) sanitized.token = '[REDACTED]';
  
  return sanitized;
}
