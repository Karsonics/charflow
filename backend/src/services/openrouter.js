import axios from 'axios';
import config from '../config/index.js';

class OpenRouterProvider {
  constructor() {
    this.baseUrl = config.openrouter.baseUrl;
    this.defaultModel = config.openrouter.defaultModel;
  }

  async generateResponse(prompt, config) {
    const { apiKey, model, messages, systemPrompt } = config;

    if (!apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    const modelToUse = model || this.defaultModel;

    const messagesPayload = [];
    if (systemPrompt) {
      messagesPayload.push({ role: 'system', content: systemPrompt });
    }
    if (messages && messages.length > 0) {
      messagesPayload.push(...messages);
    }
    messagesPayload.push({ role: 'user', content: prompt });

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: modelToUse,
          messages: messagesPayload,
          max_tokens: 2048,
          temperature: 0.8,
          top_p: 0.9
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'http://localhost:3001',
            'X-Title': 'CharFlow AI'
          }
        }
      );

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      }

      throw new Error('Invalid response from OpenRouter');
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;
        throw new Error(errorData.error?.message || 'OpenRouter API error');
      }
      throw new Error(`OpenRouter request failed: ${error.message}`);
    }
  }

  async listModels() {
    try {
      const response = await axios.get(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || ''}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to list OpenRouter models:', error.message);
      return [];
    }
  }
}

export default new OpenRouterProvider();