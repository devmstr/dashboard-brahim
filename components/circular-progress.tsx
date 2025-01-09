import React from 'react'
import { cn } from '@/lib/utils'

interface CircularProgressBarProps {
  progress?: number
  strokeWidthRatio?: number
  circleColor?: string
  progressColor?: string
  children?: React.ReactNode
  className?: string
}

export const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  progress = 0,
  strokeWidthRatio = 0.15,
  circleColor = 'text-secondary',
  progressColor = 'text-primary',
  children,
  className
}) => {
  const viewBoxSize = 100 // We'll use this for calculations, but the SVG will scale
  const strokeWidth = viewBoxSize * strokeWidthRatio
  const radius = (viewBoxSize - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={cn('relative w-full pt-[100%]', className)}>
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      >
        <circle
          className={cn(circleColor, 'stroke-current')}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={viewBoxSize / 2}
          cy={viewBoxSize / 2}
        />
        <circle
          className={cn(progressColor, 'stroke-current')}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={viewBoxSize / 2}
          cy={viewBoxSize / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 0.5s ease-in-out'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (
          <>
            <div
              className={cn('text-lg font-semibold', progressColor)}
              aria-hidden="true"
            >
              {Math.round(progress)}%
            </div>
            <span className="sr-only">Progress: {Math.round(progress)}%</span>
          </>
        )}
      </div>
    </div>
  )
}
