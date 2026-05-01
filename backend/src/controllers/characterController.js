import pool from '../config/database.js';

export const getCharacters = async (req, res) => {
  try {
    const { search, visibility = 'public' } = req.query;

    let sql = `
      SELECT c.*, u.username as creator_username
      FROM characters c
      JOIN users u ON c.creator_id = u.id
      WHERE c.visibility = ?
    `;
    const params = [visibility];

    if (search) {
      sql += ' AND (c.name LIKE ? OR c.description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    sql += ' ORDER BY c.created_at DESC';

    const [characters] = await pool.execute(sql, params);

    res.json(characters);
  } catch (error) {
    console.error('GetCharacters error:', error);
    res.status(500).json({ error: 'Failed to get characters' });
  }
};

export const getCharacterById = async (req, res) => {
  try {
    const { id } = req.params;

    const [characters] = await pool.execute(
      `SELECT c.*, u.username as creator_username
       FROM characters c
       JOIN users u ON c.creator_id = u.id
       WHERE c.id = ?`,
      [id]
    );

    if (characters.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const character = characters[0];
    if (character.visibility === 'private' && character.creator_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(character);
  } catch (error) {
    console.error('GetCharacterById error:', error);
    res.status(500).json({ error: 'Failed to get character' });
  }
};

export const getMyCharacters = async (req, res) => {
  try {
    const [characters] = await pool.execute(
      `SELECT c.*, u.username as creator_username
       FROM characters c
       JOIN users u ON c.creator_id = u.id
       WHERE c.creator_id = ?
       ORDER BY c.created_at DESC`,
      [req.userId]
    );

    res.json(characters);
  } catch (error) {
    console.error('GetMyCharacters error:', error);
    res.status(500).json({ error: 'Failed to get characters' });
  }
};

export const createCharacter = async (req, res) => {
  try {
    const { name, description, greeting, example_dialogues, visibility = 'private', avatar_url, category } = req.body;

    if (!name || !greeting) {
      return res.status(400).json({ error: 'Name and greeting are required' });
    }

    const [result] = await pool.execute(
      `INSERT INTO characters (creator_id, name, description, greeting, example_dialogues, visibility, avatar_url, category)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, name, description, greeting, example_dialogues, visibility, avatar_url, category]
    );

    const [characters] = await pool.execute('SELECT * FROM characters WHERE id = ?', [result.insertId]);

    res.status(201).json(characters[0]);
  } catch (error) {
    console.error('CreateCharacter error:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
};

export const updateCharacter = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, greeting, example_dialogues, visibility, avatar_url, category } = req.body;

    const [existing] = await pool.execute('SELECT * FROM characters WHERE id = ? AND creator_id = ?', [id, req.userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Character not found or access denied' });
    }

    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (greeting !== undefined) { updates.push('greeting = ?'); params.push(greeting); }
    if (example_dialogues !== undefined) { updates.push('example_dialogues = ?'); params.push(example_dialogues); }
    if (visibility !== undefined) { updates.push('visibility = ?'); params.push(visibility); }
    if (avatar_url !== undefined) { updates.push('avatar_url = ?'); params.push(avatar_url); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    await pool.execute(`UPDATE characters SET ${updates.join(', ')} WHERE id = ?`, params);

    const [characters] = await pool.execute('SELECT * FROM characters WHERE id = ?', [id]);

    res.json(characters[0]);
  } catch (error) {
    console.error('UpdateCharacter error:', error);
    res.status(500).json({ error: 'Failed to update character' });
  }
};

export const deleteCharacter = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute('SELECT * FROM characters WHERE id = ? AND creator_id = ?', [id, req.userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Character not found or access denied' });
    }

    await pool.execute('DELETE FROM characters WHERE id = ?', [id]);

    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('DeleteCharacter error:', error);
    res.status(500).json({ error: 'Failed to delete character' });
  }
};