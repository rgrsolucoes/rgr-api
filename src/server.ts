import app from './app';
import { config } from './config/env';
import logger from './utils/logger';

const PORT = typeof config.PORT === 'string' ? parseInt(config.PORT) : config.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  logger.info(`RGR-API server running on http://${HOST}:${PORT}`);
  logger.info('Press CTRL+C to stop the server');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
