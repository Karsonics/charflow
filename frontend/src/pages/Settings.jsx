import { useState, useEffect } from 'react';
import { settingsAPI, modelsAPI } from '../services/api';

export default function Settings() {
  const [settings, setSettings] = useState({
    llm_provider: 'OPENROUTER',
    openrouter_api_key: '',
    selected_model: 'openai/gpt-3.5-turbo'
  });
  const [models, setModels] = useState({ openrouter: [], ollama: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
    loadModels();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await settingsAPI.getLLM();
      setSettings(prev => ({
        ...prev,
        ...res.data,
        openrouter_api_key: ''
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async () => {
    try {
      const [or, ol] = await Promise.all([
        modelsAPI.getOpenRouter().catch(() => ({ data: [] })),
        modelsAPI.getOllama().catch(() => ({ data: [] }))
      ]);
      setModels({ openrouter: or.data || [], ollama: ol.data || [] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError('');

    try {
      await settingsAPI.updateLLM(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="container">
        <div className="settings-card">
          <h1>LLM Provider Settings</h1>
          <p className="text-muted">
            Configure which LLM provider to use for AI responses.
          </p>

          {error && <div className="error alert">{error}</div>}
          {saved && <div className="success alert">Settings saved!</div>}

          <div className="form-group">
            <label className="form-label">Provider</label>
            <select
              value={settings.llm_provider}
              onChange={e => setSettings({ ...settings, llm_provider: e.target.value })}
            >
              <option value="OPENROUTER">OpenRouter (Cloud)</option>
              <option value="OLLAMA">Ollama (Local)</option>
            </select>
          </div>

          {settings.llm_provider === 'OPENROUTER' && (
            <>
              <div className="form-group">
                <label className="form-label">API Key</label>
                <input
                  type="password"
                  value={settings.openrouter_api_key || ''}
                  onChange={e => setSettings({ ...settings, openrouter_api_key: e.target.value })}
                  placeholder="sk-or-..."
                />
                <span className="form-help">
                  Get your API key from{' '}
                  <a href="https://openrouter.ai/keys" target="_blank" rel="noopener">
                    openrouter.ai
                  </a>
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Model</label>
                <select
                  value={settings.selected_model}
                  onChange={e => setSettings({ ...settings, selected_model: e.target.value })}
                >
                  <optgroup label="OpenAI">
                    <option value="openai/gpt-4">GPT-4</option>
                    <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </optgroup>
                  <optgroup label="Anthropic">
                    <option value="anthropic/claude-3-opus">Claude 3 Opus</option>
                    <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet</option>
                  </optgroup>
                  <optgroup label="Google">
                    <option value="google/gemini-pro">Gemini Pro</option>
                  </optgroup>
                  <optgroup label="Meta">
                    <option value="meta/llama-3-70b">Llama 3 70B</option>
                  </optgroup>
                </select>
              </div>
            </>
          )}

          {settings.llm_provider === 'OLLAMA' && (
            <div className="form-group">
              <label className="form-label">Model</label>
              <select
                value={settings.selected_model}
                onChange={e => setSettings({ ...settings, selected_model: e.target.value })}
              >
                {models.ollama.length > 0 ? (
                  models.ollama.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.id}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="llama2">Llama 2</option>
                    <option value="mistral">Mistral</option>
                    <option value="codellama">CodeLlama</option>
                  </>
                )}
              </select>
              <span className="form-help">
                Make sure Ollama is running locally (
                <code>ollama serve</code>)
              </span>
            </div>
          )}

          <button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <style>{`
        .settings-page {
          padding: 2rem 0;
        }
        .settings-card {
          max-width: 500px;
          margin: 0 auto;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 2rem;
        }
        .settings-card h1 {
          margin-bottom: 0.5rem;
        }
        .form-help {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .success {
          color: var(--success);
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid var(--success);
        }
        .alert {
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}