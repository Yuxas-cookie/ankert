'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { PerformanceMonitor } from '@/lib/performance/performance-monitor'
import { BrowserCacheManager } from '@/lib/performance/cache-manager'

interface PerformanceContextType {
  monitor: PerformanceMonitor
  trackPageView: (pageName: string) => void
  trackUserAction: (action: string, data?: any) => void
}

const PerformanceContext = createContext<PerformanceContextType | null>(null)

interface PerformanceProviderProps {
  children: ReactNode
  enableTracking?: boolean
}

export function PerformanceProvider({ 
  children, 
  enableTracking = process.env.NODE_ENV === 'production' 
}: PerformanceProviderProps) {
  const monitor = PerformanceMonitor.getInstance()

  const trackPageView = (pageName: string) => {
    if (!enableTracking) return

    monitor.measureWebVitals().then((metrics) => {
      monitor.reportMetrics(pageName, metrics)
    })
  }

  const trackUserAction = (action: string, data?: any) => {
    if (!enableTracking) return

    // Track user interactions for performance analysis
    const timestamp = performance.now()
    
    // Store action data for analysis
    try {
      fetch('/api/analytics/user-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          data,
          timestamp,
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch(error => {
        console.warn('Failed to track user action:', error)
      })
    } catch (error) {
      console.warn('Failed to track user action:', error)
    }
  }

  useEffect(() => {
    if (!enableTracking) return

    // Cleanup localStorage on mount
    BrowserCacheManager.cleanupLocal()

    // Setup periodic cleanup
    const cleanupInterval = setInterval(() => {
      BrowserCacheManager.cleanupLocal()
    }, 60000) // Every minute

    // Track initial page view
    trackPageView(window.location.pathname)

    // Setup resource timing observer
    let resourceObserver: PerformanceObserver | null = null
    
    if ('PerformanceObserver' in window) {
      try {
        resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          for (const entry of entries) {
            if (entry.duration > 1000) { // Track slow resources (>1s)
              console.warn('Slow resource detected:', {
                name: entry.name,
                duration: entry.duration,
                type: (entry as any).initiatorType
              })
            }
          }
        })

        resourceObserver.observe({ entryTypes: ['resource'] })
      } catch (error) {
        console.warn('Failed to setup PerformanceObserver:', error)
      }
    }

    return () => {
      clearInterval(cleanupInterval)
      if (resourceObserver) {
        resourceObserver.disconnect()
      }
    }
  }, [enableTracking, trackPageView])

  return (
    <PerformanceContext.Provider value={{ monitor, trackPageView, trackUserAction }}>
      {children}
    </PerformanceContext.Provider>
  )
}

export function usePerformance() {
  const context = useContext(PerformanceContext)
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider')
  }
  return context
}

// HOC for tracking page views
export function withPerformanceTracking<T extends {}>(
  Component: React.ComponentType<T>,
  pageName: string
) {
  return function PerformanceTrackedComponent(props: T) {
    const { trackPageView } = usePerformance()

    useEffect(() => {
      trackPageView(pageName)
    }, [trackPageView])

    return <Component {...props} />
  }
}

// Hook for tracking component render times
export function useRenderTime(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime

      if (renderTime > 100) { // Log slow renders (>100ms)
        console.warn(`Slow render detected in ${componentName}:`, {
          renderTime: renderTime.toFixed(2),
          component: componentName
        })
      }
    }
  })
}