'use client'

import { useEffect, useCallback, useRef } from 'react'

interface UseKeyboardNavigationOptions {
  enabled?: boolean
  trapFocus?: boolean
  restoreFocus?: boolean
  autoFocus?: boolean
}

export const useKeyboardNavigation = (
  containerRef: React.RefObject<HTMLElement>,
  options: UseKeyboardNavigationOptions = {}
) => {
  const {
    enabled = true,
    trapFocus = false,
    restoreFocus = false,
    autoFocus = false
  } = options

  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter(element => {
        const style = window.getComputedStyle(element as HTMLElement)
        return style.display !== 'none' && style.visibility !== 'hidden'
      }) as HTMLElement[]
  }, [])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled || !containerRef.current) return

    const focusableElements = getFocusableElements(containerRef.current)
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)

    switch (event.key) {
      case 'Tab': {
        if (!trapFocus || focusableElements.length === 0) return

        event.preventDefault()

        if (event.shiftKey) {
          // Shift + Tab (previous)
          const previousIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1
          focusableElements[previousIndex]?.focus()
        } else {
          // Tab (next)
          const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0
          focusableElements[nextIndex]?.focus()
        }
        break
      }

      case 'ArrowDown':
      case 'ArrowRight': {
        if (focusableElements.length === 0) return
        
        event.preventDefault()
        const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0
        focusableElements[nextIndex]?.focus()
        break
      }

      case 'ArrowUp':
      case 'ArrowLeft': {
        if (focusableElements.length === 0) return
        
        event.preventDefault()
        const previousIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1
        focusableElements[previousIndex]?.focus()
        break
      }

      case 'Home': {
        if (focusableElements.length === 0) return
        
        event.preventDefault()
        focusableElements[0]?.focus()
        break
      }

      case 'End': {
        if (focusableElements.length === 0) return
        
        event.preventDefault()
        focusableElements[focusableElements.length - 1]?.focus()
        break
      }

      case 'Escape': {
        if (restoreFocus && previouslyFocusedElement.current) {
          previouslyFocusedElement.current.focus()
        }
        break
      }
    }
  }, [enabled, containerRef, getFocusableElements, trapFocus, restoreFocus])

  // Setup keyboard event listeners
  useEffect(() => {
    if (!enabled) return

    const container = containerRef.current
    if (!container) return

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, containerRef, handleKeyDown])

  // Store previously focused element and handle auto focus
  useEffect(() => {
    if (!enabled) return

    const container = containerRef.current
    if (!container) return

    // Store previously focused element
    if (restoreFocus) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement
    }

    // Auto focus first focusable element
    if (autoFocus) {
      const focusableElements = getFocusableElements(container)
      if (focusableElements.length > 0) {
        focusableElements[0].focus()
      }
    }

    return () => {
      // Restore focus when component unmounts
      if (restoreFocus && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus()
      }
    }
  }, [enabled, containerRef, restoreFocus, autoFocus, getFocusableElements])

  return {
    getFocusableElements: () => {
      if (!containerRef.current) return []
      return getFocusableElements(containerRef.current)
    },
    focusFirst: () => {
      if (!containerRef.current) return
      const focusableElements = getFocusableElements(containerRef.current)
      focusableElements[0]?.focus()
    },
    focusLast: () => {
      if (!containerRef.current) return
      const focusableElements = getFocusableElements(containerRef.current)
      focusableElements[focusableElements.length - 1]?.focus()
    }
  }
}

// Hook for managing focus announcements
export const useFocusAnnouncement = () => {
  const announce = useCallback((element: HTMLElement) => {
    const text = element.textContent || element.getAttribute('aria-label') || element.tagName
    
    // Create temporary live region for focus announcements
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only'
    liveRegion.textContent = `フォーカス: ${text}`
    
    document.body.appendChild(liveRegion)
    
    setTimeout(() => {
      document.body.removeChild(liveRegion)
    }, 1000)
  }, [])

  return { announce }
}

// Hook for managing roving tabindex
export const useRovingTabindex = (
  itemsRef: React.RefObject<HTMLElement[]>,
  orientation: 'horizontal' | 'vertical' = 'horizontal'
) => {
  const currentIndex = useRef(0)

  const updateTabindex = useCallback((activeIndex: number) => {
    if (!itemsRef.current) return

    itemsRef.current.forEach((item, index) => {
      if (item) {
        item.setAttribute('tabindex', index === activeIndex ? '0' : '-1')
      }
    })
    
    currentIndex.current = activeIndex
  }, [itemsRef])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!itemsRef.current) return

    const items = itemsRef.current.filter(Boolean)
    if (items.length === 0) return

    let newIndex = currentIndex.current

    switch (event.key) {
      case orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown':
        event.preventDefault()
        newIndex = (currentIndex.current + 1) % items.length
        break

      case orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp':
        event.preventDefault()
        newIndex = currentIndex.current > 0 ? currentIndex.current - 1 : items.length - 1
        break

      case 'Home':
        event.preventDefault()
        newIndex = 0
        break

      case 'End':
        event.preventDefault()
        newIndex = items.length - 1
        break

      default:
        return
    }

    updateTabindex(newIndex)
    items[newIndex]?.focus()
  }, [itemsRef, orientation, updateTabindex])

  const handleFocus = useCallback((index: number) => {
    updateTabindex(index)
  }, [updateTabindex])

  // Initialize tabindex
  useEffect(() => {
    updateTabindex(0)
  }, [updateTabindex])

  return {
    handleKeyDown,
    handleFocus,
    updateTabindex,
    currentIndex: currentIndex.current
  }
}