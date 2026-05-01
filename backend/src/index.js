import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import config from './config/index.js';
import { testConnection } from './config/database.js';
import authRoutes from './routes/auth.js';
import characterRoutes from './routes/characters.js';
import chatRoutes from './routes/chat.js';
import settingsRoutes from './routes/settings.js';
import modelsRoutes from './routes/models.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/models', modelsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

async function startServer() {
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.warn('Warning: Database not connected. Some features may not work.');
  }

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`Health check: http://localhost:${config.port}/api/health`);
  });
}

startServer();