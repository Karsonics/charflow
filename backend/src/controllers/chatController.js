import pool from '../config/database.js';
import llmService from '../services/llm.js';
import { encrypt, decrypt } from '../utils/crypto.js';

export const startChat = async (req, res) => {
  try {
    const { characterId, providerOverride, modelOverride, title } = req.body;

    if (!characterId) {
      return res.status(400).json({ error: 'Character ID is required' });
    }

    const [characters] = await pool.execute('SELECT * FROM characters WHERE id = ?', [characterId]);
    if (characters.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const character = characters[0];
    if (character.visibility === 'private' && character.creator_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [settings] = await pool.execute('SELECT * FROM user_settings WHERE user_id = ?', [req.userId]);
    const userSettings = settings[0] || { llm_provider: 'OPENROUTER', selected_model: 'openai/gpt-3.5-turbo' };

    const provider = providerOverride || userSettings.llm_provider;
    let apiKey = null;
    if (provider === 'OPENROUTER' && userSettings.openrouter_api_key) {
      apiKey = decrypt(userSettings.openrouter_api_key);
    }

    const model = modelOverride || userSettings.selected_model;

    const chatTitle = title || `Chat with ${character.name}`;

    const [chatResult] = await pool.execute(
      'INSERT INTO chats (title, provider_override, model_override) VALUES (?, ?, ?)',
      [chatTitle, providerOverride || null, modelOverride || null]
    );
    const chatId = chatResult.insertId;

    await pool.execute(
      'INSERT INTO chat_participants (chat_id, user_id, character_id, role) VALUES (?, ?, ?, ?)',
      [chatId, req.userId, characterId, 'user']
    );

    const greeting = character.greeting || `Hello! I'm ${character.name}.`;

    const [greetingMessage] = await pool.execute(
      'INSERT INTO messages (chat_id, sender_type, sender_id, content) VALUES (?, ?, ?, ?)',
      [chatId, 'character', characterId, greeting]
    );

    res.status(201).json({
      id: chatId,
      title: chatTitle,
      character: {
        id: character.id,
        name: character.name,
        description: character.description,
        greeting: character.greeting,
        avatar_url: character.avatar_url
      },
      provider,
      model,
      messages: [{ 
        id: greetingMessage.insertId, 
        sender_type: 'character', 
        sender_id: characterId, 
        content: greeting,
        sender_name: character.name,
        sender_avatar: character.avatar_url
      }]
    });
  } catch (error) {
    console.error('StartChat error:', error);
    res.status(500).json({ error: 'Failed to start chat' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chatId, content, regenerate = false } = req.body;

    if (!chatId || !content) {
      return res.status(400).json({ error: 'Chat ID and content are required' });
    }

    const [participants] = await pool.execute(
      'SELECT * FROM chat_participants WHERE chat_id = ? AND user_id = ?',
      [chatId, req.userId]
    );
    if (participants.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [chats] = await pool.execute('SELECT * FROM chats WHERE id = ?', [chatId]);
    const chat = chats[0];

    const [chars] = await pool.execute(
      'SELECT c.* FROM chat_participants cp JOIN characters c ON cp.character_id = c.id WHERE cp.chat_id = ? AND cp.character_id IS NOT NULL',
      [chatId]
    );
    if (chars.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const character = chars[0];

    const [userSettings] = await pool.execute('SELECT * FROM user_settings WHERE user_id = ?', [req.userId]);
    const settings = userSettings[0] || { llm_provider: 'OPENROUTER', selected_model: 'openai/gpt-3.5-turbo', openrouter_api_key: null };

    const provider = chat.provider_override || settings.llm_provider;
    let apiKey = null;
    if (provider === 'OPENROUTER' && settings.openrouter_api_key) {
      apiKey = decrypt(settings.openrouter_api_key);
    }

    const model = chat.model_override || settings.selected_model;

    const [existingMessages] = await pool.execute(
      'SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp ASC',
      [chatId]
    );

    let userMessageId;
    if (regenerate) {
      const lastCharacterMessage = existingMessages.filter(m => m.sender_type === 'character').pop();
      if (lastCharacterMessage) {
        await pool.execute('DELETE FROM messages WHERE id = ?', [lastCharacterMessage.id]);
        await pool.execute('DELETE FROM ratings WHERE message_id = ?', [lastCharacterMessage.id]);
      }
      const lastUserMessage = existingMessages.filter(m => m.sender_type === 'user').pop();
      if (lastUserMessage) {
        userMessageId = lastUserMessage.id;
      }
    } else {
      const [msgResult] = await pool.execute(
        'INSERT INTO messages (chat_id, sender_type, sender_id, content) VALUES (?, ?, ?, ?)',
        [chatId, 'user', req.userId, content]
      );
      userMessageId = msgResult.insertId;
    }

    const historyMessages = existingMessages
      .filter(m => m.id !== (regenerate ? existingMessages.filter(mi => mi.sender_type === 'character').pop()?.id : null))
      .slice(-10)
      .map(m => ({
        role: m.sender_type === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

    const systemPrompt = buildSystemPrompt(character);

    let responseContent;
    try {
      responseContent = await llmService.generateResponse(content, {
        provider,
        apiKey,
        model,
        messages: historyMessages,
        systemPrompt
      });
    } catch (llmError) {
      await pool.execute('DELETE FROM messages WHERE id = ?', [userMessageId]);
      return res.status(502).json({ error: `LLM Error: ${llmError.message}` });
    }

    await pool.execute(
      'UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [chatId]
    );

    const [aiMsgResult] = await pool.execute(
      'INSERT INTO messages (chat_id, sender_type, sender_id, content) VALUES (?, ?, ?, ?)',
      [chatId, 'character', character.id, responseContent]
    );

    const [users] = await pool.execute('SELECT username, avatar_url FROM users WHERE id = ?', [req.userId]);
    const userInfo = users[0] || {};

    res.json({
      userMessage: { 
        id: userMessageId, 
        sender_type: 'user', 
        sender_id: req.userId, 
        content,
        sender_name: userInfo.username || 'You',
        sender_avatar: userInfo.avatar_url
      },
      aiMessage: { 
        id: aiMsgResult.insertId, 
        sender_type: 'character', 
        sender_id: character.id, 
        content: responseContent,
        sender_name: character.name,
        sender_avatar: character.avatar_url
      }
    });
  } catch (error) {
    console.error('SendMessage error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

function buildSystemPrompt(character) {
  let prompt = '';
  const charName = character.name || 'Character';

  if (character.name) {
    prompt += `You are ${character.name}. `;
  }

  if (character.description) {
    prompt += `${character.description} `;
  }

  if (character.example_dialogues) {
    prompt += `\n\nExample dialogues:\n${character.example_dialogues}`;
  }

  prompt += `\n\nAlways stay in character as ${charName}. Be engaging and conversational. Use third-person actions like **${charName} does action**. Example: "${charName}: My my how cute **${charName} looks into your eyes and smirks** your dear~~~". Format: ${charName}: message OR ${charName}: **action** message`;

  return prompt;
}

export const getChat = async (req, res) => {
  try {
    const { id } = req.params;

    const [participants] = await pool.execute(
      'SELECT * FROM chat_participants WHERE chat_id = ? AND (user_id = ? OR character_id IS NOT NULL)',
      [id, req.userId]
    );
    if (participants.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [chats] = await pool.execute('SELECT * FROM chats WHERE id = ?', [id]);
    const chat = chats[0];

    const [messages] = await pool.execute(
      `SELECT m.*, 
        CASE WHEN m.sender_type = 'character' THEN c.name ELSE u.username END as sender_name,
        CASE WHEN m.sender_type = 'character' THEN c.avatar_url ELSE u.avatar_url END as sender_avatar
       FROM messages m
       LEFT JOIN users u ON m.sender_type = 'user' AND m.sender_id = u.id
       LEFT JOIN characters c ON m.sender_type = 'character' AND m.sender_id = c.id
       WHERE m.chat_id = ?
       ORDER BY m.timestamp ASC`,
      [id]
    );

    let ratings = [];
    if (messages.length > 0) {
      const messageIds = messages.map(m => m.id);
      const placeholders = messageIds.map(() => '?').join(',');
      const [ratingsResult] = await pool.execute(
        `SELECT * FROM ratings WHERE message_id IN (${placeholders})`,
        messageIds
      );
      ratings = ratingsResult;
    }

    const messagesWithRatings = messages.map(m => ({
      ...m,
      rating: ratings.find(r => r.message_id === m.id)?.score || 0
    }));

    const [charInfo] = await pool.execute(
      'SELECT c.* FROM chat_participants cp JOIN characters c ON cp.character_id = c.id WHERE cp.chat_id = ?',
      [id]
    );

    res.json({
      chat,
      character: charInfo[0] || null,
      messages: messagesWithRatings
    });
  } catch (error) {
    console.error('GetChat error:', error);
    res.status(500).json({ error: 'Failed to get chat' });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const [chats] = await pool.execute(
      `SELECT c.*, 
        GROUP_CONCAT(DISTINCT ch.name ORDER BY ch.name SEPARATOR ', ') as characters,
        COUNT(m.id) as message_count,
        (SELECT content FROM messages WHERE chat_id = c.id ORDER BY timestamp DESC LIMIT 1) as last_message
       FROM chats c
       INNER JOIN chat_participants cp ON c.id = cp.chat_id AND cp.user_id = ?
       LEFT JOIN chat_participants cp2 ON c.id = cp2.chat_id AND cp2.character_id IS NOT NULL
       LEFT JOIN characters ch ON cp2.character_id = ch.id
       LEFT JOIN messages m ON c.id = m.chat_id
       GROUP BY c.id
       ORDER BY c.updated_at DESC`,
      [req.userId]
    );

    res.json(chats);
  } catch (error) {
    console.error('GetChatHistory error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;

    const [participants] = await pool.execute(
      'SELECT * FROM chat_participants WHERE chat_id = ? AND user_id = ?',
      [id, req.userId]
    );
    if (participants.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.execute('DELETE FROM chats WHERE id = ?', [id]);

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('DeleteChat error:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};

export const rateMessage = async (req, res) => {
  try {
    const { messageId, score } = req.body;

    if (!messageId || !score || score < 1 || score > 4) {
      return res.status(400).json({ error: 'Valid messageId and score (1-4) are required' });
    }

    const [messages] = await pool.execute('SELECT * FROM messages WHERE id = ?', [messageId]);
    if (messages.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const [existing] = await pool.execute('SELECT * FROM ratings WHERE message_id = ?', [messageId]);

    if (existing.length > 0) {
      await pool.execute('UPDATE ratings SET score = ? WHERE message_id = ?', [score, messageId]);
    } else {
      await pool.execute(
        'INSERT INTO ratings (message_id, score, user_id) VALUES (?, ?, ?)',
        [messageId, score, req.userId]
      );
    }

    res.json({ message: 'Rating saved' });
  } catch (error) {
    console.error('RateMessage error:', error);
    res.status(500).json({ error: 'Failed to rate message' });
  }
};