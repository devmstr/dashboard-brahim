'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Building, Loader2, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ClientSchemaType } from '@/lib/procurement/validations'

export interface Client {
  name: string | null
  address: string | null
  tradeRegisterNumber: string | null
  registrationArticle: string | null
  taxIdNumber: string | null
}

interface ApiClient {
  Address: { street: string }
  name: string
  label: string
  isCompany: boolean
  registrationArticle: string
  taxIdNumber: string
  tradeRegisterNumber: string
}

type AutoCompleteClient = Pick<
  ClientSchemaType,
  | 'id'
  | 'name'
  | 'label'
  | 'street'
  | 'isCompany'
  | 'registrationArticle'
  | 'taxIdNumber'
  | 'tradeRegisterNumber'
>

interface ClientAutocompleteProps {
  client: AutoCompleteClient
  setClient: (client: AutoCompleteClient) => void
}

export default function ClientAutocomplete({
  client,
  setClient
}: ClientAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<AutoCompleteClient[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightedIdx, setHighlightedIdx] = useState<number>(-1)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dropdownWidth, setDropdownWidth] = useState<string | number>('100%')

  useEffect(() => {
    if (inputRef.current) {
      setDropdownWidth(inputRef.current.offsetWidth)
    }
  }, [inputRef.current, query, showDropdown])

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    setLoading(true)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/clients?search=${encodeURIComponent(query)}`
        )
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()

        setSuggestions(data || [])
        setShowDropdown(true)
      } catch (error) {
        console.error('Error fetching clients:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const handleClientSelect = ({
    id,
    street = '',
    name,
    label,
    isCompany,
    registrationArticle = '',
    taxIdNumber = '',
    tradeRegisterNumber = ''
  }: AutoCompleteClient) => {
    setClient({
      id,
      name,
      street,
      tradeRegisterNumber: tradeRegisterNumber || '',
      taxIdNumber: taxIdNumber || '',
      registrationArticle: registrationArticle || ''
    })
    setQuery('')
    setShowDropdown(false)
  }

  const handleNameChange = (value: string) => {
    setQuery(value)
    setClient({ ...client, name: value })
  }

  // Keyboard navigation and selection
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIdx((prev) => (prev + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIdx(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length
      )
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (highlightedIdx >= 0 && highlightedIdx < suggestions.length) {
        e.preventDefault()
        handleClientSelect(suggestions[highlightedIdx])
      }
    }
  }

  useEffect(() => {
    setHighlightedIdx(suggestions.length > 0 ? 0 : -1)
  }, [suggestions, showDropdown])

  return (
    <div
      ref={containerRef}
      className="relative flex justify-between gap-1 w-full"
    >
      {/* Client Name Input */}
      <div className="w-4/6">
        <div className="relative ">
          <Input
            ref={inputRef}
            placeholder="SARL SO.NE.RA.S"
            className={cn(
              'h-6 p-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base',
              !client.name && 'print:hidden'
            )}
            value={client.name}
            onChange={(e) => handleNameChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true)
            }}
            onKeyDown={handleInputKeyDown}
            autoComplete="off"
          />

          {loading && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Dropdown Suggestions */}
        {showDropdown && (suggestions.length > 0 || loading) && (
          <Card
            className="absolute left-0 mt-1 z-50 shadow-md"
            style={{ width: dropdownWidth }}
          >
            <CardContent className="p-0">
              <Command>
                <CommandList className="max-h-48">
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Searching...
                      </span>
                    </div>
                  ) : suggestions.length === 0 ? (
                    <CommandEmpty>No clients found.</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {suggestions.map((suggestion, idx) => (
                        <CommandItem
                          key={`${suggestion.tradeRegisterNumber}-${idx}`}
                          onSelect={() => handleClientSelect(suggestion)}
                          className={cn(
                            'cursor-pointer',
                            highlightedIdx === idx && 'bg-muted'
                          )}
                          onMouseEnter={() => setHighlightedIdx(idx)}
                        >
                          <div className="flex flex-col">
                            {/* <div className="font-semibold">
                              {suggestion.name}
                            </div> */}
                            <div className="flex gap-1 items-center">
                              <div className="">
                                {suggestion.isCompany ? (
                                  <Building className="w-4 h-4" />
                                ) : (
                                  <User className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="font-medium">
                                  {suggestion.name}
                                </div>
                              </div>
                            </div>
                            {suggestion.street && (
                              <div className="text-xs text-muted-foreground">
                                {suggestion.street}
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </CardContent>
          </Card>
        )}

        {/* Client Address */}
        <Input
          placeholder="Z.I. Garat taam B. P.N 46 Bounoura - 47014"
          className={cn(
            'h-6 p-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base',
            !client.street && 'print:hidden'
          )}
          value={client.street ?? undefined}
          onChange={({ target: { value } }) =>
            setClient({
              ...client,
              street: value
            })
          }
        />
      </div>

      {/* Client Details */}
      <div className="text-sm space-y-0.5 w-2/6 flex flex-col justify-start ">
        <div
          className={cn(
            'flex items-center gap-2',
            !client.tradeRegisterNumber && 'print:hidden'
          )}
        >
          <span className="font-semibold min-w-[3rem]">R.C:</span>
          <Input
            placeholder="97/B/0862043"
            className="h-6 border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 flex-1"
            value={client.tradeRegisterNumber ?? undefined}
            onChange={({ target: { value } }) =>
              setClient({
                ...client,
                tradeRegisterNumber: value
              })
            }
          />
        </div>

        <div
          className={cn(
            'flex items-center gap-2',
            !client.taxIdNumber && 'print:hidden'
          )}
        >
          <span className="font-semibold min-w-[3rem]">N.I.F:</span>
          <Input
            placeholder="99747086204393"
            className="h-6 border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 flex-1"
            value={client.taxIdNumber ?? undefined}
            onChange={({ target: { value } }) =>
              setClient({
                ...client,
                taxIdNumber: value
              })
            }
          />
        </div>

        <div
          className={cn(
            'flex items-center gap-2',
            !client.registrationArticle && 'print:hidden'
          )}
        >
          <span className="font-semibold min-w-[3rem]">A.I:</span>
          <Input
            placeholder="471006003"
            className="h-6 border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 flex-1"
            value={client.registrationArticle ?? undefined}
            onChange={({ target: { value } }) =>
              setClient({
                ...client,
                registrationArticle: value
              })
            }
          />
        </div>
      </div>
    </div>
  )
}
