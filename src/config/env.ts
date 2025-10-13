import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server configuration
  PORT: parseInt(process.env['PORT'] || '5000'),
  NODE_ENV: process.env['NODE_ENV'] || 'development',
  ALLOWED_ORIGINS: process.env['ALLOWED_ORIGINS'],

  // JWT configuration
  JWT_SECRET: process.env['JWT_SECRET'] || process.env['SESSION_SECRET'] || 'default_jwt_secret_change_in_production',
  JWT_EXPIRES_IN: process.env['JWT_EXPIRES_IN'] || '24h',
  JWT_REFRESH_EXPIRES_IN: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d',

  // Database configuration
  DB_HOST: process.env['DB_HOST'] || 'localhost',
  DB_PORT: parseInt(process.env['DB_PORT'] || '3306'),
  DB_USER: process.env['DB_USER'] || 'root',
  DB_PASSWORD: process.env['DB_PASSWORD'] || '',
  DB_NAME: process.env['DB_NAME'] || 'rgr_db',
  DB_CONNECTION_LIMIT: parseInt(process.env['DB_CONNECTION_LIMIT'] || '10'),

  // Security
  BCRYPT_ROUNDS: parseInt(process.env['BCRYPT_ROUNDS'] || '12'),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100')
};
