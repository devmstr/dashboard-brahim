import { RefObject, useEffect, useRef } from 'react'
import { useScroll } from 'framer-motion'

export function useScrollProgress(scrollRef: RefObject<HTMLElement>) {
  const containerRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({ container: containerRef })

  useEffect(() => {
    if (scrollRef.current) {
      containerRef.current = scrollRef.current
    }
  }, [scrollRef])

  return scrollYProgress
}
