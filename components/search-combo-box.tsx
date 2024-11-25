'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'
import { ScrollArea } from './ui/scroll-area'

interface SearchComboBoxProps extends React.HTMLAttributes<React.ReactNode> {
  value?: string
  setValue: (value: string) => void
  items: string[]
  topic?: string
}

export function SearchComboBox({
  value,
  setValue,
  items = [],
  topic,
  className
}: SearchComboBoxProps) {
  const [triggerWidth, setTriggerWidth] = React.useState(0)
  const [open, setOpen] = React.useState(false)

  const triggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (open && triggerRef.current) {
      const width = triggerRef.current.getBoundingClientRect().width
      setTriggerWidth(width)
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={(open) => setOpen(open)}>
      <PopoverTrigger ref={triggerRef} asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between font-normal px-3', className)}
        >
          {value
            ? items?.find((item) => item === value) || items.at(0)
            : topic
            ? `Sélectionnez un ${topic}...`
            : 'Sélectionnez...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width: triggerWidth }}>
        <Command>
          <CommandInput
            placeholder={topic ? `Chercher un ${topic}...` : 'Chercher...'}
          />
          <CommandEmpty>
            {topic ? `Aucun ${topic} trouvé.` : 'Pas de résultat.'}
          </CommandEmpty>
          <CommandGroup className="">
            <ScrollArea className="h-72 w-full">
              {items.length > 0 ? (
                items.map((item) => (
                  <CommandItem
                    key={item}
                    value={item}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? '' : item)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 ',
                        value === item ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {item}
                  </CommandItem>
                ))
              ) : (
                <CommandItem>No items available</CommandItem>
              )}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
