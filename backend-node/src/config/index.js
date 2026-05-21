import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
dotenv.config();

export const config = {
  port: parseInt(process.env.NODE_PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/quisi',
  jwtSecret: process.env.JWT_SECRET || 'quisi-dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  aiInternalKey: process.env.AI_SERVICE_INTERNAL_KEY || 'quisi-internal-ai-key',
};
