// Image optimization utilities

export interface ImageOptimizationOptions {
  quality?: number
  width?: number
  height?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
  lazy?: boolean
  priority?: boolean
}

export class ImageOptimizer {
  private static readonly DEFAULT_QUALITY = 80
  private static readonly SUPPORTED_FORMATS = ['webp', 'avif', 'jpeg', 'png']

  // Generate optimized image URL for Next.js Image component
  static generateOptimizedUrl(
    src: string, 
    options: ImageOptimizationOptions = {}
  ): string {
    const {
      quality = this.DEFAULT_QUALITY,
      width,
      height,
      format = 'webp'
    } = options

    const params = new URLSearchParams()
    
    if (width) params.set('w', width.toString())
    if (height) params.set('h', height.toString())
    if (quality !== this.DEFAULT_QUALITY) params.set('q', quality.toString())
    if (format !== 'webp') params.set('f', format)

    const queryString = params.toString()
    return queryString ? `${src}?${queryString}` : src
  }

  // Generate responsive image srcset
  static generateSrcSet(
    src: string,
    sizes: number[],
    options: Omit<ImageOptimizationOptions, 'width'> = {}
  ): string {
    return sizes
      .map(size => {
        const url = this.generateOptimizedUrl(src, { ...options, width: size })
        return `${url} ${size}w`
      })
      .join(', ')
  }

  // Check if browser supports modern image formats
  static async checkFormatSupport(): Promise<{
    webp: boolean
    avif: boolean
  }> {
    const checkFormat = (format: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
        img.src = `data:image/${format};base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA`
      })
    }

    const [webp, avif] = await Promise.all([
      checkFormat('webp'),
      checkFormat('avif')
    ])

    return { webp, avif }
  }

  // Get optimal format based on browser support
  static async getOptimalFormat(): Promise<'avif' | 'webp' | 'jpeg'> {
    const support = await this.checkFormatSupport()
    
    if (support.avif) return 'avif'
    if (support.webp) return 'webp'
    return 'jpeg'
  }

  // Preload critical images
  static preloadImage(src: string, options: ImageOptimizationOptions = {}): void {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = this.generateOptimizedUrl(src, options)
    
    if (options.format) {
      link.type = `image/${options.format}`
    }
    
    document.head.appendChild(link)
  }

  // Lazy load images with Intersection Observer
  static setupLazyLoading(selector: string = 'img[data-lazy]'): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without Intersection Observer
      const images = document.querySelectorAll(selector)
      images.forEach((img) => {
        const element = img as HTMLImageElement
        if (element.dataset.src) {
          element.src = element.dataset.src
          element.removeAttribute('data-lazy')
        }
      })
      return
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.removeAttribute('data-lazy')
            observer.unobserve(img)
          }
        }
      })
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    })

    const images = document.querySelectorAll(selector)
    images.forEach(img => imageObserver.observe(img))
  }

  // Calculate image dimensions maintaining aspect ratio
  static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    targetWidth?: number,
    targetHeight?: number
  ): { width: number; height: number } {
    if (!targetWidth && !targetHeight) {
      return { width: originalWidth, height: originalHeight }
    }

    if (targetWidth && targetHeight) {
      return { width: targetWidth, height: targetHeight }
    }

    const aspectRatio = originalWidth / originalHeight

    if (targetWidth) {
      return {
        width: targetWidth,
        height: Math.round(targetWidth / aspectRatio)
      }
    }

    if (targetHeight) {
      return {
        width: Math.round(targetHeight * aspectRatio),
        height: targetHeight
      }
    }

    return { width: originalWidth, height: originalHeight }
  }
}

// React hook for optimized images
import { useEffect, useState } from 'react'

export function useOptimizedImage(src: string, options: ImageOptimizationOptions = {}) {
  const [optimizedSrc, setOptimizedSrc] = useState<string>(src)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadOptimizedImage = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get optimal format if not specified
        let format = options.format
        if (!format) {
          format = await ImageOptimizer.getOptimalFormat()
        }

        const optimizedUrl = ImageOptimizer.generateOptimizedUrl(src, {
          ...options,
          format
        })

        // Preload the image to check if it loads successfully
        const img = new Image()
        img.onload = () => {
          setOptimizedSrc(optimizedUrl)
          setIsLoading(false)
        }
        img.onerror = () => {
          setError('Failed to load image')
          setOptimizedSrc(src) // Fallback to original
          setIsLoading(false)
        }
        img.src = optimizedUrl

      } catch (err) {
        setError('Failed to optimize image')
        setOptimizedSrc(src)
        setIsLoading(false)
      }
    }

    loadOptimizedImage()
  }, [src, options.quality, options.width, options.height, options.format])

  return { optimizedSrc, isLoading, error }
}