import React, { useEffect, useState } from 'react';

const COLOR_MODE_KEY = 'color-mode';

export type ColorMode = 'light' | 'dark';

export function getInitialColorMode(): ColorMode {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(COLOR_MODE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    // Optionally, use prefers-color-scheme
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  }
  return 'dark';
}

export const ColorModeContext = React.createContext<{
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
}>({
  colorMode: 'dark',
  setColorMode: () => {},
});

export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colorMode, setColorModeState] = useState<ColorMode>(getInitialColorMode());

  useEffect(() => {
    document.documentElement.setAttribute('data-color-mode', colorMode);
    localStorage.setItem(COLOR_MODE_KEY, colorMode);
  }, [colorMode]);

  const setColorMode = (mode: ColorMode) => {
    setColorModeState(mode);
  };

  return (
    <ColorModeContext.Provider value={{ colorMode, setColorMode }}>
      {children}
    </ColorModeContext.Provider>
  );
};
