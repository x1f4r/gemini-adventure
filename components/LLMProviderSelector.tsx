import React, { useState, useEffect } from 'react';
import type { LLMProviderName } from '../services/llmProviders';
import { getLLMProvider } from '../services/llmProviders';
import type { LLMConfig } from '../types';

interface LLMProviderSelectorProps {
  selectedLLMConfig: LLMConfig;
  onLLMConfigChange: (config: LLMConfig) => void;
}

const LLMProviderSelector: React.FC<LLMProviderSelectorProps> = ({
  selectedLLMConfig,
  onLLMConfigChange,
}) => {
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProviderName = e.target.value as LLMProviderName;
    const newConfig: LLMConfig = { provider: newProviderName };
    if (newProviderName === 'Gemini') {
      newConfig.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    } else if (newProviderName === 'LM Studio') {
      newConfig.endpoint = 'http://localhost:1234/v1/chat/completions';
    } else if (newProviderName === 'Ollama') {
      newConfig.endpoint = 'http://localhost:11434/v1/chat/completions';
    }
    onLLMConfigChange(newConfig);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onLLMConfigChange({ ...selectedLLMConfig, apiKey: e.target.value });
  };

  const handleEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onLLMConfigChange({ ...selectedLLMConfig, endpoint: e.target.value });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onLLMConfigChange({ ...selectedLLMConfig, model: e.target.value });
  };

  useEffect(() => {
    const fetchModels = async () => {
      if (selectedLLMConfig.provider !== 'Gemini') {
        try {
          const provider = getLLMProvider(selectedLLMConfig);
          if (provider.getAvailableModels) {
            const models = await provider.getAvailableModels(selectedLLMConfig);
            setAvailableModels(models);
            if (models.length > 0 && !selectedLLMConfig.model) {
              onLLMConfigChange({ ...selectedLLMConfig, model: models[0] });
            }
          }
        } catch (error) {
          console.error('Error fetching models:', error);
          setAvailableModels([]);
        }
      } else {
        setAvailableModels(['gemini-2.5-flash', 'gemini-2.5-pro']);
        if (!selectedLLMConfig.model) {
          onLLMConfigChange({ ...selectedLLMConfig, model: 'gemini-2.5-pro' });
        }
      }
    };
    fetchModels();
  }, [selectedLLMConfig.provider, selectedLLMConfig.endpoint]);

  return (
    <div className="w-full space-y-4">
      <div>
        <label htmlFor="llm-provider-select" className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Language Model Provider</label>
        <select
          id="llm-provider-select"
          value={selectedLLMConfig.provider}
          onChange={handleProviderChange}
          className="appearance-none bg-[var(--color-surface)] border-2 border-[var(--color-primary)] text-[var(--color-text)] text-base font-semibold rounded-lg shadow-md focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] block w-full pl-4 pr-10 py-3 transition-colors duration-300"
        >
          <option value="Gemini">Gemini</option>
          <option value="LM Studio">LM Studio</option>
          <option value="Ollama">Ollama</option>
        </select>
      </div>

      {selectedLLMConfig.provider === 'Gemini' && (
        <div>
          <label htmlFor="gemini-api-key" className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Gemini API Key</label>
          <input
            type="password"
            id="gemini-api-key"
            value={selectedLLMConfig.apiKey || ''}
            onChange={handleApiKeyChange}
            className="bg-[var(--color-surface)] border-2 border-[var(--color-primary)] text-[var(--color-text)] text-base font-semibold rounded-lg shadow-md focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] block w-full pl-4 pr-10 py-3 transition-colors duration-300"
            placeholder="Enter your Gemini API Key"
          />
        </div>
      )}

      {(selectedLLMConfig.provider === 'LM Studio' || selectedLLMConfig.provider === 'Ollama') && (
        <>
          <div>
            <label htmlFor="local-endpoint" className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Local Server Endpoint</label>
            <input
              type="text"
              id="local-endpoint"
              value={selectedLLMConfig.endpoint || ''}
              onChange={handleEndpointChange}
              className="bg-[var(--color-surface)] border-2 border-[var(--color-primary)] text-[var(--color-text)] text-base font-semibold rounded-lg shadow-md focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] block w-full pl-4 pr-10 py-3 transition-colors duration-300"
              placeholder="e.g., http://localhost:1234/v1/chat/completions"
            />
          </div>
          <div>
            <label htmlFor="local-model-select" className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Model</label>
            <select
              id="local-model-select"
              value={selectedLLMConfig.model || ''}
              onChange={handleModelChange}
              className="appearance-none bg-[var(--color-surface)] border-2 border-[var(--color-primary)] text-[var(--color-text)] text-base font-semibold rounded-lg shadow-md focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] block w-full pl-4 pr-10 py-3 transition-colors duration-300"
            >
              {availableModels.length > 0 ? (
                availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))
              ) : (
                <option value="">No models found</option>
              )}
            </select>
          </div>
        </>
      )}
    </div>
  );
};

export default LLMProviderSelector;
