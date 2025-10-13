export const jwtConfig = {
  secret: process.env['JWT_SECRET'] || process.env['SESSION_SECRET'] || 'rgr-api-default-secret-key',
  expiresIn: process.env['JWT_EXPIRES_IN'] || '24h',
  issuer: 'rgr-api',
  audience: 'rgr-client'
};
