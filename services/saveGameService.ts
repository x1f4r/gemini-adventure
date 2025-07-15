import type { SaveData } from '../types';

const DB_NAME = 'GeminiAdventureDB';
const DB_VERSION = 1;
const STORE_NAME = 'savedGames';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(new Error('Failed to open IndexedDB. It may be disabled in your browser settings.'));
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Saves a game state to IndexedDB. If a save with the same ID exists, it's overwritten.
 * @param {SaveData} saveData The game data to save.
 */
export async function saveGame(saveData: SaveData): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(saveData);
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Retrieves a list of all saved games from IndexedDB, sorted by most recently played.
 * @returns {Promise<SaveData[]>} A promise that resolves to an array of saved game data.
 */
export async function getSavedGames(): Promise<SaveData[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const sortedGames = (request.result as SaveData[]).sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime());
            resolve(sortedGames);
        };
        request.onerror = () => reject(request.error);
    });
}

/**
 * Loads a specific game by its ID from IndexedDB.
 * @param {string} id The ID of the game to load.
 * @returns {Promise<SaveData | null>} A promise that resolves to the saved game data, or null if not found.
 */
export async function loadGame(id: string): Promise<SaveData | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Deletes a specific game by its ID from IndexedDB.
 * @param {string} id The ID of the game to delete.
 */
export async function deleteGame(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}
