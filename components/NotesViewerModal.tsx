import React from 'react';
import type { SaveData } from '../types';

interface NotesViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  saveData: SaveData | null;
}

const NotesViewerModal: React.FC<NotesViewerModalProps> = ({ isOpen, onClose, saveData }) => {
  if (!isOpen || !saveData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[var(--color-background-end)] rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[var(--color-primary)]/20">
          <h2 className="font-[var(--font-heading)] text-3xl font-bold text-[var(--color-accent)]">Internal Notes</h2>
          <p className="text-[var(--color-text-muted)]">This is the context the AI uses to shape your story.</p>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
            <div>
                <h3 className="font-semibold text-xl text-[var(--color-primary)] mb-2">Inventory</h3>
                <div className="bg-[var(--color-surface)] p-4 rounded-md">
                    {saveData.inventory.length > 0 ? (
                        <ul className="list-disc list-inside text-[var(--color-text)]">
                            {saveData.inventory.map(item => <li key={item}>{item}</li>)}
                        </ul>
                    ) : (
                        <p className="text-[var(--color-text-muted)]">No items in inventory.</p>
                    )}
                </div>
            </div>
             <div>
                <h3 className="font-semibold text-xl text-[var(--color-primary)] mb-2">World State</h3>
                 <div className="bg-[var(--color-surface)] p-4 rounded-md">
                    {Object.keys(saveData.worldState).length > 0 ? (
                        <ul className="space-y-1 text-[var(--color-text)]">
                            {Object.entries(saveData.worldState).map(([key, value]) => (
                                <li key={key}><strong className="font-medium">{key}:</strong> {value}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-[var(--color-text-muted)]">No persistent world facts established.</p>
                    )}
                </div>
            </div>
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

export default NotesViewerModal;
