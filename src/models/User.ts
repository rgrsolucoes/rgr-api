import pool from '../config/database';
import { User, UserCreateInput, UserUpdateInput } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class UserModel {
  
  static async findByLogin(login: string): Promise<User | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT cp050, cp064, cp010 FROM Tb004 WHERE cp050 = ?',
        [login]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0] as User;
    } catch (error) {
      throw new Error(`Error finding user by login: ${error}`);
    }
  }

  static async findByLoginAndCompany(login: string, companyId: number): Promise<User | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT cp050, cp064, cp010 FROM Tb004 WHERE cp050 = ? AND cp010 = ?',
        [login, companyId]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0] as User;
    } catch (error) {
      throw new Error(`Error finding user by login and company: ${error}`);
    }
  }

  static async create(userData: UserCreateInput): Promise<User> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO Tb004 (cp050, cp064, cp010, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        [userData.cp050, userData.cp064, userData.cp010]
      );

      if (result.affectedRows === 0) {
        throw new Error('Failed to create user');
      }

      const user = await this.findByLogin(userData.cp050);
      if (!user) {
        throw new Error('Failed to retrieve created user');
      }

      return user;
    } catch (error) {
      throw new Error(`Error creating user: ${error}`);
    }
  }

  static async update(login: string, companyId: number, userData: UserUpdateInput): Promise<User | null> {
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (userData.cp050) {
        updateFields.push('cp050 = ?');
        updateValues.push(userData.cp050);
      }

      if (userData.cp064) {
        updateFields.push('cp064 = ?');
        updateValues.push(userData.cp064);
      }

      if (userData.cp010) {
        updateFields.push('cp010 = ?');
        updateValues.push(userData.cp010);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(login, companyId);

      const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE Tb004 SET ${updateFields.join(', ')} WHERE cp050 = ? AND cp010 = ?`,
        updateValues
      );

      if (result.affectedRows === 0) {
        return null;
      }

      return await this.findByLoginAndCompany(userData.cp050 || login, userData.cp010 || companyId);
    } catch (error) {
      throw new Error(`Error updating user: ${error}`);
    }
  }

  static async delete(login: string, companyId: number): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM Tb004 WHERE cp050 = ? AND cp010 = ?',
        [login, companyId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting user: ${error}`);
    }
  }

  static async findAllByCompany(
    companyId: number, 
    limit: number = 50, 
    offset: number = 0,
    filters?: {
      search?: string;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    }
  ): Promise<User[]> {
    try {
      const params: any[] = [companyId];
      let whereClause = 'WHERE cp010 = ?';
      
      if (filters?.search) {
        whereClause += ' AND cp050 LIKE ?';
        params.push(`%${filters.search}%`);
      }
      
      const sortBy = filters?.sortBy || 'created_at';
      const sortOrder = filters?.sortOrder || 'DESC';
      const allowedSortFields = ['cp050', 'cp010', 'created_at', 'updated_at'];
      const allowedSortOrders = ['ASC', 'DESC'];
      const orderBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
      const validSortOrder = allowedSortOrders.includes(sortOrder) ? sortOrder : 'DESC';
      
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT cp050, cp010, created_at, updated_at FROM Tb004 ${whereClause} ORDER BY ${orderBy} ${validSortOrder} LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );
      
      return rows as User[];
    } catch (error) {
      throw new Error(`Error finding users by company: ${error}`);
    }
  }

  static async countByCompany(companyId: number, search?: string): Promise<number> {
    try {
      const params: any[] = [companyId];
      let whereClause = 'WHERE cp010 = ?';
      
      if (search) {
        whereClause += ' AND cp050 LIKE ?';
        params.push(`%${search}%`);
      }
      
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM Tb004 ${whereClause}`,
        params
      );
      
      return (rows[0] as any)['total'];
    } catch (error) {
      throw new Error(`Error counting users by company: ${error}`);
    }
  }
}
