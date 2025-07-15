import React from 'react';

interface InventoryPanelProps {
  inventory: string[];
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ inventory }) => {
  return (
    <div className="w-full bg-[var(--color-background-start)] flex flex-col h-full">
      <h2 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--color-accent)] border-b-2 border-[var(--color-primary)]/30 pb-3 mb-4 flex-shrink-0">
        Inventory
      </h2>
      <div className="flex-grow overflow-y-auto pr-2">
        {inventory.length > 0 ? (
          <ul className="space-y-2">
            {inventory.map((item, index) => (
              <li key={index} className="bg-[var(--color-surface)] p-3 rounded-md shadow-sm text-[var(--color-text)] font-medium text-sm transition-all duration-200 hover:bg-[var(--color-background-end)]">
                - {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[var(--color-text-muted)] text-center mt-4 text-sm">Your pockets are empty.</p>
        )}
      </div>
    </div>
  );
};

export default InventoryPanel;
