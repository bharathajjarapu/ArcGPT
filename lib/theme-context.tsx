"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { ThemeColor, DEFAULT_THEME_COLOR } from './theme-colors';

interface ThemeContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeColorProvider = ({ children }: ThemeProviderProps) => {
  const { theme } = useTheme();
  const [themeColor, setThemeColorState] = useState<ThemeColor>(DEFAULT_THEME_COLOR);

  useEffect(() => {
    const savedThemeColor = localStorage.getItem('themeColor') as ThemeColor;
    if (savedThemeColor) {
      setThemeColorState(savedThemeColor);
    }
  }, []);

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    localStorage.setItem('themeColor', color);
  };

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};