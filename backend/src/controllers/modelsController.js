import llmService from '../services/llm.js';

export const getOpenRouterModels = async (req, res) => {
  try {
    const models = await llmService.listModels('OPENROUTER');

    const popularModels = [
      { id: 'openai/gpt-4', name: 'GPT-4', description: 'Most capable model' },
      { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Fast GPT-4' },
      { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and capable' },
      { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', description: 'Anthropic\'s most capable' },
      { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced' },
      { id: 'google/gemini-pro', name: 'Gemini Pro', description: 'Google\'s model' },
      { id: 'meta/llama-3-70b', name: 'Llama 3 70B', description: 'Meta open model' },
      { id: 'mistralai/mistral-7b', name: 'Mistral 7B', description: 'Mistral open model' }
    ];

    res.json(popularModels);
  } catch (error) {
    console.error('GetOpenRouterModels error:', error);
    res.status(500).json({ error: 'Failed to get models' });
  }
};

export const getOllamaModels = async (req, res) => {
  try {
    const models = await llmService.listModels('OLLAMA');

    if (models.length === 0) {
      res.json([
        { id: 'llama2', name: 'Llama 2', description: 'Meta Llama 2' },
        { id: 'mistral', name: 'Mistral', description: 'Mistral AI' },
        { id: 'codellama', name: 'CodeLlama', description: 'Code-focused model' }
      ]);
      return;
    }

    res.json(models);
  } catch (error) {
    console.error('GetOllamaModels error:', error);
    res.status(500).json({ error: 'Failed to get Ollama models' });
  }
};