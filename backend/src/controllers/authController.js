import pool from '../config/database.js';
import { encrypt, decrypt } from '../utils/crypto.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );

    await pool.execute(
      'INSERT INTO user_settings (user_id, llm_provider, selected_model) VALUES (?, ?, ?)',
      [result.insertId, 'OPENROUTER', 'openai/gpt-3.5-turbo']
    );

    const token = jwt.sign({ userId: result.insertId, username }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

    res.status(201).json({
      message: 'User created successfully',
      user: { id: result.insertId, username, email },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

    res.json({
      message: 'Login successful',
      user: { id: user.id, username: user.username, email: user.email },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const getMe = async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT id, username, email, avatar_url, created_at FROM users WHERE id = ?', [req.userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [settings] = await pool.execute('SELECT llm_provider, selected_model FROM user_settings WHERE user_id = ?', [req.userId]);

    res.json({
      user: users[0],
      settings: settings[0] || { llm_provider: 'OPENROUTER', selected_model: 'openai/gpt-3.5-turbo' }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, avatar_url } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE username = ? AND id != ?',
      [username, req.userId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    await pool.execute(
      'UPDATE users SET username = ?, avatar_url = ? WHERE id = ?',
      [username, avatar_url || null, req.userId]
    );

    const [users] = await pool.execute('SELECT id, username, email, avatar_url, created_at FROM users WHERE id = ?', [req.userId]);

    res.json({ user: users[0] });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const getUserSettings = async (req, res) => {
  try {
    const [settings] = await pool.execute('SELECT * FROM user_settings WHERE user_id = ?', [req.userId]);
    if (settings.length === 0) {
      return res.json({
        llm_provider: 'OPENROUTER',
        openrouter_api_key: null,
        selected_model: 'openai/gpt-3.5-turbo'
      });
    }

    const setting = settings[0];
    res.json({
      llm_provider: setting.llm_provider,
      openrouter_api_key: setting.openrouter_api_key ? '***' : null,
      selected_model: setting.selected_model
    });
  } catch (error) {
    console.error('GetUserSettings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
};