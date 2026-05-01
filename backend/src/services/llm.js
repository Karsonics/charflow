import openrouter from './openrouter.js';
import ollama from './ollama.js';

class LLMService {
  constructor() {
    this.providers = {
      OPENROUTER: openrouter,
      OLLAMA: ollama
    };
  }

  async generateResponse(prompt, config) {
    const { provider, apiKey, model, messages, systemPrompt } = config;

    const providerInstance = this.providers[provider];
    if (!providerInstance) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    return providerInstance.generateResponse(prompt, {
      apiKey,
      model,
      messages,
      systemPrompt
    });
  }

  async listModels(provider) {
    const providerInstance = this.providers[provider];
    if (!providerInstance) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    return providerInstance.listModels();
  }

  async checkConnection(provider) {
    if (provider === 'OLLAMA') {
      return ollama.checkConnection();
    }
    return true;
  }
}

export default new LLMService();