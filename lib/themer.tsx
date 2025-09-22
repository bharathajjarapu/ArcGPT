"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { applyTheme, switchTheme, getCachedTheme } from './themes';
import { optimizedGetItem, optimizedSetItem } from './storage';

interface ThemeContextType {
  theme: string;
  isDark: boolean;
  setTheme: (theme: string) => void;
  setIsDark: (isDark: boolean) => void;
  toggleDarkMode: () => void;
  themeColors: Record<string, string>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState('default');
  const [isDark, setIsDarkState] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load saved theme from localStorage on mount with optimized reads
  useEffect(() => {
    const savedTheme = optimizedGetItem('theme') || 'default';
    const savedDarkMode = optimizedGetItem('darkMode');
    const isDarkMode = savedDarkMode !== null ? JSON.parse(savedDarkMode) : true;

    setThemeState(savedTheme);
    setIsDarkState(isDarkMode);
    setMounted(true);
  }, []);

  // Memoize theme colors using cached version
  const themeColors = useMemo(() => {
    return getCachedTheme(theme, isDark);
  }, [theme, isDark]);

  // Apply theme with optimized switching
  const applyThemeCallback = useCallback(() => {
    if (mounted) {
      switchTheme(theme, isDark);

      // Update document class for dark mode
      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme, isDark, mounted]);

  useEffect(() => {
    applyThemeCallback();
  }, [applyThemeCallback]);

  // Define all callbacks - these must be called on every render
  const setTheme = useCallback((newTheme: string) => {
    setThemeState(newTheme);
    // Use optimized storage
    optimizedSetItem('theme', newTheme);
  }, []);

  const setIsDark = useCallback((newIsDark: boolean) => {
    setIsDarkState(newIsDark);
    // Use optimized storage
    optimizedSetItem('darkMode', JSON.stringify(newIsDark));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDark(!isDark);
  }, [isDark, setIsDark]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div className="min-h-screen bg-zinc-950">{children}</div>;
  }

  const contextValue = {
    theme,
    isDark,
    setTheme,
    setIsDark,
    toggleDarkMode,
    themeColors,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}; 