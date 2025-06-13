import { useCallback, useEffect, useRef, useState } from 'react'
import { debounce } from '../utils'

interface UseAutoSaveOptions<T> {
  data: T
  onSave: (data: T) => Promise<void>
  delay?: number
  enabled?: boolean
}

interface UseAutoSaveReturn {
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  lastSaved: Date | null
  manualSave: () => Promise<void>
  error: string | null
}

export function useAutoSave<T>({
  data,
  onSave,
  delay = 2000,
  enabled = true
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const dataRef = useRef<T>(data)
  const hasChangesRef = useRef(false)

  // Update data reference and mark as changed
  useEffect(() => {
    if (JSON.stringify(dataRef.current) !== JSON.stringify(data)) {
      dataRef.current = data
      hasChangesRef.current = true
      if (saveStatus === 'saved') {
        setSaveStatus('idle')
      }
    }
  }, [data]) // Remove saveStatus from dependencies to avoid loops

  const performSave = useCallback(async () => {
    if (!hasChangesRef.current || !enabled) return

    setSaveStatus('saving')
    setError(null)

    try {
      await onSave(dataRef.current)
      hasChangesRef.current = false
      setSaveStatus('saved')
      setLastSaved(new Date())
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
    } catch (err) {
      setSaveStatus('error')
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    }
  }, [onSave, enabled])

  // Debounced auto-save
  const debouncedSave = useCallback(
    debounce(performSave, delay),
    [performSave, delay]
  )

  // Trigger auto-save when data changes
  useEffect(() => {
    if (hasChangesRef.current && enabled && saveStatus !== 'saving') {
      debouncedSave()
    }
  }, [data, debouncedSave, enabled]) // Remove saveStatus from dependencies

  // Manual save function
  const manualSave = useCallback(async () => {
    // Cancel any pending auto-save
    debouncedSave.cancel()
    await performSave()
  }, [performSave, debouncedSave])

  // Save on unmount if there are unsaved changes
  useEffect(() => {
    return () => {
      if (hasChangesRef.current && enabled) {
        // Fire and forget - we can't wait for async in cleanup
        onSave(dataRef.current).catch(console.error)
      }
    }
  }, [onSave, enabled])

  return {
    saveStatus,
    lastSaved,
    manualSave,
    error
  }
}