import React from 'react';
import type { HistoryEntry } from '../types';

interface HistoryPanelProps {
  history: HistoryEntry[];
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history }) => {
  return (
    <div className="w-full bg-[var(--color-background-start)] flex flex-col h-full">
      <h2 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--color-accent)] border-b-2 border-[var(--color-primary)]/30 pb-3 mb-4 flex-shrink-0">
        Journey So Far
      </h2>
      <div className="flex-grow overflow-y-auto pr-2">
        <div className="flex flex-col-reverse gap-6">
          {history.map((entry, index) => (
            <div key={index} className="bg-[var(--color-surface)] p-4 rounded-lg shadow-md flex items-start gap-4 transition-all duration-300 hover:bg-[var(--color-background-end)]">
              <img
                src={entry.image}
                alt="A past scene"
                className="w-16 h-16 object-cover rounded-md flex-shrink-0"
              />
              <div>
                <p className="text-[var(--color-text-muted)] text-sm line-clamp-3 font-[var(--font-body)]">
                  {entry.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        {history.length === 0 && (
            <p className="text-[var(--color-text-muted)] text-center mt-8">Your legend has yet to be written.</p>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
