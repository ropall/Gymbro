import { useState, useEffect, useCallback } from 'react'
import { useWorkoutStore } from '../stores/workoutStore'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const syncPendingSession = useWorkoutStore((s) => s.syncPendingSession)
  const pendingSync = useWorkoutStore((s) => s.pendingSync)

  const handleOnline = useCallback(() => {
    setIsOnline(true)
    if (pendingSync) {
      syncPendingSession()
    }
  }, [pendingSync, syncPendingSession])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
  }, [])

  useEffect(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  return isOnline
}
