import React from 'react';
import type { NPC } from '../types';

interface CharacterPanelProps {
  npcs: NPC[];
}

const CharacterPanel: React.FC<CharacterPanelProps> = ({ npcs }) => {
  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--color-accent)] border-b-2 border-[var(--color-primary)]/30 pb-3 mb-4 flex-shrink-0">
        Characters
      </h2>
      <div className="flex-grow overflow-y-auto pr-2">
        {npcs.length > 0 ? (
          <ul className="space-y-4">
            {npcs.map((npc) => (
              <li key={npc.id} className="bg-[var(--color-surface)] p-4 rounded-lg shadow-sm transition-all duration-200 hover:bg-[var(--color-background-end)]">
                <h3 className="font-bold text-lg text-[var(--color-accent)] font-[var(--font-heading)]">{npc.name}</h3>
                <p className="text-sm text-[var(--color-text)] mt-1 font-[var(--font-body)]">{npc.description}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-2 font-mono">Status: {npc.status}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[var(--color-text-muted)] text-center mt-8">You haven't met anyone of note yet.</p>
        )}
      </div>
    </div>
  );
};

export default CharacterPanel;
