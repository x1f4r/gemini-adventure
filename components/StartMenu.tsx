import React, { useState, useEffect } from 'react';

interface StartMenuProps {
    onNewGame: () => void;
    onLoadGame: () => void;
    onSettings: () => void;
}

const backgroundImages = [
    'https://images.unsplash.com/photo-1476231682828-37e571bc172f?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1484291379182-23945a16314f?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
];

const StartMenu: React.FC<StartMenuProps> = ({ onNewGame, onLoadGame, onSettings }) => {
    const [currentBgIndex, setCurrentBgIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentBgIndex(prevIndex => (prevIndex + 1) % backgroundImages.length);
        }, 7000); // Change image every 7 seconds

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="w-full h-screen flex items-center justify-center bg-cover bg-center transition-all duration-1000" style={{backgroundImage: `url('${backgroundImages[currentBgIndex]}')`}}>
           <div className="bg-black/70 p-12 rounded-lg text-center backdrop-blur-md max-w-3xl shadow-2xl">
                <h1 className="font-heading text-6xl font-bold text-white mb-4 drop-shadow-lg">Gemini Adventure</h1>
                <p className="text-xl text-text-muted font-body mb-8 max-w-2xl mx-auto">
                  Your fate is unwritten. A story of magic and peril awaits, crafted at every turn by generative AI.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => onNewGame()}
                        className="btn btn-primary text-xl py-3 px-8"
                    >
                        New Adventure
                    </button>
                    <button
                        onClick={onLoadGame}
                        className="btn btn-secondary text-xl py-3 px-8"
                    >
                        Load Adventure
                    </button>
                    <button
                        onClick={onSettings}
                        className="btn btn-secondary text-xl py-3 px-8"
                    >
                        Settings
                    </button>
                </div>
           </div>
       </div>
    );
};

export default StartMenu;
