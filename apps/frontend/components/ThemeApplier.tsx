'use client';

import React, { useEffect } from 'react';
import { themes, type ThemeKey } from '@/lib/themes';

const themeHSL: Record<ThemeKey, { primary: string; accent: string }> = {
  violet: { primary: '280 100% 68%', accent: '335 100% 58%' },
  blue: { primary: '217 100% 60%', accent: '188 100% 50%' },
  emerald: { primary: '160 85% 42%', accent: '161 94% 30%' },
  amber: { primary: '38 92% 50%', accent: '32 96% 42%' },
  rose: { primary: '356 85% 61%', accent: '356 79% 48%' },
};

const bgGradients: Record<ThemeKey, { from: string; to: string }> = {
  violet: { from: '#0a0a0f', to: '#1e1b4b' },
  blue: { from: '#0a0a0f', to: '#001f3f' },
  emerald: { from: '#0a0a0f', to: '#064e3b' },
  amber: { from: '#0a0a0f', to: '#78350f' },
  rose: { from: '#0a0a0f', to: '#500724' },
};

export function ThemeApplier() {
  useEffect(() => {
    // Load and apply theme on mount
    const loadTheme = () => {
      const savedTheme = (localStorage.getItem('theme') || 'violet') as ThemeKey;
      applyTheme(savedTheme);
    };

    // Apply theme based on stored preference
    const applyTheme = (theme: ThemeKey) => {
      const root = document.documentElement;
      const hslValues = themeHSL[theme];
      const bgColors = bgGradients[theme];

      // Clear all inline styles first
      root.style.cssText = '';
      
      // Remove all theme classes
      Object.keys(themes).forEach((t) => {
        root.classList.remove(`theme-${t}`);
      });

      // Add current theme class
      root.classList.add(`theme-${theme}`);

      // Set CSS variables with HSL values
      root.style.setProperty('--theme-primary', hslValues.primary);
      root.style.setProperty('--theme-accent', hslValues.accent);
      root.style.setProperty('--bg-from', bgColors.from);
      root.style.setProperty('--bg-to', bgColors.to);

      // Apply background to html and body
      root.style.backgroundColor = bgColors.from;
      
      const bodyEl = document.body;
      bodyEl.style.backgroundColor = bgColors.from;
      bodyEl.style.backgroundImage = `linear-gradient(180deg, ${bgColors.from} 0%, ${bgColors.to} 100%)`;
      bodyEl.style.backgroundAttachment = 'fixed';
      bodyEl.style.minHeight = '100vh';

      // Store in localStorage
      localStorage.setItem('theme', theme);

      // Force repaint
      void root.offsetHeight;
    };

    // Listen for theme changes from ThemeSwitcher
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      applyTheme(customEvent.detail.theme);
    };

    loadTheme();
    window.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  return null;
}
