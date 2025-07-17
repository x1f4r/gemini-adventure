import React from 'react';

interface StartMenuProps {
    onNewGame: () => void;
    onLoadGame: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ onNewGame, onLoadGame }) => {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-background-start)] to-[var(--color-background-end)]">
           <div className="bg-[var(--color-surface)]/50 p-12 rounded-lg text-center backdrop-blur-md max-w-3xl shadow-2xl border border-[var(--color-primary)]/20">
                <h1 className="font-[var(--font-heading)] text-6xl font-bold text-[var(--color-accent)] mb-4 drop-shadow-lg">Gemini Adventure</h1>
                <p className="text-xl text-[var(--color-text-muted)] font-[var(--font-body)] mb-8 max-w-2xl mx-auto">
                  Your fate is unwritten. A story of magic and peril awaits, crafted at every turn by generative AI.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => onNewGame()}
                      className="bg-[var(--color-primary)] text-white font-[var(--font-heading)] font-bold text-xl py-3 px-8 rounded-lg shadow-xl hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--color-accent)] focus:ring-opacity-75 transform transition-all duration-300 hover:scale-105"
                    >
                      New Adventure
                    </button>
                    <button
                      onClick={onLoadGame}
                      className="bg-[var(--color-surface-accent)] text-[var(--color-text)] font-[var(--font-heading)] font-bold text-xl py-3 px-8 rounded-lg shadow-xl hover:bg-[var(--color-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--color-accent)] focus:ring-opacity-75 transform transition-all duration-300 hover:scale-105"
                    >
                      Load Adventure
                    </button>
                </div>
           </div>
       </div>
    );
};

export default StartMenu;
