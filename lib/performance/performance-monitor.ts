// Performance monitoring utilities for production

export interface PerformanceMetrics {
  pageLoadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  timeToInteractive: number
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, PerformanceMetrics> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Measure Core Web Vitals
  measureWebVitals(): Promise<PerformanceMetrics> {
    return new Promise((resolve) => {
      const metrics: Partial<PerformanceMetrics> = {}

      // First Contentful Paint
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              metrics.firstContentfulPaint = entry.startTime
            }
          }
        })
        observer.observe({ entryTypes: ['paint'] })

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          metrics.largestContentfulPaint = lastEntry.startTime
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // Cumulative Layout Shift
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          metrics.cumulativeLayoutShift = clsValue
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            metrics.firstInputDelay = (entry as any).processingStart - entry.startTime
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // Time to Interactive (simplified estimation)
        window.addEventListener('load', () => {
          setTimeout(() => {
            metrics.timeToInteractive = performance.now()
            metrics.pageLoadTime = performance.timing.loadEventEnd - performance.timing.navigationStart

            resolve(metrics as PerformanceMetrics)
          }, 100)
        })
      } else if (typeof window !== 'undefined') {
        // Fallback for browsers without PerformanceObserver
        (window as any).addEventListener('load', () => {
          metrics.pageLoadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
          resolve(metrics as PerformanceMetrics)
        })
      } else {
        resolve(metrics as PerformanceMetrics)
      }
    })
  }

  // Report metrics to analytics
  async reportMetrics(pageName: string, metrics: PerformanceMetrics) {
    this.metrics.set(pageName, metrics)

    // Send to analytics service
    if (process.env.NODE_ENV === 'production') {
      try {
        await fetch('/api/analytics/performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: pageName,
            metrics,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
          }),
        })
      } catch (error) {
        console.warn('Failed to report performance metrics:', error)
      }
    }
  }

  // Get stored metrics
  getMetrics(pageName?: string): PerformanceMetrics | Map<string, PerformanceMetrics> | undefined {
    if (pageName) {
      return this.metrics.get(pageName)
    }
    return this.metrics
  }

  // Memory usage monitoring
  getMemoryUsage(): any {
    if ('memory' in performance) {
      return (performance as any).memory
    }
    return null
  }

  // Resource timing analysis
  analyzeResourceTiming(): Array<{
    name: string
    duration: number
    size: number
    type: string
  }> {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    return resources.map(resource => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize || 0,
      type: this.getResourceType(resource.name),
    }))
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script'
    if (url.includes('.css')) return 'stylesheet'
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image'
    if (url.includes('.woff') || url.includes('.ttf')) return 'font'
    return 'other'
  }
}

// React hook for performance monitoring
import { useEffect, useState } from 'react'

export function usePerformanceMonitor(pageName: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const monitor = PerformanceMonitor.getInstance()
    
    monitor.measureWebVitals().then((metrics) => {
      setMetrics(metrics)
      setIsLoading(false)
      monitor.reportMetrics(pageName, metrics)
    })
  }, [pageName])

  return { metrics, isLoading }
}