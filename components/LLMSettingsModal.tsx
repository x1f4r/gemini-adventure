import React from 'react';
import LLMProviderSelector from './LLMProviderSelector';
import type { LLMConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  llmConfig: LLMConfig;
  onLLMConfigChange: (c: LLMConfig) => void;
}

const LLMSettingsModal: React.FC<Props> = ({ isOpen, onClose, llmConfig, onLLMConfigChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[var(--color-background-end)] rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[var(--color-primary)]/20">
          <h2 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--color-accent)]">LLM Settings</h2>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <LLMProviderSelector selectedLLMConfig={llmConfig} onLLMConfigChange={onLLMConfigChange} />
        </div>
        <div className="p-4 border-t border-[var(--color-primary)]/20 text-right">
          <button onClick={onClose} className="bg-[var(--color-surface-accent)] text-[var(--color-text)] font-semibold py-2 px-4 rounded-lg hover:bg-[var(--color-primary)] transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LLMSettingsModal;

