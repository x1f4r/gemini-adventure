// LLM Provider interface and adapters for Gemini, LM Studio, and Ollama
import type { Scene, NPC } from '../types';
import type { History } from "@google/genai/server";
import { GoogleGenAI, type Chat } from "@google/genai";

export type LLMProviderName = 'Gemini' | 'LM Studio' | 'Ollama';

export interface LLMProviderConfig {
  apiKey?: string;
  endpoint?: string;
  model?: string;
}

export interface LLMProvider {
  name: LLMProviderName;
  startAdventure(config: LLMProviderConfig, startPrompt: string): Promise<{ chat: any; scene: Scene }>;
  continueAdventure(config: LLMProviderConfig, chat: any, choice: string, inventory: string[], worldState: Record<string, string>, npcs: NPC[]): Promise<Scene>;
  rehydrateAdventure?(config: LLMProviderConfig, chatHistory: any[]): Promise<any>;
  countTokensForRequest?(
    config: LLMProviderConfig,
    chat: any,
    action: string,
    inventory: string[],
    worldState: Record<string, string>,
    npcs: NPC[]
  ): Promise<number>;
}

const systemInstruction = `You are a master storyteller for a text adventure game. Your goal is to create a rich, immersive, and interactive experience for the player.

You will generate a JSON object representing the current scene. This object must always include:
- "title": A short, evocative title for the scene.
- "description": A detailed, multi-paragraph description of the environment, atmosphere, and any characters present. Use vivid language to engage the player's senses.
- "choices": An array of 3-5 distinct actions the player can take. Each choice should be a string.
- "theme": A single keyword suggesting a visual theme for the scene (e.g., "DARK_FOREST", "CYBERPUNK_CITY", "ANCIENT_RUINS").

You must also manage the game's state:
- "worldState": An object containing key-value pairs that track the state of the world. This can include things like "door_unlocked": "true", "time_of_day": "night", etc. You can add, remove, or modify these as the story progresses.
- "npcs": An array of non-player characters currently in the scene or relevant to it. Each NPC should be an object with "name", "description", and "dialogue" properties.

When the player makes a choice, you will receive their action and the current game state (inventory, world state, npcs). Your response must be a new JSON object for the next scene, reflecting the consequences of the player's choice.

Key rules:
1.  Always respond with a valid JSON object matching the specified schema. Do not include any text outside of the JSON structure.
2.  Ensure the story is coherent and evolves based on player actions.
3.  Be creative and surprising. Introduce new characters, items, and plot twists.
4.  The "description" should be at least two paragraphs long.
5.  The "choices" should be meaningful and lead to different outcomes.
6.  Update "worldState" and "npcs" logically based on the player's actions.
7.  If the player's action is nonsensical or impossible, create a response that reflects that in a creative way.
8.  The "theme" should be chosen from a consistent set of themes to allow for visual theming of the game.
`;

const responseSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    choices: {
      type: "array",
      items: { type: "string" },
    },
    theme: { type: "string" },
    worldState: {
      type: "object",
      additionalProperties: { type: "string" },
    },
    npcs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          dialogue: { type: "string" },
        },
        required: ["name", "description", "dialogue"],
      },
    },
  },
  required: ["title", "description", "choices", "theme", "worldState", "npcs"],
};


function createGeminiChat(config: LLMProviderConfig, history?: History[]): Chat {
    const ai = new GoogleGenAI(config.apiKey || '');
    return ai.getGenerativeModel({
        model: config.model || 'gemini-2.5-flash',
        systemInstruction: {
            role: 'system',
            parts: [{ text: systemInstruction }],
        },
        generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
        }
    }).startChat({ history });
}


const GeminiLLMProvider: LLMProvider = {
  name: 'Gemini',
  async startAdventure(config, startPrompt: string) {
    if (!config.apiKey) throw new Error("Gemini API key not found.");
    const chat = createGeminiChat(config);
    const response = await chat.sendMessage(startPrompt);
    const scene: Scene = JSON.parse(response.response.text().trim());
    return { chat, scene };
  },
  async continueAdventure(config, chat, choice, inventory, worldState, npcs) {
    const context = `
Current Inventory: [${inventory.join(', ')}]
Current World State: ${JSON.stringify(worldState)}
Known NPCs: ${JSON.stringify(npcs)}

Player Action: "${choice}"
`;
    const response = await chat.sendMessage(context);
    const scene: Scene = JSON.parse(response.response.text().trim());
    return scene;
  },
  async rehydrateAdventure(config, chatHistory) {
    if (!config.apiKey) throw new Error("Gemini API key not found.");
    return createGeminiChat(config, chatHistory);
  },
  async countTokensForRequest(config, chat, action, inventory, worldState, npcs) {
    try {
        if (!config.apiKey) return 0;
        const ai = new GoogleGenAI(config.apiKey);
        const model = ai.getGenerativeModel({ model: config.model || 'gemini-2.5-flash' });
        const history = await chat.getHistory();
        const context = `
Current Inventory: [${inventory.join(', ')}]
Current World State: ${JSON.stringify(worldState)}
Known NPCs: ${JSON.stringify(npcs)}

Player Action: "${action}"
`;
        const { totalTokens } = await model.countTokens([...history, { role: 'user', parts: [{ text: context }] }]);
        return totalTokens;
    } catch {
      return 0;
    }
  },
};

function createOpenAICompatibleProvider(name: 'LM Studio' | 'Ollama'): LLMProvider {
    return {
        name,
        async startAdventure(config, startPrompt: string) {
            const endpoint = config.endpoint || (name === 'LM Studio' ? 'http://localhost:1234/v1/chat/completions' : 'http://localhost:11434/v1/chat/completions');
            const model = config.model || 'local-model';
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: systemInstruction },
                        { role: 'user', content: startPrompt },
                    ],
                    stream: false,
                }),
            });
            if (!res.ok) {
                throw new Error(`Failed to fetch from ${name}: ${res.statusText}`);
            }
            const data = await res.json();
            const text = data.choices?.[0]?.message?.content || '';
            const scene: Scene = JSON.parse(text.trim());
            const chatHistory = [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: startPrompt },
                { role: 'assistant', content: text }
            ];
            return { chat: chatHistory, scene };
        },
        async continueAdventure(config, chat, choice, inventory, worldState, npcs) {
            const endpoint = config.endpoint || (name === 'LM Studio' ? 'http://localhost:1234/v1/chat/completions' : 'http://localhost:11434/v1/chat/completions');
            const model = config.model || 'local-model';
            const context = `
Current Inventory: [${inventory.join(', ')}]
Current World State: ${JSON.stringify(worldState)}
Known NPCs: ${JSON.stringify(npcs)}

Player Action: "${choice}"
`;
            const messages = [...chat, { role: 'user', content: context }];
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    messages,
                    stream: false,
                }),
            });
            if (!res.ok) {
                throw new Error(`Failed to fetch from ${name}: ${res.statusText}`);
            }
            const data = await res.json();
            const text = data.choices?.[0]?.message?.content || '';
            const scene: Scene = JSON.parse(text.trim());
            chat.push({ role: 'user', content: context });
            chat.push({ role: 'assistant', content: text });
            return scene;
        },
        async rehydrateAdventure(config, chatHistory) {
            return chatHistory;
        },
        async countTokensForRequest() {
            // Not easily available for local models
            return 0;
        },
        async getAvailableModels(config) {
            const endpoint = config.endpoint || (name === 'LM Studio' ? 'http://localhost:1234/v1/models' : 'http://localhost:11434/v1/models');
            try {
                const res = await fetch(endpoint);
                if (!res.ok) {
                    console.error(`Failed to fetch models from ${name}: ${res.statusText}`);
                    return [];
                }
                const data = await res.json();
                return data.data.map((m: any) => m.id);
            } catch (error) {
                console.error(`Error fetching models from ${name}:`, error);
                return [];
            }
        }
    };
}


export function getLLMProvider(config: LLMConfig): LLMProvider {
    switch (config.provider) {
        case 'Gemini':
            return GeminiLLMProvider;
        case 'LM Studio':
            return createOpenAICompatibleProvider('LM Studio');
        case 'Ollama':
            return createOpenAICompatibleProvider('Ollama');
        default:
            throw new Error(`Unknown LLM provider: ${config.provider}`);
    }
}