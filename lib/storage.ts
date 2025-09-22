// Debounced localStorage utilities for better performance
const storageQueue = new Map<string, { value: string, timeoutId: NodeJS.Timeout }>()
const DEBOUNCE_DELAY = 300 // ms

export const debouncedSetItem = (key: string, value: string) => {
  // Clear existing timeout for this key
  const existing = storageQueue.get(key)
  if (existing) {
    clearTimeout(existing.timeoutId)
  }

  // Set new timeout
  const timeoutId = setTimeout(() => {
    localStorage.setItem(key, value)
    storageQueue.delete(key)
  }, DEBOUNCE_DELAY)

  storageQueue.set(key, { value, timeoutId })
}

// Force immediate write and clear debounce queue for a specific key
export const flushDebouncedItem = (key: string) => {
  const existing = storageQueue.get(key)
  if (existing) {
    clearTimeout(existing.timeoutId)
    localStorage.setItem(key, existing.value)
    storageQueue.delete(key)
  }
}

// Clear all pending debounced writes for keys matching a pattern
export const clearDebouncedPattern = (pattern: string) => {
  storageQueue.forEach((item, key) => {
    if (key.includes(pattern)) {
      clearTimeout(item.timeoutId)
      storageQueue.delete(key)
    }
  })
}

export const debouncedGetItem = (key: string): string | null => {
  return localStorage.getItem(key)
}

// Batch localStorage operations with background sync
const batchQueue = new Map<string, string>()
let batchTimeoutId: NodeJS.Timeout | null = null
let isBackgroundSyncEnabled = true

export const batchSetItem = (key: string, value: string) => {
  batchQueue.set(key, value)

  if (batchTimeoutId) {
    clearTimeout(batchTimeoutId)
  }

  batchTimeoutId = setTimeout(() => {
    // Use requestIdleCallback for background processing when available
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => {
        batchQueue.forEach((value, key) => {
          localStorage.setItem(key, value)
        })
        batchQueue.clear()
        batchTimeoutId = null
      }, { timeout: 2000 })
    } else {
      // Fallback to setTimeout for browsers without requestIdleCallback
      setTimeout(() => {
        batchQueue.forEach((value, key) => {
          localStorage.setItem(key, value)
        })
        batchQueue.clear()
        batchTimeoutId = null
      }, 0)
    }
  }, 100) // 100ms batch delay
}

// Background sync for critical data
export const backgroundSync = {
  enable: () => { isBackgroundSyncEnabled = true },
  disable: () => { isBackgroundSyncEnabled = false },
  isEnabled: () => isBackgroundSyncEnabled
}

// Optimized localStorage with memory caching
const memoryCache = new Map<string, string>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export const optimizedGetItem = (key: string): string | null => {
  // Check memory cache first
  const cached = memoryCache.get(key)
  if (cached) {
    return cached
  }

  // Get from localStorage
  const value = localStorage.getItem(key)
  if (value) {
    memoryCache.set(key, value)
    // Set cache expiry
    setTimeout(() => memoryCache.delete(key), CACHE_TTL)
  }

  return value
}

export const optimizedSetItem = (key: string, value: string) => {
  // Update memory cache
  memoryCache.set(key, value)
  setTimeout(() => memoryCache.delete(key), CACHE_TTL)

  // Use debounced localStorage
  debouncedSetItem(key, value)
}
