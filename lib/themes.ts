export interface Theme {
  name: string;
  displayName: string;
  colors: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}

export const themes: Theme[] = [
  {
    name: 'default',
    displayName: 'Default',
    colors: {
      light: {
        '--background': '0 0% 100%',
        '--foreground': '0 0% 3.9%',
        '--card': '0 0% 100%',
        '--card-foreground': '0 0% 3.9%',
        '--popover': '0 0% 100%',
        '--popover-foreground': '0 0% 3.9%',
        '--primary': '0 72.2% 50.6%',
        '--primary-foreground': '0 85.7% 97.3%',
        '--secondary': '0 0% 96.1%',
        '--secondary-foreground': '0 0% 9%',
        '--muted': '0 0% 96.1%',
        '--muted-foreground': '0 0% 45.1%',
        '--accent': '0 0% 96.1%',
        '--accent-foreground': '0 0% 9%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '0 0% 98%',
        '--border': '0 0% 89.8%',
        '--input': '0 0% 89.8%',
        '--ring': '0 72.2% 50.6%',
      },
      dark: {
        '--background': '0 0% 3.9%',
        '--foreground': '0 0% 98%',
        '--card': '0 0% 3.9%',
        '--card-foreground': '0 0% 98%',
        '--popover': '0 0% 3.9%',
        '--popover-foreground': '0 0% 98%',
        '--primary': '0 72.2% 50.6%',
        '--primary-foreground': '0 85.7% 97.3%',
        '--secondary': '0 0% 14.9%',
        '--secondary-foreground': '0 0% 98%',
        '--muted': '0 0% 14.9%',
        '--muted-foreground': '0 0% 63.9%',
        '--accent': '0 0% 14.9%',
        '--accent-foreground': '0 0% 98%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '0 0% 98%',
        '--border': '0 0% 14.9%',
        '--input': '0 0% 14.9%',
        '--ring': '0 72.2% 50.6%',
      }
    }
  },
  {
    name: 'blue',
    displayName: 'Ocean Blue',
    colors: {
      light: {
        '--background': '0 0% 100%',
        '--foreground': '222.2 84% 4.9%',
        '--card': '0 0% 100%',
        '--card-foreground': '222.2 84% 4.9%',
        '--popover': '0 0% 100%',
        '--popover-foreground': '222.2 84% 4.9%',
        '--primary': '221.2 83.2% 53.3%',
        '--primary-foreground': '210 40% 98%',
        '--secondary': '210 40% 96%',
        '--secondary-foreground': '222.2 84% 4.9%',
        '--muted': '210 40% 96%',
        '--muted-foreground': '215.4 16.3% 46.9%',
        '--accent': '210 40% 96%',
        '--accent-foreground': '222.2 84% 4.9%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '210 40% 98%',
        '--border': '214.3 31.8% 91.4%',
        '--input': '214.3 31.8% 91.4%',
        '--ring': '221.2 83.2% 53.3%',
      },
      dark: {
        '--background': '0 0% 3.9%',
        '--foreground': '210 40% 98%',
        '--card': '0 0% 3.9%',
        '--card-foreground': '210 40% 98%',
        '--popover': '0 0% 3.9%',
        '--popover-foreground': '210 40% 98%',
        '--primary': '217.2 91.2% 59.8%',
        '--primary-foreground': '222.2 84% 4.9%',
        '--secondary': '217.2 32.6% 17.5%',
        '--secondary-foreground': '210 40% 98%',
        '--muted': '217.2 32.6% 17.5%',
        '--muted-foreground': '215 20.2% 65.1%',
        '--accent': '217.2 32.6% 17.5%',
        '--accent-foreground': '210 40% 98%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '210 40% 98%',
        '--border': '217.2 32.6% 17.5%',
        '--input': '217.2 32.6% 17.5%',
        '--ring': '224.3 76.3% 48%',
      }
    }
  },
  {
    name: 'green',
    displayName: 'Forest Green',
    colors: {
      light: {
        '--background': '0 0% 100%',
        '--foreground': '240 10% 3.9%',
        '--card': '0 0% 100%',
        '--card-foreground': '240 10% 3.9%',
        '--popover': '0 0% 100%',
        '--popover-foreground': '240 10% 3.9%',
        '--primary': '142.1 76.2% 36.3%',
        '--primary-foreground': '355.7 100% 97.3%',
        '--secondary': '240 4.8% 95.9%',
        '--secondary-foreground': '240 5.9% 10%',
        '--muted': '240 4.8% 95.9%',
        '--muted-foreground': '240 3.8% 46.1%',
        '--accent': '240 4.8% 95.9%',
        '--accent-foreground': '240 5.9% 10%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '0 0% 98%',
        '--border': '240 5.9% 90%',
        '--input': '240 5.9% 90%',
        '--ring': '142.1 76.2% 36.3%',
      },
      dark: {
        '--background': '20 14.3% 4.1%',
        '--foreground': '0 0% 95%',
        '--card': '24 9.8% 10%',
        '--card-foreground': '0 0% 95%',
        '--popover': '0 0% 9%',
        '--popover-foreground': '0 0% 95%',
        '--primary': '142.1 70.6% 45.3%',
        '--primary-foreground': '144.9 80.4% 10%',
        '--secondary': '240 3.7% 15.9%',
        '--secondary-foreground': '0 0% 98%',
        '--muted': '0 0% 15%',
        '--muted-foreground': '240 5% 64.9%',
        '--accent': '12 6.5% 15.1%',
        '--accent-foreground': '0 0% 98%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '0 85.7% 97.3%',
        '--border': '240 3.7% 15.9%',
        '--input': '240 3.7% 15.9%',
        '--ring': '142.4 71.8% 29.2%',
      }
    }
  },
  {
    name: 'purple',
    displayName: 'Royal Purple',
    colors: {
      light: {
        '--background': '0 0% 100%',
        '--foreground': '224 71.4% 4.1%',
        '--card': '0 0% 100%',
        '--card-foreground': '224 71.4% 4.1%',
        '--popover': '0 0% 100%',
        '--popover-foreground': '224 71.4% 4.1%',
        '--primary': '262.1 83.3% 57.8%',
        '--primary-foreground': '210 20% 98%',
        '--secondary': '220 14.3% 95.9%',
        '--secondary-foreground': '220.9 39.3% 11%',
        '--muted': '220 14.3% 95.9%',
        '--muted-foreground': '220 8.9% 46.1%',
        '--accent': '220 14.3% 95.9%',
        '--accent-foreground': '220.9 39.3% 11%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '210 20% 98%',
        '--border': '220 13% 91%',
        '--input': '220 13% 91%',
        '--ring': '262.1 83.3% 57.8%',
      },
      dark: {
        '--background': '0 0% 3.9%',
        '--foreground': '210 20% 98%',
        '--card': '0 0% 3.9%',
        '--card-foreground': '210 20% 98%',
        '--popover': '0 0% 3.9%',
        '--popover-foreground': '210 20% 98%',
        '--primary': '263.4 70% 50.4%',
        '--primary-foreground': '210 20% 98%',
        '--secondary': '215 27.9% 16.9%',
        '--secondary-foreground': '210 20% 98%',
        '--muted': '215 27.9% 16.9%',
        '--muted-foreground': '217.9 10.6% 64.9%',
        '--accent': '215 27.9% 16.9%',
        '--accent-foreground': '210 20% 98%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '210 20% 98%',
        '--border': '215 27.9% 16.9%',
        '--input': '215 27.9% 16.9%',
        '--ring': '263.4 70% 50.4%',
      }
    }
  },
  {
    name: 'orange',
    displayName: 'Sunset Orange',
    colors: {
      light: {
        '--background': '0 0% 100%',
        '--foreground': '20 14.3% 4.1%',
        '--card': '0 0% 100%',
        '--card-foreground': '20 14.3% 4.1%',
        '--popover': '0 0% 100%',
        '--popover-foreground': '20 14.3% 4.1%',
        '--primary': '24.6 95% 53.1%',
        '--primary-foreground': '60 9.1% 97.8%',
        '--secondary': '60 4.8% 95.9%',
        '--secondary-foreground': '24 9.8% 10%',
        '--muted': '60 4.8% 95.9%',
        '--muted-foreground': '25 5.3% 44.7%',
        '--accent': '60 4.8% 95.9%',
        '--accent-foreground': '24 9.8% 10%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '60 9.1% 97.8%',
        '--border': '20 5.9% 90%',
        '--input': '20 5.9% 90%',
        '--ring': '24.6 95% 53.1%',
      },
      dark: {
        '--background': '20 14.3% 4.1%',
        '--foreground': '60 9.1% 97.8%',
        '--card': '20 14.3% 4.1%',
        '--card-foreground': '60 9.1% 97.8%',
        '--popover': '0 0% 9%',
        '--popover-foreground': '60 9.1% 97.8%',
        '--primary': '20.5 90.2% 48.2%',
        '--primary-foreground': '60 9.1% 97.8%',
        '--secondary': '12 6.5% 15.1%',
        '--secondary-foreground': '60 9.1% 97.8%',
        '--muted': '12 6.5% 15.1%',
        '--muted-foreground': '24 5.4% 63.9%',
        '--accent': '12 6.5% 15.1%',
        '--accent-foreground': '60 9.1% 97.8%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '60 9.1% 97.8%',
        '--border': '12 6.5% 15.1%',
        '--input': '12 6.5% 15.1%',
        '--ring': '20.5 90.2% 48.2%',
      }
    }
  },
  {
    name: 'pink',
    displayName: 'Cherry Blossom',
    colors: {
      light: {
        '--background': '0 0% 100%',
        '--foreground': '240 10% 3.9%',
        '--card': '0 0% 100%',
        '--card-foreground': '240 10% 3.9%',
        '--popover': '0 0% 100%',
        '--popover-foreground': '240 10% 3.9%',
        '--primary': '346.8 77.2% 49.8%',
        '--primary-foreground': '355.7 100% 97.3%',
        '--secondary': '240 4.8% 95.9%',
        '--secondary-foreground': '240 5.9% 10%',
        '--muted': '240 4.8% 95.9%',
        '--muted-foreground': '240 3.8% 46.1%',
        '--accent': '240 4.8% 95.9%',
        '--accent-foreground': '240 5.9% 10%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '0 0% 98%',
        '--border': '240 5.9% 90%',
        '--input': '240 5.9% 90%',
        '--ring': '346.8 77.2% 49.8%',
      },
      dark: {
        '--background': '20 14.3% 4.1%',
        '--foreground': '0 0% 95%',
        '--card': '24 9.8% 10%',
        '--card-foreground': '0 0% 95%',
        '--popover': '0 0% 9%',
        '--popover-foreground': '0 0% 95%',
        '--primary': '346.8 77.2% 49.8%',
        '--primary-foreground': '355.7 100% 97.3%',
        '--secondary': '240 3.7% 15.9%',
        '--secondary-foreground': '0 0% 98%',
        '--muted': '0 0% 15%',
        '--muted-foreground': '240 5% 64.9%',
        '--accent': '12 6.5% 15.1%',
        '--accent-foreground': '0 0% 98%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '0 85.7% 97.3%',
        '--border': '240 3.7% 15.9%',
        '--input': '240 3.7% 15.9%',
        '--ring': '346.8 77.2% 49.8%',
      }
    }
  },
  {
    name: 'teal',
    displayName: 'Ocean Teal',
    colors: {
      light: {
        '--background': '0 0% 100%',
        '--foreground': '240 10% 3.9%',
        '--card': '0 0% 100%',
        '--card-foreground': '240 10% 3.9%',
        '--popover': '0 0% 100%',
        '--popover-foreground': '240 10% 3.9%',
        '--primary': '173 80% 40%',
        '--primary-foreground': '0 0% 98%',
        '--secondary': '240 4.8% 95.9%',
        '--secondary-foreground': '240 5.9% 10%',
        '--muted': '240 4.8% 95.9%',
        '--muted-foreground': '240 3.8% 46.1%',
        '--accent': '240 4.8% 95.9%',
        '--accent-foreground': '240 5.9% 10%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '0 0% 98%',
        '--border': '240 5.9% 90%',
        '--input': '240 5.9% 90%',
        '--ring': '173 80% 40%',
      },
      dark: {
        '--background': '20 14.3% 4.1%',
        '--foreground': '0 0% 95%',
        '--card': '24 9.8% 10%',
        '--card-foreground': '0 0% 95%',
        '--popover': '0 0% 9%',
        '--popover-foreground': '0 0% 95%',
        '--primary': '173 80% 40%',
        '--primary-foreground': '0 0% 98%',
        '--secondary': '240 3.7% 15.9%',
        '--secondary-foreground': '0 0% 98%',
        '--muted': '0 0% 15%',
        '--muted-foreground': '240 5% 64.9%',
        '--accent': '12 6.5% 15.1%',
        '--accent-foreground': '0 0% 98%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '0 85.7% 97.3%',
        '--border': '240 3.7% 15.9%',
        '--input': '240 3.7% 15.9%',
        '--ring': '173 80% 40%',
      }
    }
  },
  {
    name: 'amber',
    displayName: 'Golden Amber',
    colors: {
      light: {
        '--background': '0 0% 100%',
        '--foreground': '20 14.3% 4.1%',
        '--card': '0 0% 100%',
        '--card-foreground': '20 14.3% 4.1%',
        '--popover': '0 0% 100%',
        '--popover-foreground': '20 14.3% 4.1%',
        '--primary': '47.9 95.8% 53.1%',
        '--primary-foreground': '26 83.3% 14.1%',
        '--secondary': '60 4.8% 95.9%',
        '--secondary-foreground': '24 9.8% 10%',
        '--muted': '60 4.8% 95.9%',
        '--muted-foreground': '25 5.3% 44.7%',
        '--accent': '60 4.8% 95.9%',
        '--accent-foreground': '24 9.8% 10%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '60 9.1% 97.8%',
        '--border': '20 5.9% 90%',
        '--input': '20 5.9% 90%',
        '--ring': '47.9 95.8% 53.1%',
      },
      dark: {
        '--background': '20 14.3% 4.1%',
        '--foreground': '60 9.1% 97.8%',
        '--card': '20 14.3% 4.1%',
        '--card-foreground': '60 9.1% 97.8%',
        '--popover': '0 0% 9%',
        '--popover-foreground': '60 9.1% 97.8%',
        '--primary': '47.9 95.8% 53.1%',
        '--primary-foreground': '26 83.3% 14.1%',
        '--secondary': '12 6.5% 15.1%',
        '--secondary-foreground': '60 9.1% 97.8%',
        '--muted': '12 6.5% 15.1%',
        '--muted-foreground': '24 5.4% 63.9%',
        '--accent': '12 6.5% 15.1%',
        '--accent-foreground': '60 9.1% 97.8%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '60 9.1% 97.8%',
        '--border': '12 6.5% 15.1%',
        '--input': '12 6.5% 15.1%',
        '--ring': '47.9 95.8% 53.1%',
      }
    }
  }
];

export const getTheme = (themeName: string): Theme => {
  return themes.find(theme => theme.name === themeName) || themes[0];
};

// Optimized theme application with batch updates
export const applyTheme = (themeName: string, isDark: boolean = true) => {
  const theme = getTheme(themeName);
  const colors = isDark ? theme.colors.dark : theme.colors.light;

  const root = document.documentElement;

  // Use requestAnimationFrame for better performance
  requestAnimationFrame(() => {
    // Batch all CSS variable updates
    const cssText = Object.entries(colors)
      .map(([property, value]) => `${property}: ${value}`)
      .join('; ');

    // Apply all variables at once
    root.style.cssText = root.style.cssText + cssText;
  });
};

// Pre-computed theme cache for better performance
const themeCache = new Map<string, Record<string, string>>();

export const getCachedTheme = (themeName: string, isDark: boolean = true): Record<string, string> => {
  const cacheKey = `${themeName}-${isDark ? 'dark' : 'light'}`;

  if (!themeCache.has(cacheKey)) {
    const theme = getTheme(themeName);
    const colors = isDark ? theme.colors.dark : theme.colors.light;
    themeCache.set(cacheKey, colors);
  }

  return themeCache.get(cacheKey)!;
};

// Optimized theme switching with minimal DOM updates
export const switchTheme = (themeName: string, isDark: boolean = true) => {
  const colors = getCachedTheme(themeName, isDark);
  const root = document.documentElement;

  // Only update changed properties
  Object.entries(colors).forEach(([property, value]) => {
    const currentValue = root.style.getPropertyValue(property);
    if (currentValue !== value) {
      root.style.setProperty(property, value);
    }
  });
}; 