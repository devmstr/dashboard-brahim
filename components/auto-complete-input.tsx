'use client'

import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'
import { cn } from '@/lib/utils'

interface AutoCompleteProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  items: string[]
  setValue: (value: string) => void
  value: string
}

export const AutoComplete: React.FC<AutoCompleteProps> = ({
  items,
  setValue,
  value,
  ...props
}: AutoCompleteProps) => {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(items)

  const onSelect = (value: string) => {
    setValue(value)
    setOpen(false)
  }

  useEffect(() => {
    setData(items)
  }, [items])

  useEffect(() => {
    if (!value) return
    const valueWords = value
      .toLowerCase()
      .split(' ')
      .filter((word) => word.length > 0)
    setData(
      items.filter((item) =>
        item
          .toLowerCase()
          .split(' ')
          .some((titleWord) =>
            valueWords.some((valueWord) => titleWord.includes(valueWord))
          )
      )
    )
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && open && data.length > 0) {
      // If the dropdown is open and there are items, select the first one
      e.preventDefault() // Prevent default tab behavior
      onSelect(data[0]) // Select the first item
    } else if (e.key === 'Tab') {
      // If the dropdown is not open, allow normal tab behavior
      setOpen(false)
    }
  }

  return (
    <div className={cn('relative', props.className)}>
      <Input
        className="capitalize"
        value={value}
        onFocus={() => setOpen(false)}
        onChange={(e) => {
          setValue(e.target.value)
          setOpen(e.target.value.length > 0)
        }}
        onKeyDown={handleKeyDown} // Handle the Tab key
        {...props}
      />
      <div
        className={cn(
          'absolute w-full z-50 bg-background border mt-3 rounded-md',
          open && data.length > 0 ? 'flex' : 'hidden'
        )}
      >
        <ScrollArea className={cn('w-full max-h-48 overflow-y-auto ')}>
          <div className="p-1">
            {data.length > 0 &&
              data.map((item, id) => (
                <div
                  key={id}
                  onClick={() => onSelect(item)}
                  className="cursor-pointer text-sm py-[0.45rem] px-4 rounded-sm text-foreground hover:text-primary hover:bg-slate-100 transition-colors ease-in-out duration-300"
                >
                  {item}
                </div>
              ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
