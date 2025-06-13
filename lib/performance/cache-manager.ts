// Advanced caching strategies for performance optimization

export interface CacheConfig {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of items
  staleWhileRevalidate?: boolean
}

export class CacheManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>
  private maxSize: number

  constructor(config: CacheConfig = {}) {
    this.cache = new Map()
    this.maxSize = config.maxSize || 1000
  }

  // Set item in cache
  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    // Remove oldest item if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  // Get item from cache
  get(key: string): any | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Check if item is expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  // Check if item exists and is valid
  has(key: string): boolean {
    return this.get(key) !== null
  }

  // Clear expired items
  cleanup(): number {
    let removedCount = 0
    const now = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
        removedCount++
      }
    }

    return removedCount
  }

  // Clear all items
  clear(): void {
    this.cache.clear()
  }

  // Get cache statistics
  getStats(): {
    size: number
    maxSize: number
    usage: number
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      usage: (this.cache.size / this.maxSize) * 100
    }
  }
}

// Browser cache utilities
export class BrowserCacheManager {
  // Cache in localStorage with expiration
  static setLocal(key: string, data: any, ttl: number = 86400000): void { // 24 hours default
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    }

    try {
      localStorage.setItem(key, JSON.stringify(item))
    } catch (error) {
      console.warn('Failed to set localStorage item:', error)
    }
  }

  // Get from localStorage
  static getLocal(key: string): any | null {
    try {
      const item = localStorage.getItem(key)
      if (!item) return null

      const parsed = JSON.parse(item)
      
      // Check if expired
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(key)
        return null
      }

      return parsed.data
    } catch (error) {
      console.warn('Failed to get localStorage item:', error)
      return null
    }
  }

  // Cache in sessionStorage
  static setSession(key: string, data: any): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to set sessionStorage item:', error)
    }
  }

  // Get from sessionStorage
  static getSession(key: string): any | null {
    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.warn('Failed to get sessionStorage item:', error)
      return null
    }
  }

  // Clean expired localStorage items
  static cleanupLocal(): number {
    let removedCount = 0
    const now = Date.now()

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue

      try {
        const item = localStorage.getItem(key)
        if (!item) continue

        const parsed = JSON.parse(item)
        if (parsed.timestamp && parsed.ttl && now - parsed.timestamp > parsed.ttl) {
          localStorage.removeItem(key)
          removedCount++
          i-- // Adjust index since item was removed
        }
      } catch (error) {
        // Invalid JSON, remove the item
        localStorage.removeItem(key)
        removedCount++
        i--
      }
    }

    return removedCount
  }
}

// Service Worker cache management
export class ServiceWorkerCacheManager {
  private cacheName: string

  constructor(cacheName: string = 'survey-app-cache-v1') {
    this.cacheName = cacheName
  }

  // Cache resources
  async cacheResources(resources: string[]): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported')
      return
    }

    try {
      const cache = await caches.open(this.cacheName)
      await cache.addAll(resources)
    } catch (error) {
      console.error('Failed to cache resources:', error)
    }
  }

  // Get from cache
  async getFromCache(request: string | Request): Promise<Response | undefined> {
    if (!('caches' in window)) {
      return undefined
    }

    try {
      const cache = await caches.open(this.cacheName)
      return await cache.match(request)
    } catch (error) {
      console.error('Failed to get from cache:', error)
      return undefined
    }
  }

  // Add to cache
  async addToCache(request: string | Request, response: Response): Promise<void> {
    if (!('caches' in window)) {
      return
    }

    try {
      const cache = await caches.open(this.cacheName)
      await cache.put(request, response.clone())
    } catch (error) {
      console.error('Failed to add to cache:', error)
    }
  }

  // Clear cache
  async clearCache(): Promise<boolean> {
    if (!('caches' in window)) {
      return false
    }

    try {
      return await caches.delete(this.cacheName)
    } catch (error) {
      console.error('Failed to clear cache:', error)
      return false
    }
  }
}

// React hook for caching
import { useCallback, useEffect, useRef } from 'react'

export function useCache<T>(key: string, ttl: number = 300000) {
  const cacheRef = useRef<CacheManager>(new CacheManager())

  const setCache = useCallback((data: T) => {
    cacheRef.current.set(key, data, ttl)
  }, [key, ttl])

  const getCache = useCallback((): T | null => {
    return cacheRef.current.get(key)
  }, [key])

  const clearCache = useCallback(() => {
    cacheRef.current.clear()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    const cleanup = setInterval(() => {
      cacheRef.current.cleanup()
    }, 60000) // Cleanup every minute

    return () => clearInterval(cleanup)
  }, [])

  return { setCache, getCache, clearCache }
}