import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import logger from '../utils/logger';

export interface CompanyRow extends RowDataPacket {
  cp010: number;
  cp020: string;
  cp030?: string;
  cp040?: string;
  cp050?: string;
  cp060?: string;
  cp070?: string;
  cp080: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCompanyData {
  cp020: string;
  cp030?: string;
  cp040?: string;
  cp050?: string;
  cp060?: string;
  cp070?: string;
  cp080?: boolean;
}

export interface UpdateCompanyData {
  cp020?: string;
  cp030?: string;
  cp040?: string;
  cp050?: string;
  cp060?: string;
  cp070?: string;
  cp080?: boolean;
}

export class CompanyModel {
  
  static async create(data: CreateCompanyData): Promise<number> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO Tb003 (cp020, cp030, cp040, cp050, cp060, cp070, cp080) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.cp020,
          data.cp030 || null,
          data.cp040 || null,
          data.cp050 || null,
          data.cp060 || null,
          data.cp070 || null,
          data.cp080 ?? true
        ]
      );
      logger.info(`Company created with ID ${result.insertId}`);
      return result.insertId;
    } catch (error) {
      logger.error('Error creating company', error);
      throw new Error('Failed to create company');
    }
  }

  static async findById(id: number): Promise<CompanyRow | null> {
    try {
      const [rows] = await pool.execute<CompanyRow[]>(
        'SELECT * FROM Tb003 WHERE cp010 = ?',
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      logger.error('Error finding company by ID', error);
      throw new Error('Failed to find company');
    }
  }

  static async findAll(
    page = 1, 
    limit = 50, 
    filters?: {
      activeOnly?: boolean;
      search?: string;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    }
  ): Promise<{ companies: CompanyRow[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      const params: any[] = [];
      const whereClauses: string[] = [];
      
      if (filters?.activeOnly) {
        whereClauses.push('cp080 = TRUE');
      }
      
      if (filters?.search) {
        whereClauses.push('(cp020 LIKE ? OR cp030 LIKE ? OR cp040 LIKE ?)');
        params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
      }
      
      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      
      const sortBy = filters?.sortBy || 'cp010';
      const sortOrder = filters?.sortOrder || 'DESC';
      const allowedSortFields = ['cp010', 'cp020', 'cp030', 'created_at', 'updated_at'];
      const allowedSortOrders = ['ASC', 'DESC'];
      const orderBy = allowedSortFields.includes(sortBy) ? sortBy : 'cp010';
      const validSortOrder = allowedSortOrders.includes(sortOrder) ? sortOrder : 'DESC';
      
      const query = `SELECT * FROM Tb003 ${whereClause} ORDER BY ${orderBy} ${validSortOrder} LIMIT ? OFFSET ?`;
      const countQuery = `SELECT COUNT(*) as total FROM Tb003 ${whereClause}`;

      const [companies] = await pool.execute<CompanyRow[]>(query, [...params, limit, offset]);
      const [countResult] = await pool.execute<RowDataPacket[]>(countQuery, params);
      
      return {
        companies,
        total: countResult[0]['total']
      };
    } catch (error) {
      logger.error('Error finding companies', error);
      throw new Error('Failed to find companies');
    }
  }

  static async update(id: number, data: UpdateCompanyData): Promise<boolean> {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (data.cp020 !== undefined) {
        updates.push('cp020 = ?');
        values.push(data.cp020);
      }
      if (data.cp030 !== undefined) {
        updates.push('cp030 = ?');
        values.push(data.cp030);
      }
      if (data.cp040 !== undefined) {
        updates.push('cp040 = ?');
        values.push(data.cp040);
      }
      if (data.cp050 !== undefined) {
        updates.push('cp050 = ?');
        values.push(data.cp050);
      }
      if (data.cp060 !== undefined) {
        updates.push('cp060 = ?');
        values.push(data.cp060);
      }
      if (data.cp070 !== undefined) {
        updates.push('cp070 = ?');
        values.push(data.cp070);
      }
      if (data.cp080 !== undefined) {
        updates.push('cp080 = ?');
        values.push(data.cp080);
      }

      if (updates.length === 0) {
        return false;
      }

      values.push(id);

      const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE Tb003 SET ${updates.join(', ')} WHERE cp010 = ?`,
        values
      );

      logger.info(`Company ${id} updated`);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error updating company', error);
      throw new Error('Failed to update company');
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM Tb003 WHERE cp010 = ?',
        [id]
      );
      logger.info(`Company ${id} deleted`);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting company', error);
      throw new Error('Failed to delete company');
    }
  }

  static async deactivate(id: number): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE Tb003 SET cp080 = FALSE WHERE cp010 = ?',
        [id]
      );
      logger.info(`Company ${id} deactivated`);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error deactivating company', error);
      throw new Error('Failed to deactivate company');
    }
  }

  static async activate(id: number): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE Tb003 SET cp080 = TRUE WHERE cp010 = ?',
        [id]
      );
      logger.info(`Company ${id} activated`);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error activating company', error);
      throw new Error('Failed to activate company');
    }
  }

  static async findByCnpj(cnpj: string): Promise<CompanyRow | null> {
    try {
      const [rows] = await pool.execute<CompanyRow[]>(
        'SELECT * FROM Tb003 WHERE cp040 = ?',
        [cnpj]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      logger.error('Error finding company by CNPJ', error);
      throw new Error('Failed to find company');
    }
  }
}
