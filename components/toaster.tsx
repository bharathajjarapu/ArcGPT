"use client";

import { useEffect, useState } from 'react';

// Simple toast system
let toastContainer: HTMLDivElement | null = null;

const createToastContainer = () => {
  if (typeof window === 'undefined') return null;

  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'fixed bottom-4 right-4 z-50 space-y-2';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  if (typeof window === 'undefined') return;

  const container = createToastContainer();
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `
    px-4 py-2 rounded-lg border shadow-lg font-medium text-sm backdrop-blur-md
    ${type === 'success'
      ? 'bg-green-600/20 text-green-100 border-green-500/30'
      : 'bg-red-600/20 text-red-100 border-red-500/30'
    }
  `;

  toast.textContent = message;

  container.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
};

export function AppToaster() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Make showToast available globally for use in other components
    (window as any).showToast = showToast;

    return () => {
      if (toastContainer && toastContainer.parentNode) {
        toastContainer.parentNode.removeChild(toastContainer);
        toastContainer = null;
      }
      delete (window as any).showToast;
    };
  }, []);

  // Don't render anything - this is just a setup component
  if (!mounted) {
    return null;
  }

  return null;
}

// Export showToast for use in other components
export { showToast }; 