import React, { useContext } from 'react';
import { ColorModeContext } from './ColorModeContext';
import './ColorModeToggle.css';

const ColorModeToggle: React.FC = () => {
  const { colorMode, setColorMode } = useContext(ColorModeContext);

  return (
    <div className="color-mode-toggle">
      <span>Theme:</span>
      <button
        className={colorMode === 'light' ? 'active' : ''}
        onClick={() => setColorMode('light')}
        aria-label="Switch to light mode"
      >
        ☀️
      </button>
      <button
        className={colorMode === 'dark' ? 'active' : ''}
        onClick={() => setColorMode('dark')}
        aria-label="Switch to dark mode"
      >
        🌙
      </button>
    </div>
  );
};

export default ColorModeToggle;
