'use client'
import { useEffect, useRef, useState } from 'react'
import { CircularProgressBar } from './circular-progress'
import { Badge } from './ui/badge'
import { Minus, Plus } from 'lucide-react'
import { Button } from './ui/button'

interface Props {}

export const WorkstationTracker: React.FC<Props> = ({}: Props) => {
  const [progress, setProgress] = useState(0)
  const isDone = progress === 100
  const [isLongPress, setIsLongPress] = useState(false)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const accelerationRef = useRef(1)

  const handleIncrement = (amount: number) => {
    setProgress((prev) => Math.min(Math.max(prev + amount, 0), 100))
  }

  const handleDecrement = (amount: number) => {
    setProgress((prev) => Math.min(Math.max(prev - amount, 0), 100))
  }

  const startLongPress = (action: 'increment' | 'decrement') => {
    setIsLongPress(true)
    accelerationRef.current = 1
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      const amount = Math.ceil(accelerationRef.current)
      action === 'increment' ? handleIncrement(amount) : handleDecrement(amount)
      accelerationRef.current = Math.min(accelerationRef.current * 1.03, 3) // Increase acceleration by 5%, max 5
    }, 100)
  }

  const endLongPress = () => {
    setIsLongPress(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
    accelerationRef.current = 1
  }

  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleButtonPress = (action: 'increment' | 'decrement') => {
    action === 'increment' ? handleIncrement(1) : handleDecrement(1)
    longPressTimer.current = setTimeout(() => startLongPress(action), 500)
  }
  return (
    <div className="space-y-4">
      <CircularProgressBar progress={progress} strokeWidthRatio={0.1}>
        <div className="flex flex-col items-center gap-2 min-w-24">
          <span className="text-3xl sm:text-5xl  font-bold">{progress}% </span>
          <Badge
            className="w-full flex justify-center text-md"
            variant={isDone ? 'primary' : 'secondary'}
          >
            {isDone ? 'Achevé' : 'En cours'}
          </Badge>
        </div>
      </CircularProgressBar>
      <div className="flex justify-center items-center gap-3 px-4 py-2">
        <Button
          variant="outline"
          size="icon"
          onMouseDown={() => handleButtonPress('decrement')}
          onMouseUp={endLongPress}
          onMouseLeave={endLongPress}
          onTouchStart={(e) => {
            e.preventDefault()
            handleButtonPress('decrement')
          }}
          onTouchEnd={endLongPress}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{Math.round(progress)}%</span>
        <Button
          variant="outline"
          size="icon"
          onMouseDown={() => handleButtonPress('increment')}
          onMouseUp={endLongPress}
          onMouseLeave={endLongPress}
          onTouchStart={(e) => {
            e.preventDefault()
            handleButtonPress('increment')
          }}
          onTouchEnd={endLongPress}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
