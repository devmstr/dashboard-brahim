'use client'

import { useState, useEffect } from 'react'

const useScreenSize = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)

    // Set initial match value
    setMatches(mediaQuery.matches)

    // Update match value on screen resize
    const handleChange = (event: MediaQueryListEvent) =>
      setMatches(event.matches)

    mediaQuery.addEventListener('change', handleChange)

    // Cleanup listener on unmount
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [query])

  return matches
}

export default useScreenSize
