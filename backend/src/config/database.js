import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'charflow',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

if (process.env.DB_SOCKET) {
  poolConfig.socketPath = process.env.DB_SOCKET;
}

const pool = mysql.createPool(poolConfig);

export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}

export async function executeQuery(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Query execution failed:', error.message);
    throw error;
  }
}

export async function getConnection() {
  return pool.getConnection();
}

export default pool;