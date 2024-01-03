'use client'

import React, { useEffect, useRef } from 'react'
import {
  EasingDefinition,
  motion,
  useAnimation,
  useInView
} from 'framer-motion'

type Direction = 'left' | 'right' | 'top' | 'bottom'
type Offset = { x?: string; y?: string }

interface FaderProps extends React.HTMLAttributes<HTMLDivElement> {
  from?: Direction
  className?: string | undefined
  duration?: number
  delay?: number
  offset?: Offset
  easing?: EasingDefinition
  amount?: number | 'some' | 'all'
}

const getVariants = (
  direction?: Direction,
  { x = '0%', y = '0%' }: Offset = {}
) => {
  const variants = {
    left: {
      visible: { x: 0, y, opacity: 1 },
      hidden: { x: '-100%', y, opacity: 0 }
    },
    right: {
      visible: { x: 0, y, opacity: 1 },
      hidden: { x: '100%', y, opacity: 0 }
    },
    bottom: {
      visible: { x, y: 0, opacity: 1 },
      hidden: { x, y: '100%', opacity: 0 }
    },
    top: {
      visible: { x, y: 0, opacity: 1 },
      hidden: { x, y: '-100%', opacity: 0 }
    }
  }

  return direction ? variants[direction] : variants.top
}

export default function Fader({
  children,
  from,
  duration = 300,
  delay = 0,
  className,
  offset,
  easing = 'easeInOut',
  amount
}: FaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inScreen = useInView(ref, { once: true, amount })
  const animation = useAnimation()

  useEffect(() => {
    if (inScreen) {
      animation.start('visible')
    }
  }, [animation, inScreen])

  return (
    <motion.div
      className={className}
      ref={ref}
      variants={getVariants(from, offset)}
      initial="hidden"
      transition={{
        duration: duration / 1000,
        delay: delay / 1000,
        ease: easing
      }}
      animate={animation}
    >
      {children}
    </motion.div>
  )
}
