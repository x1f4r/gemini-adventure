import React from 'react';
import type { ThemeName } from '../types';

interface ThemeSelectorProps {
  availableThemes: ThemeName[];
  selectedTheme: ThemeName | 'AUTOMATIC';
  onThemeChange: (theme: ThemeName | 'AUTOMATIC') => void;
  disabled: boolean;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ availableThemes, selectedTheme, onThemeChange, disabled }) => {
  return (
    <div className="relative">
      <label htmlFor="theme-select" className="sr-only">Select Theme</label>
      <select
        id="theme-select"
        value={selectedTheme}
        onChange={(e) => onThemeChange(e.target.value as ThemeName | 'AUTOMATIC')}
        disabled={disabled}
        className="appearance-none bg-[var(--color-surface)] border-2 border-[var(--color-primary)] text-[var(--color-text)] text-sm font-semibold rounded-lg shadow-md focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] block w-full pl-3 pr-10 py-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="AUTOMATIC">Automatic (Follow Story)</option>
        {availableThemes.map((theme) => (
          <option key={theme} value={theme}>
            {theme.charAt(0) + theme.slice(1).toLowerCase().replace(/_/g, ' ')}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--color-text)]">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};

export default ThemeSelector;
