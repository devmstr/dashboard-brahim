import * as React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function AutoResizeTextarea(props: AutoResizeTextareaProps) {
  const ref = React.useRef<HTMLTextAreaElement>(null)

  const resize = () => {
    const el = ref.current
    if (!el) return
    el.style.height = '20px' // reset first (allows shrinking)
    el.style.height = `${el.scrollHeight}px` // then set to full content height
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    resize()
    props.onChange?.(e)
  }

  React.useLayoutEffect(() => {
    resize()
  }, [props.value])

  return (
    <Textarea
      ref={ref}
      value={props.value}
      onChange={handleChange}
      className={cn(
        'overflow-hidden resize-none min-h-5 max-h-24 p-0 focus-visible:ring-0 border-none rounded-none',
        props.className ?? ''
      )}
    />
  )
}
