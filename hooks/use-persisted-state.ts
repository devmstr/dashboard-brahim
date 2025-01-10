import { useState, useEffect } from 'react'

export function usePersistedState<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      const persistedState = localStorage.getItem(key)
      return persistedState ? JSON.parse(persistedState) : defaultValue
    }
    return defaultValue
  })

  useEffect(() => {
    // Only run this effect on the client-side
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(state))
    }
  }, [key, state])

  return [state, setState]
}
