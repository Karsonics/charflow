import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  };

  if (process.env.DB_SOCKET) {
    config.socketPath = process.env.DB_SOCKET;
  }

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('Connected to MySQL server');

    const migrationsPath = path.join(__dirname, '..', '..', 'database', 'migrations');
    const files = fs.readdirSync(migrationsPath).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsPath, file), 'utf-8');
      await connection.query(sql);
      console.log(`Completed: ${file}`);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigrations();