"use client";

import { Toaster } from 'sonner';
import { useTheme } from '@/lib/theme-context';
import { useEffect, useState } from 'react';

export function AppToaster() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

  // Use try-catch to handle theme context issues gracefully
  let isDark = true; // default to dark
  try {
    const themeContext = useTheme();
    isDark = themeContext.isDark;
  } catch (error) {
    // Fallback if theme context is not available
    console.warn('Theme context not available, using default dark theme');
  }
  
  return (
    <Toaster 
      position="bottom-right"
      theme={isDark ? 'dark' : 'light'}
      toastOptions={{
        className: 'rounded-xl border border-zinc-800 dark:border-zinc-700 bg-zinc-950 dark:bg-zinc-900 text-white dark:text-zinc-100 shadow-lg font-medium',
        style: {
          fontFamily: 'inherit',
          fontSize: '0.875rem',
        },
        closeButton: true,
      }}
    />
  );
} 