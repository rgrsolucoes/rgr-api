import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import logger from '../utils/logger';

export interface TokenBlacklistRow extends RowDataPacket {
  id: number;
  token: string;
  user_login: string;
  blacklisted_at: Date;
  expires_at: Date;
}

export class TokenBlacklistModel {
  
  static async addToken(token: string, userLogin: string, expiresAt: Date): Promise<void> {
    try {
      await pool.execute<ResultSetHeader>(
        'INSERT INTO token_blacklist (token, user_login, expires_at) VALUES (?, ?, ?)',
        [token, userLogin, expiresAt]
      );
      logger.info(`Token blacklisted for user ${userLogin}`);
    } catch (error) {
      logger.error('Error adding token to blacklist', error);
      throw new Error('Failed to blacklist token');
    }
  }

  static async isBlacklisted(token: string): Promise<boolean> {
    try {
      const [rows] = await pool.execute<TokenBlacklistRow[]>(
        'SELECT id FROM token_blacklist WHERE token = ? AND expires_at > NOW()',
        [token]
      );
      return rows.length > 0;
    } catch (error) {
      logger.error('Error checking token blacklist', error);
      return false;
    }
  }

  static async cleanupExpired(): Promise<void> {
    try {
      await pool.execute(
        'DELETE FROM token_blacklist WHERE expires_at <= NOW()'
      );
      logger.info('Expired tokens cleaned up from blacklist');
    } catch (error) {
      logger.error('Error cleaning up expired tokens', error);
    }
  }
}
