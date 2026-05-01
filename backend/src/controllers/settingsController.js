import pool from '../config/database.js';
import { encrypt, decrypt } from '../utils/crypto.js';

export const getLLMSettings = async (req, res) => {
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
    console.error('GetLLMSettings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
};

export const updateLLMSettings = async (req, res) => {
  try {
    const { llm_provider, openrouter_api_key, selected_model } = req.body;

    const [existing] = await pool.execute('SELECT * FROM user_settings WHERE user_id = ?', [req.userId]);

    let apiKeyEncrypted = null;
    if (openrouter_api_key && openrouter_api_key !== '***') {
      apiKeyEncrypted = encrypt(openrouter_api_key);
    }

    if (existing.length > 0) {
      const updates = [];
      const params = [];

      if (llm_provider) {
        updates.push('llm_provider = ?');
        params.push(llm_provider);
      }
      if (apiKeyEncrypted) {
        updates.push('openrouter_api_key = ?');
        params.push(apiKeyEncrypted);
      }
      if (selected_model) {
        updates.push('selected_model = ?');
        params.push(selected_model);
      }

      if (updates.length > 0) {
        params.push(req.userId);
        await pool.execute(`UPDATE user_settings SET ${updates.join(', ')} WHERE user_id = ?`, params);
      }
    } else {
      await pool.execute(
        'INSERT INTO user_settings (user_id, llm_provider, openrouter_api_key, selected_model) VALUES (?, ?, ?, ?)',
        [req.userId, llm_provider || 'OPENROUTER', apiKeyEncrypted, selected_model || 'openai/gpt-3.5-turbo']
      );
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('UpdateLLMSettings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};