import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

// Primary color presets
export const PRIMARY_COLORS = {
  purple: { name: 'Purple', value: '#7c3aed', hue: '263' },
  blue: { name: 'Blue', value: '#3b82f6', hue: '217' },
  orange: { name: 'Orange', value: '#f97316', hue: '25' },
  red: { name: 'Red', value: '#ef4444', hue: '0' },
  cyan: { name: 'Cyan', value: '#06b6d4', hue: '189' },
  green: { name: 'Green', value: '#22c55e', hue: '142' },
  pink: { name: 'Pink', value: '#ec4899', hue: '330' },
  indigo: { name: 'Indigo', value: '#6366f1', hue: '239' },
} as const;

export type PrimaryColorKey = keyof typeof PRIMARY_COLORS;
export type ThemeMode = 'light' | 'dark' | 'system';
export type SkinType = 'default' | 'bordered';
export type NavbarType = 'sticky' | 'static' | 'hidden';
export type ContentWidth = 'compact' | 'wide';
export type Direction = 'ltr' | 'rtl';
export type MenuState = 'expanded' | 'collapsed';

export interface ThemeSettings {
  primaryColor: PrimaryColorKey | 'custom';
  customColor: string;
  mode: ThemeMode;
  skin: SkinType;
  semiDark: boolean;
  menuState: MenuState;
  navbarType: NavbarType;
  contentWidth: ContentWidth;
  direction: Direction;
}

const DEFAULT_SETTINGS: ThemeSettings = {
  primaryColor: 'blue',
  customColor: '#3b82f6',
  mode: 'light',
  skin: 'default',
  semiDark: false,
  menuState: 'expanded',
  navbarType: 'sticky',
  contentWidth: 'wide',
  direction: 'ltr',
};

interface ThemeContextType {
  settings: ThemeSettings;
  resolvedTheme: 'light' | 'dark';
  updateSettings: (updates: Partial<ThemeSettings>) => void;
  resetSettings: () => void;
  // Convenience methods
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  setPrimaryColor: (color: PrimaryColorKey | 'custom', customValue?: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper to generate color palette from a base color
function generateColorPalette(hex: string): Record<string, string> {
  // Convert hex to HSL
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  const hue = Math.round(h * 360);

  // Generate shades
  return {
    50: `hsl(${hue}, 100%, 97%)`,
    100: `hsl(${hue}, 96%, 90%)`,
    200: `hsl(${hue}, 94%, 80%)`,
    300: `hsl(${hue}, 92%, 70%)`,
    400: `hsl(${hue}, 90%, 60%)`,
    500: `hsl(${hue}, 85%, 50%)`,
    600: `hsl(${hue}, 80%, 45%)`,
    700: `hsl(${hue}, 75%, 40%)`,
    800: `hsl(${hue}, 70%, 35%)`,
    900: `hsl(${hue}, 65%, 25%)`,
    950: `hsl(${hue}, 60%, 15%)`,
  };
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    try {
      const saved = localStorage.getItem('theme-settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load theme settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Determine the actual theme based on mode and system preference
  useEffect(() => {
    const updateResolvedTheme = () => {
      if (settings.mode === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setResolvedTheme(prefersDark ? 'dark' : 'light');
      } else {
        setResolvedTheme(settings.mode);
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateResolvedTheme);
    return () => mediaQuery.removeEventListener('change', updateResolvedTheme);
  }, [settings.mode]);

  // Apply theme settings to DOM
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Apply theme mode
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);

    // Apply skin
    root.dataset.skin = settings.skin;

    // Apply semi-dark
    root.dataset.semiDark = String(settings.semiDark);

    // Apply navbar type
    root.dataset.navbar = settings.navbarType;

    // Apply content width
    root.dataset.contentWidth = settings.contentWidth;

    // Apply menu state
    root.dataset.menuState = settings.menuState;

    // Apply direction
    root.dir = settings.direction;
    body.dir = settings.direction;

    // Apply primary color CSS variables
    const colorValue = settings.primaryColor === 'custom'
      ? settings.customColor
      : PRIMARY_COLORS[settings.primaryColor].value;

    const palette = generateColorPalette(colorValue);

    Object.entries(palette).forEach(([shade, value]) => {
      root.style.setProperty(`--color-primary-${shade}`, value);
    });

    // Save to localStorage
    localStorage.setItem('theme-settings', JSON.stringify(settings));
  }, [settings, resolvedTheme]);

  const updateSettings = useCallback((updates: Partial<ThemeSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light',
    }));
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setSettings(prev => ({ ...prev, mode }));
  }, []);

  const setPrimaryColor = useCallback((color: PrimaryColorKey | 'custom', customValue?: string) => {
    setSettings(prev => ({
      ...prev,
      primaryColor: color,
      ...(customValue && { customColor: customValue }),
    }));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        settings,
        resolvedTheme,
        updateSettings,
        resetSettings,
        toggleTheme,
        setTheme,
        setPrimaryColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Legacy compatibility - keep theme property for backward compatibility
export const useLegacyTheme = () => {
  const { resolvedTheme, toggleTheme, setTheme } = useTheme();
  return {
    theme: resolvedTheme,
    toggleTheme,
    setTheme: (theme: 'light' | 'dark') => setTheme(theme),
  };
};
