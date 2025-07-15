import React, { useState } from 'react';
import { scenarios } from '../data/scenarios';
import type { ScenarioTemplate, ImageProvider, LLMConfig } from '../types';
import LLMProviderSelector from './LLMProviderSelector';

interface NewAdventureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (prompt: string, llmConfig: LLMConfig, imageProvider: ImageProvider) => void;
  selectedLLMConfig: LLMConfig;
  onLLMConfigChange: (config: LLMConfig) => void;
  imageProviders: ImageProvider[];
  defaultImageProvider: ImageProvider;
}

const NewAdventureModal: React.FC<NewAdventureModalProps> = ({ 
  isOpen, 
  onClose, 
  onStart,
  selectedLLMConfig,
  onLLMConfigChange,
  imageProviders,
  defaultImageProvider 
}) => {
  const [activeTab, setActiveTab] = useState<'select' | 'custom'>('select');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioTemplate | null>(scenarios[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImageProvider>(defaultImageProvider);


  if (!isOpen) return null;

  const handleStart = () => {
    if (activeTab === 'select' && selectedScenario) {
      onStart(selectedScenario.prompt, selectedLLMConfig, selectedImage);
    } else if (activeTab === 'custom' && customPrompt.trim()) {
      onStart(customPrompt.trim(), selectedLLMConfig, selectedImage);
    }
  };
  
  const categories = Array.from(new Set(scenarios.map(s => s.category)));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[var(--color-background-end)] rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[var(--color-primary)]/20">
          <h2 className="font-[var(--font-heading)] text-3xl font-bold text-[var(--color-accent)]">Create New Adventure</h2>
        </div>
        
        <div className="flex-shrink-0 border-b border-[var(--color-surface)] px-6">
            <nav className="flex -mb-px gap-6">
                <button onClick={() => setActiveTab('select')} className={`py-4 px-1 text-center border-b-2 font-semibold text-sm transition-colors duration-200 ${activeTab === 'select' ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>
                    Choose a Scenario
                </button>
                <button onClick={() => setActiveTab('custom')} className={`py-4 px-1 text-center border-b-2 font-semibold text-sm transition-colors duration-200 ${activeTab === 'custom' ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>
                    Write Your Own
                </button>
            </nav>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {activeTab === 'select' ? (
            <div className="flex gap-6 h-full">
              <div className="w-1/3 overflow-y-auto pr-2 space-y-4">
                 {categories.map(category => (
                    <div key={category}>
                        <h3 className="font-bold text-lg text-[var(--color-text)] mb-2">{category}</h3>
                        {scenarios.filter(s => s.category === category).map(scenario => (
                        <div
                            key={scenario.id}
                            onClick={() => setSelectedScenario(scenario)}
                            className={`p-3 rounded-md cursor-pointer transition-all duration-200 ${selectedScenario?.id === scenario.id ? 'bg-[var(--color-primary)]/80 shadow-lg' : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-accent)]'}`}
                        >
                            <p className={`font-semibold ${selectedScenario?.id === scenario.id ? 'text-white' : 'text-[var(--color-text)]'}`}>{scenario.title}</p>
                        </div>
                        ))}
                    </div>
                ))}
              </div>
              <div className="w-2/3 bg-[var(--color-surface)] rounded-lg p-4 flex flex-col">
                {selectedScenario && (
                  <>
                    <img src={selectedScenario.image} alt={selectedScenario.title} className="w-full h-48 object-cover rounded-md mb-4" />
                    <h3 className="font-bold text-xl text-[var(--color-accent)] font-[var(--font-heading)]">{selectedScenario.title}</h3>
                    <p className="text-[var(--color-text-muted)] mt-2 text-sm flex-grow">{selectedScenario.prompt}</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-xl text-[var(--color-text)] mb-2">Craft Your Beginning</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">Write a few sentences to set the scene for your new adventure. The AI will take it from there.</p>
              <textarea
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                rows={10}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-surface)] rounded-lg p-4 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="e.g., You are a lighthouse keeper on a remote, storm-wracked island. One night, the light goes out, and you hear a strange song from the rocks below..."
              />
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-[var(--color-primary)]/20 flex justify-between items-center">
            <div className="flex gap-4">
                <LLMProviderSelector
                  selectedLLMConfig={selectedLLMConfig}
                  onLLMConfigChange={onLLMConfigChange}
                />
                <div className="flex items-center gap-2">
                    <label htmlFor="image-provider" className="text-sm font-semibold text-[var(--color-text-muted)]">Images:</label>
                    <select
                        id="image-provider"
                        value={selectedImage.name}
                        onChange={e => setSelectedImage(imageProviders.find(p => p.name === e.target.value)!)}
                        className="bg-[var(--color-surface)] border border-[var(--color-surface)] rounded-md p-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    >
                        {imageProviders.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex gap-4">
                <button onClick={onClose} className="bg-[var(--color-surface-accent)] text-[var(--color-text)] font-semibold py-2 px-4 rounded-lg hover:bg-[var(--color-primary)] transition-colors">
                    Cancel
                </button>
                <button 
                    onClick={handleStart} 
                    disabled={(activeTab === 'select' && !selectedScenario) || (activeTab === 'custom' && !customPrompt.trim())}
                    className="font-bold bg-[var(--color-primary)] text-white py-2 px-5 rounded-md hover:bg-[var(--color-primary-hover)] transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    Begin Adventure
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NewAdventureModal;