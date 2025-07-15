import React from 'react';
import type { SaveData } from '../types';

interface LoadGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  saves: SaveData[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onViewNotes: (save: SaveData) => void;
}

const LoadGameModal: React.FC<LoadGameModalProps> = ({ isOpen, onClose, saves, onLoad, onDelete, onViewNotes }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[var(--color-background-end)] rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[var(--color-primary)]/20">
          <h2 className="font-[var(--font-heading)] text-3xl font-bold text-[var(--color-accent)]">Load Adventure</h2>
        </div>
        <div className="p-6 overflow-y-auto">
          {saves.length === 0 ? (
            <p className="text-[var(--color-text-muted)] text-center">No saved adventures found.</p>
          ) : (
            <ul className="space-y-4">
              {saves.map(save => (
                <li key={save.id} className="bg-[var(--color-surface)] p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className='flex-grow'>
                    <p className="font-bold text-lg text-[var(--color-text)]">
                      Adventure - <span className='font-normal text-[var(--color-text-muted)]'>{new Date(save.lastPlayed).toLocaleString()}</span>
                    </p>
                    <p className='text-sm text-[var(--color-text-muted)]'>{save.history[0]?.description.substring(0, 80) ?? 'A new beginning...'}...</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                     <button onClick={() => onViewNotes(save)} className="text-sm font-semibold text-[var(--color-text-muted)] py-2 px-3 rounded-md hover:bg-[var(--color-background-end)] transition-colors">View Notes</button>
                    <button onClick={() => onDelete(save.id)} className="text-sm font-semibold text-red-400 py-2 px-3 rounded-md hover:bg-red-500/20 transition-colors">Delete</button>
                    <button onClick={() => onLoad(save.id)} className="font-bold bg-[var(--color-primary)] text-white py-2 px-5 rounded-md hover:bg-[var(--color-primary-hover)] transition-colors">Load</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
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

export default LoadGameModal;
