'use client';

import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { themes, type ThemeKey } from '@/lib/themes';

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('violet');
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as ThemeKey | null;
    if (savedTheme && savedTheme in themes) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const themeColors: Record<ThemeKey, string> = {
    violet: '#a78bfa',
    blue: '#3b82f6',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
  };

  const handleThemeChange = (theme: ThemeKey) => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
    
    // Apply theme class to document
    document.documentElement.classList.remove(...Object.keys(themes).map(t => `theme-${t}`));
    document.documentElement.classList.add(`theme-${theme}`);
    
    setIsOpen(false);
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  };

  return (
    <div className="relative">
      {/* Theme Switcher Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Change theme"
      >
        <Palette size={20} />
      </motion.button>

      {/* Theme Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Choose Theme
              </p>

              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(themes) as ThemeKey[]).map((themeKey) => (
                  <motion.button
                    key={themeKey}
                    onClick={() => handleThemeChange(themeKey)}
                    className={`relative p-3 rounded-lg border-2 transition-all group ${
                      currentTheme === themeKey
                        ? 'border-white/30 bg-gray-800/50'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Color Preview Circle */}
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-6 h-6 rounded-full shadow-lg border-2 border-white/20"
                        style={{ backgroundColor: themeColors[themeKey] }}
                      />
                      {currentTheme === themeKey && (
                        <Check size={14} className="text-green-400" />
                      )}
                    </div>

                    {/* Theme Name */}
                    <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">
                      {themes[themeKey].name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Preview Section */}
            <div className="border-t border-gray-800 p-4 bg-gray-900/50">
              <p className="text-[10px] text-gray-500 mb-2">Preview</p>
              <div className="flex gap-2">
                <div
                  className="h-3 rounded-full flex-1"
                  style={{
                    backgroundColor: themeColors[currentTheme],
                    opacity: 0.8,
                  }}
                />
                <div
                  className="h-3 rounded-full flex-1"
                  style={{
                    backgroundColor: themeColors[currentTheme],
                    opacity: 0.5,
                  }}
                />
                <div
                  className="h-3 rounded-full flex-1"
                  style={{
                    backgroundColor: themeColors[currentTheme],
                    opacity: 0.3,
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
