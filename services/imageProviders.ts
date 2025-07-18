// Image Provider interface and adapters for Imagen and ComfyUI
import type { ThemeName } from '../types';

export interface ImageProviderConfig {
  apiKey?: string;
  endpoint?: string;
  model?: string;
}

export interface ImageProvider {
  name: string;
  generateSceneImage(prompt: string, theme: ThemeName, previousPrompt?: string, location?: string, action?: string): Promise<string>;
}

const themeStyles: Record<ThemeName, string> = {
  FANTASY: 'dark fantasy art, epic, cinematic lighting, hyperdetailed, intricately detailed',
  CYBERPUNK: 'cyberpunk aesthetic, neon-drenched, dystopian, Blade Runner style, synthwave',
  SCI_FI: 'sci-fi concept art, futuristic, clean lines, starship interior, chrome details, high-tech',
  HORROR: 'gothic horror aesthetic, unsettling, lovecraftian, dark, grainy, eerie silence',
  NOIR: 'film noir style, high contrast, dramatic shadows, 1940s detective movie, grainy',
  STEAMPUNK: 'steampunk style, gears, clockwork, brass and copper, Victorian, detailed illustration',
  SOLARPUNK: 'solarpunk aesthetic, lush greenery, art nouveau, sustainable technology, bright and optimistic, studio ghibli inspired',
  POST_APOCALYPTIC: 'post-apocalyptic setting, desolate, overgrown ruins, makeshift technology, gritty, atmospheric, The Last of Us style',
  WESTERN: 'wild west aesthetic, dusty town, spaghetti western film still, wide-angle shot, sun-drenched, cowboys',
  PIRATE: 'pirate theme, tropical island, tall ships, skull and crossbones, treasure map, cinematic lighting',
};

// Imagen Adapter (Google)
import { GoogleGenAI } from "@google/genai";
export const ImagenProvider: ImageProvider = {
  name: 'Imagen',
  async generateSceneImage(prompt, theme, previousPrompt, location, action) {
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const style = themeStyles[theme] || themeStyles.FANTASY;
      const continuityPrompt = previousPrompt ? `Continuing from a scene described as '${previousPrompt}', the view now shows:` : '';
      const locationPrompt = location ? `The scene takes place in ${location}.` : '';
      const actionPrompt = action ? `The player is currently ${action}.` : '';
      const handsPrompt = action && (action.includes("pick up") || action.includes("use") || action.includes("examine")) ? "The player's hands are visible, interacting with the object." : "No hands, arms, or any part of the player's body are visible.";
      const fullPrompt = `first-person perspective, ${continuityPrompt} ${locationPrompt} ${prompt}. ${actionPrompt} The scene is viewed through the character's own eyes. ${handsPrompt} ${style}, cinematic, masterpiece, hyperrealistic`;
      const response = await ai.models.generateImages({
        model: 'imagen-4',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
      });
      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
      }
      throw new Error("No image was generated.");
    } catch (error) {
      console.error("Error generating image with Imagen:", error);
      return "https://picsum.photos/1280/720?grayscale&blur=2";
    }
  },
};

// ComfyUI Adapter (REST API)
export function createComfyUIImageProvider(config: ImageProviderConfig): ImageProvider {
  return {
    name: 'ComfyUI',
    async generateSceneImage(prompt, theme, previousPrompt, location, action) {
      try {
        const style = themeStyles[theme] || themeStyles.FANTASY;
        const continuityPrompt = previousPrompt ? `Continuing from a scene described as '${previousPrompt}', the view now shows:` : '';
        const locationPrompt = location ? `The scene takes place in ${location}.` : '';
        const actionPrompt = action ? `The player is currently ${action}.` : '';
        const handsPrompt = action && (action.includes("pick up") || action.includes("use") || action.includes("examine")) ? "The player's hands are visible, interacting with the object." : "No hands, arms, or any part of the player's body are visible.";
        const fullPrompt = `first-person perspective, ${continuityPrompt} ${locationPrompt} ${prompt}. ${actionPrompt} The scene is viewed through the character's own eyes. ${handsPrompt} ${style}, cinematic, masterpiece, hyperrealistic`;
        // ComfyUI expects a POST to /prompt with { prompt: string }
        const res = await fetch(config.endpoint || 'http://localhost:8188/prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: fullPrompt }),
        });
        const data = await res.json();
        // Assume ComfyUI returns { image: base64string } or { url: string }
        if (data.image) {
          return `data:image/jpeg;base64,${data.image}`;
        } else if (data.url) {
          return data.url;
        }
        throw new Error('No image returned from ComfyUI');
      } catch (error) {
        console.error('Error generating image with ComfyUI:', error);
        return "https://picsum.photos/1280/720?grayscale&blur=2";
      }
    },
  };
} 