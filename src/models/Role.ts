import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import logger from '../utils/logger';

export interface RoleRow extends RowDataPacket {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PermissionRow extends RowDataPacket {
  id: number;
  resource: string;
  action: string;
  description?: string;
  created_at: Date;
}

export class RoleModel {
  
  static async findById(id: number): Promise<RoleRow | null> {
    try {
      const [rows] = await pool.execute<RoleRow[]>(
        'SELECT * FROM roles WHERE id = ?',
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      logger.error('Error finding role by ID', error);
      throw new Error('Failed to find role');
    }
  }

  static async findByName(name: string): Promise<RoleRow | null> {
    try {
      const [rows] = await pool.execute<RoleRow[]>(
        'SELECT * FROM roles WHERE name = ?',
        [name]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      logger.error('Error finding role by name', error);
      throw new Error('Failed to find role');
    }
  }

  static async findAll(): Promise<RoleRow[]> {
    try {
      const [rows] = await pool.execute<RoleRow[]>(
        'SELECT * FROM roles ORDER BY id ASC'
      );
      return rows;
    } catch (error) {
      logger.error('Error finding roles', error);
      throw new Error('Failed to find roles');
    }
  }

  static async getRolePermissions(roleId: number): Promise<PermissionRow[]> {
    try {
      const [rows] = await pool.execute<PermissionRow[]>(
        `SELECT p.* FROM permissions p
         INNER JOIN role_permissions rp ON p.id = rp.permission_id
         WHERE rp.role_id = ?`,
        [roleId]
      );
      return rows;
    } catch (error) {
      logger.error('Error finding role permissions', error);
      throw new Error('Failed to find role permissions');
    }
  }

  static async hasPermission(roleId: number, resource: string, action: string): Promise<boolean> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM role_permissions rp
         INNER JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id = ? AND p.resource = ? AND p.action = ?`,
        [roleId, resource, action]
      );
      return rows[0]['count'] > 0;
    } catch (error) {
      logger.error('Error checking permission', error);
      return false;
    }
  }

  static async getUserRole(login: string, companyId: number): Promise<RoleRow | null> {
    try {
      const [rows] = await pool.execute<RoleRow[]>(
        `SELECT r.* FROM roles r
         INNER JOIN Tb004 u ON r.id = u.role_id
         WHERE u.cp050 = ? AND u.cp010 = ?`,
        [login, companyId]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      logger.error('Error finding user role', error);
      return null;
    }
  }
}
