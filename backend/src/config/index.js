import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'charflow-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  encryptionKey: process.env.ENCRYPTION_KEY || 'charflow-encryption-key-32',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'charflow',
    socketPath: process.env.DB_SOCKET || ''
  },
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-3.5-turbo'
  },
  ollama: {
    baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
    defaultModel: 'llama2'
  }
};