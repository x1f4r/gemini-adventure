import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  providerName: string;
  comfyUIEndpoint: string;
  setComfyUIEndpoint: (url: string) => void;
}

const ImageSettingsModal: React.FC<Props> = ({ isOpen, onClose, providerName, comfyUIEndpoint, setComfyUIEndpoint }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[var(--color-background-end)] rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[var(--color-primary)]/20">
          <h2 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--color-accent)]">Image Settings</h2>
        </div>
        <div className="p-6 space-y-4">
          {providerName === 'ComfyUI' ? (
            <div>
              <label htmlFor="comfy-endpoint" className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">ComfyUI Endpoint</label>
              <input
                id="comfy-endpoint"
                type="text"
                value={comfyUIEndpoint}
                onChange={e => setComfyUIEndpoint(e.target.value)}
                className="bg-[var(--color-surface)] border-2 border-[var(--color-primary)] text-[var(--color-text)] text-base font-semibold rounded-lg shadow-md focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] block w-full pl-4 pr-10 py-3 transition-colors duration-300"
                placeholder="http://localhost:8188/prompt"
              />
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">No configurable settings for this provider.</p>
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

export default ImageSettingsModal;
