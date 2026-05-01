import axios from 'axios';
import config from '../config/index.js';

class OllamaProvider {
  constructor() {
    this.baseUrl = config.ollama.baseUrl;
    this.defaultModel = config.ollama.defaultModel;
  }

  async generateResponse(prompt, config) {
    const { model, messages, systemPrompt } = config;

    const modelToUse = model || this.defaultModel;

    const formattedPrompt = this.buildPrompt(systemPrompt, messages, prompt);

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model: modelToUse,
          prompt: formattedPrompt,
          stream: false,
          options: {
            temperature: 0.8,
            top_p: 0.9
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 120000
        }
      );

      if (response.data && response.data.response) {
        return response.data.response.trim();
      }

      throw new Error('Invalid response from Ollama');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Ollama is not running. Please start Ollama first.');
      }
      if (error.response) {
        throw new Error(`Ollama error: ${error.response.data?.error || error.message}`);
      }
      throw new Error(`Ollama request failed: ${error.message}`);
    }
  }

  buildPrompt(systemPrompt, messages, currentPrompt) {
    let prompt = '';

    if (systemPrompt) {
      prompt += `System: ${systemPrompt}\n\n`;
    }

    if (messages && messages.length > 0) {
      for (const msg of messages) {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        prompt += `${role}: ${msg.content}\n`;
      }
    }

    prompt += `User: ${currentPrompt}\n`;
    prompt += `Assistant:`;

    return prompt;
  }

  async listModels() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 10000
      });

      if (response.data && response.data.models) {
        return response.data.models.map(m => ({
          id: m.name,
          name: m.name,
          modified_at: m.modified_at
        }));
      }

      return [];
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('Ollama is not running');
        return [];
      }
      console.error('Failed to list Ollama models:', error.message);
      return [];
    }
  }

  async checkConnection() {
    try {
      await axios.get(`${this.baseUrl}/api/tags`, { timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new OllamaProvider();