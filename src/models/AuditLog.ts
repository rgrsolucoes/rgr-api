import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import logger from '../utils/logger';

export interface AuditLogRow extends RowDataPacket {
  id: bigint;
  user_login: string;
  company_id: number;
  action: string;
  resource: string;
  resource_id?: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface CreateAuditLogData {
  user_login: string;
  company_id: number;
  action: string;
  resource: string;
  resource_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
}

export class AuditLogModel {
  
  static async create(data: CreateAuditLogData): Promise<bigint> {
    try {
      const detailsJson = data.details ? JSON.stringify(data.details) : null;
      
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO audit_logs (user_login, company_id, action, resource, resource_id, details, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.user_login,
          data.company_id,
          data.action,
          data.resource,
          data.resource_id || null,
          detailsJson,
          data.ip_address || null,
          data.user_agent || null
        ]
      );
      
      return BigInt(result.insertId);
    } catch (error) {
      logger.error('Error creating audit log', error);
      throw new Error('Failed to create audit log');
    }
  }

  static async findByUser(userLogin: string, companyId: number, limit = 50): Promise<AuditLogRow[]> {
    try {
      const [rows] = await pool.execute<AuditLogRow[]>(
        `SELECT * FROM audit_logs 
         WHERE user_login = ? AND company_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [userLogin, companyId, limit]
      );
      return rows;
    } catch (error) {
      logger.error('Error finding audit logs by user', error);
      throw new Error('Failed to find audit logs');
    }
  }

  static async findByResource(resource: string, resourceId: string, companyId: number, limit = 50): Promise<AuditLogRow[]> {
    try {
      const [rows] = await pool.execute<AuditLogRow[]>(
        `SELECT * FROM audit_logs 
         WHERE resource = ? AND resource_id = ? AND company_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [resource, resourceId, companyId, limit]
      );
      return rows;
    } catch (error) {
      logger.error('Error finding audit logs by resource', error);
      throw new Error('Failed to find audit logs');
    }
  }

  static async findByCompany(companyId: number, page = 1, limit = 50): Promise<{ logs: AuditLogRow[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      
      const [logs] = await pool.execute<AuditLogRow[]>(
        `SELECT * FROM audit_logs 
         WHERE company_id = ? 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [companyId, limit, offset]
      );
      
      const [countResult] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM audit_logs WHERE company_id = ?',
        [companyId]
      );
      
      return {
        logs,
        total: countResult[0]['total']
      };
    } catch (error) {
      logger.error('Error finding audit logs by company', error);
      throw new Error('Failed to find audit logs');
    }
  }

  static async findByAction(action: string, companyId: number, limit = 50): Promise<AuditLogRow[]> {
    try {
      const [rows] = await pool.execute<AuditLogRow[]>(
        `SELECT * FROM audit_logs 
         WHERE action = ? AND company_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [action, companyId, limit]
      );
      return rows;
    } catch (error) {
      logger.error('Error finding audit logs by action', error);
      throw new Error('Failed to find audit logs');
    }
  }

  static async cleanupOld(daysToKeep = 90): Promise<number> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        `DELETE FROM audit_logs 
         WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
        [daysToKeep]
      );
      logger.info(`Cleaned up ${result.affectedRows} old audit logs`);
      return result.affectedRows;
    } catch (error) {
      logger.error('Error cleaning up old audit logs', error);
      throw new Error('Failed to cleanup audit logs');
    }
  }
}
