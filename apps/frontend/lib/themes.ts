// Theme configuration for SecureLens
export const themes = {
  violet: {
    name: 'Violet',
    primary: 'violet',
    accent: 'fuchsia',
    colors: {
      primary: '#a78bfa',
      secondary: '#d8b4fe',
      accent: '#ec4899',
      dark: '#0f172a',
      darker: '#020617',
    },
    css: `
      :root {
        --color-primary: 139, 92, 246;
        --color-accent: 236, 72, 153;
        --color-dark: 15, 23, 42;
      }
    `,
  },
  blue: {
    name: 'Blue',
    primary: 'blue',
    accent: 'cyan',
    colors: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      accent: '#06b6d4',
      dark: '#0f172a',
      darker: '#020617',
    },
    css: `
      :root {
        --color-primary: 59, 130, 246;
        --color-accent: 6, 182, 212;
        --color-dark: 15, 23, 42;
      }
    `,
  },
  emerald: {
    name: 'Emerald',
    primary: 'emerald',
    accent: 'green',
    colors: {
      primary: '#10b981',
      secondary: '#6ee7b7',
      accent: '#059669',
      dark: '#0f172a',
      darker: '#020617',
    },
    css: `
      :root {
        --color-primary: 16, 185, 129;
        --color-accent: 5, 150, 105;
        --color-dark: 15, 23, 42;
      }
    `,
  },
  amber: {
    name: 'Amber',
    primary: 'amber',
    accent: 'orange',
    colors: {
      primary: '#f59e0b',
      secondary: '#fbbf24',
      accent: '#d97706',
      dark: '#0f172a',
      darker: '#020617',
    },
    css: `
      :root {
        --color-primary: 245, 158, 11;
        --color-accent: 217, 119, 6;
        --color-dark: 15, 23, 42;
      }
    `,
  },
  rose: {
    name: 'Rose',
    primary: 'rose',
    accent: 'pink',
    colors: {
      primary: '#f43f5e',
      secondary: '#fb7185',
      accent: '#e11d48',
      dark: '#0f172a',
      darker: '#020617',
    },
    css: `
      :root {
        --color-primary: 244, 63, 94;
        --color-accent: 225, 29, 72;
        --color-dark: 15, 23, 42;
      }
    `,
  },
} as const;

export type ThemeKey = keyof typeof themes;

export const getTheme = (key: ThemeKey) => themes[key];
