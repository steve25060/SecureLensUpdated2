'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ThemeKey } from '@/lib/themes';
import { themes } from '@/lib/themes';

interface ThemeContextType {
  currentTheme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
  availableThemes: typeof themes;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('violet');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeKey | null;
    if (savedTheme && savedTheme in themes) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }
    setMounted(true);
  }, []);

  const applyTheme = (theme: ThemeKey) => {
    // Apply CSS variables for the theme
    const root = document.documentElement;
    const themeConfig = themes[theme];
    
    // Set CSS custom properties
    root.style.setProperty('--color-primary', 'var(--color-primary-' + theme + ')');
    root.style.setProperty('--color-accent', 'var(--color-accent-' + theme + ')');
    
    // Add theme class to document for Tailwind
    document.documentElement.classList.remove(...Object.keys(themes).map(t => `theme-${t}`));
    document.documentElement.classList.add(`theme-${theme}`);
    
    // Store in localStorage
    localStorage.setItem('theme', theme);
  };

  const handleSetTheme = (theme: ThemeKey) => {
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme: handleSetTheme,
        availableThemes: themes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
