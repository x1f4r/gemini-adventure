import React from 'react';
import type { Scene } from '../types';
import LoadingIndicator from './LoadingIndicator';

interface GameScreenProps {
  scene: Scene | null;
  image: string | null;
  onAction: (action: string) => void;
  isLoading: boolean;
  customActionInput: string;
  onCustomActionInputChange: (value: string) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  scene,
  image,
  onAction,
  isLoading,
  customActionInput,
  onCustomActionInputChange,
}) => {
  const handleCustomActionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (customActionInput.trim() && !isLoading) {
      onAction(customActionInput.trim());
    }
  };

  return (
    <div className="flex-grow flex flex-col bg-[var(--color-background-end)] rounded-lg shadow-2xl overflow-hidden relative h-full">
      {isLoading && <LoadingIndicator message="The world is changing..." />}
      
      <div className="h-1/2 md:h-3/5 xl:h-1/2 min-h-[250px] bg-black relative">
        {image ? (
          <img
            src={image}
            alt={scene?.imagePrompt || "A scene from the adventure"}
            className="w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
            style={{ opacity: isLoading ? 0.5 : 1 }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <p className="text-[var(--color-text-muted)]">Awaiting your destiny...</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background-end)] to-transparent"></div>
      </div>
      
      <div className="p-6 md:p-8 flex flex-col justify-between flex-grow overflow-y-auto">
        <div className="text-[var(--color-text)] font-[var(--font-body)] text-lg leading-relaxed mb-6 max-w-4xl mx-auto">
          <p>{scene?.description}</p>
        </div>
        
        <div className="mt-auto pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {scene?.choices.map((choice, index) => (
                <button
                    key={index}
                    onClick={() => onAction(choice)}
                    disabled={isLoading}
                    className="bg-[var(--color-surface-accent)] text-[var(--color-text)] font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-opacity-75 transform transition-all duration-200 hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {choice}
                </button>
                ))}
            </div>

            <form onSubmit={handleCustomActionSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={customActionInput}
                    onChange={(e) => onCustomActionInputChange(e.target.value)}
                    placeholder="Or, type what you do..."
                    disabled={isLoading}
                    className="flex-grow bg-[var(--color-surface)]/70 border border-[var(--color-surface)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:cursor-not-allowed"
                    aria-label="Custom action input"
                />
                <button
                    type="submit"
                    disabled={isLoading || !customActionInput.trim()}
                    className="bg-[var(--color-primary)] text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-opacity-75 transform transition-all duration-200 hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:scale-100"
                    aria-label="Submit custom action"
                >
                    Do
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;