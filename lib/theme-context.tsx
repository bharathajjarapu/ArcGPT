"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { applyTheme, themes } from './themes';

interface ThemeContextType {
  theme: string;
  isDark: boolean;
  setTheme: (theme: string) => void;
  setIsDark: (isDark: boolean) => void;
  toggleDarkMode: () => void;
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

  // Load saved theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'default';
    const savedDarkMode = localStorage.getItem('darkMode');
    const isDarkMode = savedDarkMode ? JSON.parse(savedDarkMode) : true;
    
    setThemeState(savedTheme);
    setIsDarkState(isDarkMode);
    setMounted(true);
  }, []);

  // Apply theme whenever theme or dark mode changes
  useEffect(() => {
    if (mounted) {
      applyTheme(theme, isDark);
      
      // Update document class for dark mode
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme, isDark, mounted]);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setIsDark = (newIsDark: boolean) => {
    setIsDarkState(newIsDark);
    localStorage.setItem('darkMode', JSON.stringify(newIsDark));
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div className="min-h-screen bg-zinc-950">{children}</div>;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        setTheme,
        setIsDark,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}; 