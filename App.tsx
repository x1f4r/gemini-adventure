import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { GameState, Scene, HistoryEntry, ThemeName, SaveData, NPC, ImageProvider, LLMConfig } from './types';
import { getLLMProvider, type LLMProviderName } from './services/llmProviders';
import { ImagenProvider, createComfyUIImageProvider } from './services/imageProviders';
import { getSavedGames, saveGame, deleteGame, loadGame } from './services/saveGameService';

import GameScreen from './components/GameScreen';
import HistoryPanel from './components/HistoryPanel';
import ThemeSelector from './components/ThemeSelector';
import StartMenu from './components/StartMenu';
import LoadGameModal from './components/LoadGameModal';
import NotesViewerModal from './components/NotesViewerModal';
import NewAdventureModal from './components/NewAdventureModal';
import InventoryPanel from './components/InventoryPanel';
import CharacterPanel from './components/CharacterPanel';
import TokenUsageIndicator from './components/TokenUsageIndicator';
import LLMSettingsModal from './components/LLMSettingsModal';
import ImageSettingsModal from './components/ImageSettingsModal';


const themes: Record<ThemeName, Record<string, string>> = {
  FANTASY: { '--font-heading': "'Cinzel', serif", '--font-body': "'Inter', sans-serif", '--color-primary': '#8B5CF6', '--color-primary-hover': '#7C3AED', '--color-background-start': '#111827', '--color-background-end': '#1F2937', '--color-surface': '#374151', '--color-text': '#E5E7EB', '--color-text-muted': '#9CA3AF', '--color-accent': '#A78BFA', '--color-surface-accent': 'rgba(139, 92, 246, 0.3)' },
  CYBERPUNK: { '--font-heading': "'Rajdhani', sans-serif", '--font-body': "'Rajdhani', sans-serif", '--color-primary': '#EC4899', '--color-primary-hover': '#DB2777', '--color-background-start': '#10002B', '--color-background-end': '#240046', '--color-surface': '#1a0b38', '--color-text': '#f2e6ff', '--color-text-muted': '#a288c2', '--color-accent': '#00F6FF', '--color-surface-accent': 'rgba(236, 72, 153, 0.3)' },
  SCI_FI: { '--font-heading': "'Rajdhani', sans-serif", '--font-body': "'Inter', sans-serif", '--color-primary': '#38BDF8', '--color-primary-hover': '#0EA5E9', '--color-background-start': '#0B1120', '--color-background-end': '#131B33', '--color-surface': '#1E293B', '--color-text': '#E2E8F0', '--color-text-muted': '#94A3B8', '--color-accent': '#67E8F9', '--color-surface-accent': 'rgba(56, 189, 248, 0.3)' },
  HORROR: { '--font-heading': "'Playfair Display', serif", '--font-body': "'Inter', sans-serif", '--color-primary': '#DC2626', '--color-primary-hover': '#B91C1C', '--color-background-start': '#000000', '--color-background-end': '#171717', '--color-surface': '#262626', '--color-text': '#A3A3A3', '--color-text-muted': '#525252', '--color-accent': '#EF4444', '--color-surface-accent': 'rgba(220, 38, 38, 0.3)' },
  NOIR: { '--font-heading': "'Playfair Display', serif", '--font-body': "'Inter', sans-serif", '--color-primary': '#D1D5DB', '--color-primary-hover': '#F9FAFB', '--color-background-start': '#1c1c1c', '--color-background-end': '#2d2d2d', '--color-surface': '#404040', '--color-text': '#E5E5E5', '--color-text-muted': '#A3A3A3', '--color-accent': '#F3F4F6', '--color-surface-accent': 'rgba(209, 213, 219, 0.3)' },
  STEAMPUNK: { '--font-heading': "'Almendra SC', serif", '--font-body': "'Inter', sans-serif", '--color-primary': '#B97C4B', '--color-primary-hover': '#A16639', '--color-background-start': '#5A3E2B', '--color-background-end': '#402D1F', '--color-surface': '#6B4F3A', '--color-text': '#EAE0D5', '--color-text-muted': '#B3A595', '--color-accent': '#D4AF37', '--color-surface-accent': 'rgba(185, 124, 75, 0.3)' },
  SOLARPUNK: { '--font-heading': "'Architects Daughter', cursive", '--font-body': "'Inter', sans-serif", '--color-primary': '#34D399', '--color-primary-hover': '#10B981', '--color-background-start': '#F0FFF4', '--color-background-end': '#D1FAE5', '--color-surface': '#FFFFFF', '--color-text': '#1F2937', '--color-text-muted': '#4B5563', '--color-accent': '#FBBF24', '--color-surface-accent': 'rgba(52, 211, 153, 0.3)' },
  POST_APOCALYPTIC: { '--font-heading': "'Special Elite', cursive", '--font-body': "'Inter', sans-serif", '--color-primary': '#A16207', '--color-primary-hover': '#854D0E', '--color-background-start': '#292524', '--color-background-end': '#1C1917', '--color-surface': '#44403C', '--color-text': '#A8A29E', '--color-text-muted': '#78716C', '--color-accent': '#D97706', '--color-surface-accent': 'rgba(161, 98, 7, 0.3)' },
  WESTERN: { '--font-heading': "'Rye', cursive", '--font-body': "'Inter', sans-serif", '--color-primary': '#B45309', '--color-primary-hover': '#92400E', '--color-background-start': '#F7F0E8', '--color-background-end': '#EFE5DA', '--color-surface': '#FDFBF8', '--color-text': '#422006', '--color-text-muted': '#8C5A2D', '--color-accent': '#000000', '--color-surface-accent': 'rgba(180, 83, 9, 0.2)' },
  PIRATE: { '--font-heading': "'Pirata One', cursive", '--font-body': "'Inter', sans-serif", '--color-primary': '#047857', '--color-primary-hover': '#065F46', '--color-background-start': '#082f49', '--color-background-end': '#0c4a6e', '--color-surface': '#173f5f', '--color-text': '#E0F2FE', '--color-text-muted': '#BAE6FD', '--color-accent': '#F59E0B', '--color-surface-accent': 'rgba(4, 120, 87, 0.3)' }
};
const availableThemeNames = Object.keys(themes) as ThemeName[];

const initialGameState: GameState = {
    id: '',
    status: 'menu',
    chat: null,
    history: [],
    currentScene: null,
    currentImage: null,
    isLoading: false,
    error: null,
    currentTheme: 'FANTASY',
    inventory: [],
    worldState: {},
    npcs: [],
};

const defaultComfyEndpoint = 'http://localhost:8188/prompt';

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Almendra+SC&family=Architects+Daughter&family=Cinzel:wght@400;700&family=Inter:wght@400;700&family=Pirata+One&family=Playfair+Display:wght@400;700&family=Rajdhani:wght@400;700&family=Rye&family=Special+Elite&display=swap');
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  `}</style>
);

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [manualTheme, setManualTheme] = useState<ThemeName | 'AUTOMATIC'>('AUTOMATIC');
  const [savedGames, setSavedGames] = useState<SaveData[]>([]);
  const [isLoadModalOpen, setLoadModalOpen] = useState(false);
  const [isNotesModalOpen, setNotesModalOpen] = useState(false);
  const [isNewAdventureModalOpen, setNewAdventureModalOpen] = useState(false);
  const [isLLMSettingsOpen, setLLMSettingsOpen] = useState(false);
  const [notesToView, setNotesToView] = useState<SaveData | null>(null);
  const [activeTab, setActiveTab] = useState<'history' | 'inventory' | 'characters'>('history');
  const [customActionInput, setCustomActionInput] = useState('');
  const [tokenCount, setTokenCount] = useState(0);
  const [isImageSettingsOpen, setImageSettingsOpen] = useState(false);
  const [comfyUIEndpoint, setComfyUIEndpoint] = useState(defaultComfyEndpoint);
  
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    provider: 'Gemini',
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    model: 'gemini-2.5-pro',
  });
  const availableImageProviders = useMemo(() => [
    ImagenProvider,
    createComfyUIImageProvider({ endpoint: comfyUIEndpoint })
  ], [comfyUIEndpoint]);

  const [imageProvider, setImageProvider] = useState<ImageProvider>(availableImageProviders[0]);

  useEffect(() => {
    if (imageProvider.name === 'ComfyUI') {
      setImageProvider(createComfyUIImageProvider({ endpoint: comfyUIEndpoint }));
    }
  }, [comfyUIEndpoint]);

  const llmProvider = getLLMProvider(llmConfig);

  useEffect(() => {
    const fetchSaves = async () => {
      try {
        const games = await getSavedGames();
        setSavedGames(games);
      } catch (error) {
        console.error("Could not fetch saved games:", error);
        setGameState(prev => ({...prev, status: 'error', error: (error as Error).message }));
      }
    };
    fetchSaves();
  }, []);

  useEffect(() => {
    const themeKey = manualTheme === 'AUTOMATIC' ? gameState.currentTheme : manualTheme;
    const theme = themes[themeKey] || themes.FANTASY;
    const root = document.documentElement;
    Object.keys(theme).forEach((key) => {
      root.style.setProperty(key, theme[key]);
    });
  }, [gameState.currentTheme, manualTheme]);
  
  useEffect(() => {
    if (gameState.status !== 'playing' || !gameState.chat || !llmProvider.countTokensForRequest) {
      setTokenCount(0);
      return;
    }
    const handler = setTimeout(async () => {
      const currentChat = gameState.chat;
      if (!currentChat) return;
      const count = await llmProvider.countTokensForRequest(
        llmConfig,
        currentChat,
        customActionInput,
        gameState.inventory,
        gameState.worldState,
        gameState.npcs
      );
      setTokenCount(count);
    }, 300);
    return () => clearTimeout(handler);
  }, [customActionInput, gameState.currentScene, gameState.chat, llmProvider]);


  const saveCurrentGame = useCallback(async (state: GameState) => {
    if (!state.chat || !state.id) return;
    try {
        const chatHistory = llmProvider.name === 'Gemini' ? await state.chat.getHistory() : state.chat;
        const saveData: SaveData = {
            id: state.id,
            lastPlayed: new Date().toISOString(),
            theme: state.currentTheme,
            history: state.history,
            chatHistory: chatHistory,
            inventory: state.inventory,
            worldState: state.worldState,
            npcs: state.npcs,
            currentScene: state.currentScene,
            currentImage: state.currentImage,
            llmConfig: llmConfig,
        };
        await saveGame(saveData);
        const games = await getSavedGames();
        setSavedGames(games);
    } catch (error) {
        console.error("Failed to save game:", error);
    }
  }, [llmProvider, llmConfig]);

  const handleNewGame = useCallback(async (startPrompt: string, config: LLMConfig, image: ImageProvider) => {
    setNewAdventureModalOpen(false);
    setLlmConfig(config);
    setImageProvider(image);
    const llm = getLLMProvider(config);
    setGameState((prev: GameState) => ({ ...initialGameState, isLoading: true, status: 'playing' }));
    console.log("handleNewGame called with:", { startPrompt, llmConfig: config, imageName: image.name });
    try {
      console.log("Calling llm.startAdventure...");
      const { chat, scene } = await llm.startAdventure(config, startPrompt);
      console.log("llm.startAdventure returned:", { chat, scene });
      console.log("Calling image.generateSceneImage...");
      const imageResult = await image.generateSceneImage(scene.imagePrompt || scene.description, scene.theme);
      console.log("image.generateSceneImage returned:", imageResult);
      
      const initialEntry: HistoryEntry = {
        description: scene.description,
        image: imageResult,
      };

      const newGameState: GameState = {
        ...initialGameState,
        id: `save_${Date.now()}`,
        status: 'playing',
        chat,
        history: [initialEntry],
        currentScene: scene,
        currentImage: imageResult,
        currentTheme: scene.theme,
        inventory: scene.inventory || [],
        worldState: scene.worldState || {},
        npcs: scene.npcs || [],
        isLoading: false,
      };
      setGameState(newGameState);
      console.log("New game state set:", newGameState);
      await saveCurrentGame(newGameState);
      console.log("Game saved.");
    } catch (err) {
      console.error("Error in handleNewGame:", err);
      setGameState({
        ...initialGameState,
        status: 'error',
        error: err instanceof Error ? err.message : 'An unknown error occurred.',
      });
    }
  }, [saveCurrentGame]);

  const handleLoadGame = useCallback(async (id: string) => {
    setLoadModalOpen(false);
    setGameState(prev => ({...initialGameState, isLoading: true, status: 'playing'}));
    try {
        const saveData = await loadGame(id);
        if (saveData) {
            const provider = getLLMProvider(saveData.llmConfig);
            if (!provider.rehydrateAdventure) {
                throw new Error(`The LLM provider ${saveData.llmConfig.provider} does not support loading games.`);
            }
            setLlmConfig(saveData.llmConfig);
            const chat = await provider.rehydrateAdventure(saveData.llmConfig, saveData.chatHistory);
            setGameState({
                id: saveData.id,
                status: 'playing',
                chat,
                history: saveData.history,
                currentScene: saveData.currentScene,
                currentImage: saveData.currentImage,
                isLoading: false,
                error: null,
                currentTheme: saveData.theme,
                inventory: saveData.inventory,
                worldState: saveData.worldState,
                npcs: saveData.npcs,
            });
        } else {
            throw new Error('Could not find the saved game file.');
        }
    } catch (err) {
        console.error("Error loading adventure", err);
        setGameState({...initialGameState, status: 'error', error: err instanceof Error ? err.message : 'Failed to load saved game.'});
    }
  }, []);

  const handleDeleteGame = useCallback(async (id: string) => {
    try {
        await deleteGame(id);
        const games = await getSavedGames();
        setSavedGames(games);
    } catch (error) {
        console.error("Failed to delete game:", error);
    }
  }, []);

  const handleAction = useCallback(async (action: string) => {
    if (!gameState.chat || !gameState.currentScene) return;
    setCustomActionInput('');
    setGameState((prev: GameState) => ({ ...prev, isLoading: true }));
    try {
      console.log("handleAction choice:", action);
      const scene = await llmProvider.continueAdventure(
        llmConfig,
        gameState.chat,
        action,
        gameState.inventory,
        gameState.worldState,
        gameState.npcs
      );
      console.log("continueAdventure returned:", scene);

      const image = await imageProvider.generateSceneImage(
        scene.imagePrompt || scene.description,
        scene.theme,
        gameState.currentScene.imagePrompt || gameState.currentScene.description
      );
      console.log("generateSceneImage returned:", image);

      const newEntry: HistoryEntry = {
        description: scene.description,
        image: image,
      };

      const updatedState: GameState = {
        ...gameState,
        history: [...gameState.history, newEntry],
        currentScene: scene,
        currentImage: image,
        currentTheme: scene.theme,
        inventory: scene.inventory || gameState.inventory,
        worldState: scene.worldState || gameState.worldState,
        npcs: scene.npcs || gameState.npcs,
        isLoading: false,
      };
      console.log("New state after action:", updatedState);
      
      setGameState(updatedState);
      await saveCurrentGame(updatedState);
    } catch (err) {
      console.error(err);
      setGameState((prev: GameState) => ({
        ...prev,
        status: 'error',
        isLoading: false,
        error: err instanceof Error ? err.message : 'An unknown error occurred.',
      }));
    }
  }, [gameState, saveCurrentGame, llmProvider, imageProvider]);

  const renderContent = () => {
    switch (gameState.status) {
        case 'menu':
            return <StartMenu onNewGame={() => setNewAdventureModalOpen(true)} onLoadGame={() => setLoadModalOpen(true)} />;
        case 'playing':
            return (
              <>
                  <header className="flex-shrink-0 bg-[var(--color-background-start)]/80 backdrop-blur-sm border-b border-[var(--color-primary)]/20 p-3 shadow-lg z-10">
                    <div className="mx-auto flex justify-between items-center max-w-screen-2xl px-4 gap-4">
                        <h1 className="font-[var(--font-heading)] text-xl lg:text-2xl font-bold text-[var(--color-accent)] whitespace-nowrap flex-shrink-0" onClick={() => setGameState(initialGameState)} style={{cursor: 'pointer'}}>
                            Gemini Adventure
                        </h1>
                        <div className="flex-grow min-w-0 px-4 lg:px-8 flex items-center justify-end gap-4">
                            <div className="flex items-center gap-2">
                                <label htmlFor="llm-provider-main" className="text-sm font-semibold text-[var(--color-text-muted)]">LLM:</label>
                                <select
                                    id="llm-provider-main"
                                    value={llmConfig.provider}
                                    onChange={e => setLlmConfig({ ...llmConfig, provider: e.target.value as LLMProviderName })}
                                    className="bg-[var(--color-surface)] border border-[var(--color-surface)] rounded-md p-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                                >
                                    {['Gemini','LM Studio','Ollama'].map(name => <option key={name} value={name}>{name}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="image-provider-main" className="text-sm font-semibold text-[var(--color-text-muted)]">Images:</label>
                                <select
                                    id="image-provider-main"
                                    value={imageProvider.name}
                                    onChange={e => setImageProvider(availableImageProviders.find(p => p.name === e.target.value)!)}
                                    className="bg-[var(--color-surface)] border border-[var(--color-surface)] rounded-md p-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                                >
                                    {availableImageProviders.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                                </select>
                            </div>
                            <TokenUsageIndicator tokenCount={tokenCount} />
                            <button
                                onClick={() => setLLMSettingsOpen(true)}
                                className="text-sm bg-[var(--color-surface-accent)] text-[var(--color-text)] px-3 py-2 rounded-md hover:bg-[var(--color-primary)]"
                            >
                                LLM Settings
                            </button>
                            <button
                                onClick={() => setImageSettingsOpen(true)}
                                className="text-sm bg-[var(--color-surface-accent)] text-[var(--color-text)] px-3 py-2 rounded-md hover:bg-[var(--color-primary)]"
                            >
                                Image Settings
                            </button>
                            <div className="w-56 flex-shrink-0">
                                <ThemeSelector
                                    availableThemes={availableThemeNames}
                                    selectedTheme={manualTheme}
                                    onThemeChange={setManualTheme}
                                    disabled={gameState.status !== 'playing'}
                                />
                            </div>
                        </div>
                    </div>
                  </header>
                  <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
                      <div className="flex-grow p-4 lg:p-6 h-full flex flex-col lg:w-2/3">
                          <GameScreen
                              scene={gameState.currentScene}
                              image={gameState.currentImage}
                              onAction={handleAction}
                              isLoading={gameState.isLoading}
                              customActionInput={customActionInput}
                              onCustomActionInputChange={setCustomActionInput}
                          />
                      </div>
                      <aside className="w-full lg:w-1/3 flex-shrink-0 bg-[var(--color-background-start)] p-6 flex flex-col gap-4">
                        <div className="flex-shrink-0 border-b-2 border-[var(--color-primary)]/30">
                            <nav className="flex -mb-px">
                                <button onClick={() => setActiveTab('history')} className={`w-1/3 py-3 px-1 text-center border-b-2 font-semibold text-sm transition-colors duration-200 ${activeTab === 'history' ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-gray-500'}`}>
                                    History
                                </button>
                                <button onClick={() => setActiveTab('inventory')} className={`w-1/3 py-3 px-1 text-center border-b-2 font-semibold text-sm transition-colors duration-200 ${activeTab === 'inventory' ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-gray-500'}`}>
                                    Inventory
                                </button>
                                <button onClick={() => setActiveTab('characters')} className={`w-1/3 py-3 px-1 text-center border-b-2 font-semibold text-sm transition-colors duration-200 ${activeTab === 'characters' ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-gray-500'}`}>
                                    Characters
                                </button>
                            </nav>
                        </div>

                        <div className="flex-grow overflow-hidden">
                            {activeTab === 'history' && <HistoryPanel history={gameState.history} />}
                            {activeTab === 'inventory' && <InventoryPanel inventory={gameState.inventory} />}
                            {activeTab === 'characters' && <CharacterPanel npcs={gameState.npcs} />}
                        </div>
                      </aside>
                  </div>
              </>
            );
        case 'error':
             return (
                <div className="w-full h-full flex items-center justify-center text-center p-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-[var(--color-accent)]">An Unexpected End</h2>
                        <p className="text-[var(--color-text-muted)]">{gameState.error}</p>
                        <button
                        onClick={() => window.location.reload()}
                        className="mt-6 bg-[var(--color-primary)] text-white font-bold py-2 px-4 rounded hover:bg-[var(--color-primary-hover)]"
                        >
                        Return to Menu
                        </button>
                    </div>
                </div>
            );
    }
  };

  return (
    <main className="bg-[var(--color-background-start)] h-screen w-full flex flex-col overflow-hidden">
      <GlobalStyle />
      {renderContent()}
      <LoadGameModal 
        isOpen={isLoadModalOpen}
        onClose={() => setLoadModalOpen(false)}
        saves={savedGames}
        onLoad={handleLoadGame}
        onDelete={handleDeleteGame}
        onViewNotes={(save) => { setNotesToView(save); setNotesModalOpen(true); }}
      />
      <NotesViewerModal
        isOpen={isNotesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        saveData={notesToView}
       />
       <NewAdventureModal
        isOpen={isNewAdventureModalOpen}
        onClose={() => setNewAdventureModalOpen(false)}
        onStart={handleNewGame}
        selectedLLMConfig={llmConfig}
        onLLMConfigChange={setLlmConfig}
        imageProviders={availableImageProviders}
       defaultImageProvider={imageProvider}
       />
      <LLMSettingsModal
        isOpen={isLLMSettingsOpen}
        onClose={() => setLLMSettingsOpen(false)}
        llmConfig={llmConfig}
        onLLMConfigChange={setLlmConfig}
      />
      <ImageSettingsModal
        isOpen={isImageSettingsOpen}
        onClose={() => setImageSettingsOpen(false)}
        providerName={imageProvider.name}
        comfyUIEndpoint={comfyUIEndpoint}
        setComfyUIEndpoint={setComfyUIEndpoint}
      />
    </main>
  );
};

export default App;
