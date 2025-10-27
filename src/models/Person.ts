import pool from '../config/database';
import { Person, PersonCreateInput, PersonUpdateInput } from '../types/person';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class PersonModel {
  
  static async findById(id: number, companyId: number): Promise<Person | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM Tb007 WHERE CP018 = ? AND CP010 = ?',
        [id, companyId]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0] as Person;
    } catch (error) {
      throw new Error(`Error finding person by id: ${error}`);
    }
  }

  static async findByCPF(cpf: string, companyId: number): Promise<Person | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM Tb007 WHERE CP028 = ? AND CP010 = ?',
        [cpf, companyId]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0] as Person;
    } catch (error) {
      throw new Error(`Error finding person by CPF: ${error}`);
    }
  }

  static async findByCNPJ(cnpj: string, companyId: number): Promise<Person | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM Tb007 WHERE CP030 = ? AND CP010 = ?',
        [cnpj, companyId]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0] as Person;
    } catch (error) {
      throw new Error(`Error finding person by CNPJ: ${error}`);
    }
  }

  static async findByName(name: string, companyId: number): Promise<Person[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM Tb007 WHERE CP051 LIKE ? AND CP010 = ? ORDER BY CP051 ASC',
        [`%${name}%`, companyId]
      );
      
      return rows as Person[];
    } catch (error) {
      throw new Error(`Error finding person by name: ${error}`);
    }
  }

  static async create(personData: PersonCreateInput): Promise<Person> {
    try {
      const fields: string[] = [];
      const placeholders: string[] = [];
      const values: any[] = [];

      Object.entries(personData).forEach(([key, value]) => {
        if (value !== undefined) {
          fields.push(key);
          placeholders.push('?');
          values.push(value);
        }
      });

      fields.push('CP001', 'CP002', 'CP372');
      placeholders.push('NOW()', 'NOW()', 'NOW()');

      const query = `INSERT INTO Tb007 (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
      
      const [result] = await pool.execute<ResultSetHeader>(query, values);

      if (result.affectedRows === 0) {
        throw new Error('Failed to create person');
      }

      const person = await this.findById(result.insertId, personData.CP010);
      if (!person) {
        throw new Error('Failed to retrieve created person');
      }

      return person;
    } catch (error) {
      throw new Error(`Error creating person: ${error}`);
    }
  }

  static async update(id: number, companyId: number, personData: PersonUpdateInput): Promise<Person | null> {
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      Object.entries(personData).forEach(([key, value]) => {
        if (value !== undefined) {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateFields.push('CP372 = NOW()');
      updateValues.push(id, companyId);

      const query = `UPDATE Tb007 SET ${updateFields.join(', ')} WHERE CP018 = ? AND CP010 = ?`;
      
      const [result] = await pool.execute<ResultSetHeader>(query, updateValues);

      if (result.affectedRows === 0) {
        return null;
      }

      return await this.findById(id, companyId);
    } catch (error) {
      throw new Error(`Error updating person: ${error}`);
    }
  }

  static async delete(id: number, companyId: number): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM Tb007 WHERE CP018 = ? AND CP010 = ?',
        [id, companyId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting person: ${error}`);
    }
  }

  static async activate(id: number, companyId: number): Promise<Person | null> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE Tb007 SET CP136 = 1, CP372 = NOW() WHERE CP018 = ? AND CP010 = ?',
        [id, companyId]
      );

      if (result.affectedRows === 0) {
        return null;
      }

      return await this.findById(id, companyId);
    } catch (error) {
      throw new Error(`Error activating person: ${error}`);
    }
  }

  static async deactivate(id: number, companyId: number): Promise<Person | null> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE Tb007 SET CP136 = 2, CP372 = NOW() WHERE CP018 = ? AND CP010 = ?',
        [id, companyId]
      );

      if (result.affectedRows === 0) {
        return null;
      }

      return await this.findById(id, companyId);
    } catch (error) {
      throw new Error(`Error deactivating person: ${error}`);
    }
  }

  static async findAllByCompany(
    companyId: number, 
    limit: number, 
    offset: number,
    filters?: {
      search?: string;
      personType?: '1' | '2';
      status?: number;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    }
  ): Promise<Person[]> {
    try {
      const whereClauses: string[] = ['CP010 = ?'];
      const params: any[] = [companyId];

      if (filters?.search) {
        whereClauses.push('(CP051 LIKE ? OR CP028 LIKE ? OR CP030 LIKE ? OR CP066 LIKE ?)');
        const searchParam = `%${filters.search}%`;
        params.push(searchParam, searchParam, searchParam, searchParam);
      }

      if (filters?.personType) {
        whereClauses.push('CP020 = ?');
        params.push(filters.personType);
      }

      if (filters?.status) {
        whereClauses.push('CP136 = ?');
        params.push(filters.status);
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      
      const sortBy = filters?.sortBy || 'CP018';
      const sortOrder = filters?.sortOrder || 'DESC';
      const allowedSortFields = ['CP018', 'CP051', 'CP028', 'CP030', 'CP001', 'CP002', 'CP372'];
      const allowedSortOrders = ['ASC', 'DESC'];
      const orderBy = allowedSortFields.includes(sortBy) ? sortBy : 'CP018';
      const validSortOrder = allowedSortOrders.includes(sortOrder) ? sortOrder : 'DESC';
      
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT * FROM Tb007 ${whereClause} ORDER BY ${orderBy} ${validSortOrder} LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );
      
      return rows as Person[];
    } catch (error) {
      throw new Error(`Error finding persons by company: ${error}`);
    }
  }

  static async countByCompany(companyId: number, search?: string, personType?: '1' | '2', status?: number): Promise<number> {
    try {
      const whereClauses: string[] = ['CP010 = ?'];
      const params: any[] = [companyId];

      if (search) {
        whereClauses.push('(CP051 LIKE ? OR CP028 LIKE ? OR CP030 LIKE ? OR CP066 LIKE ?)');
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam, searchParam);
      }

      if (personType) {
        whereClauses.push('CP020 = ?');
        params.push(personType);
      }

      if (status) {
        whereClauses.push('CP136 = ?');
        params.push(status);
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM Tb007 ${whereClause}`,
        params
      );

      return (rows[0] as any).total;
    } catch (error) {
      throw new Error(`Error counting persons: ${error}`);
    }
  }
}
