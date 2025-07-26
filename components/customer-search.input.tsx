'use client'

import type React from 'react'

import { AddNewClientDialogButton } from '@/components/add-new-client.button'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { formatPhoneNumber } from '@/lib/utils'
import { type ClientSchemaType as Client } from '@/lib/validations'
import {
  Building,
  Mail,
  MapPin,
  Phone,
  Search,
  Tag,
  User,
  X
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface CustomerSectionProps {
  selected?: Client
  onSelectChange: (client: Client | undefined) => void
  children?: React.ReactNode
  isLoading?: boolean // Add prop to allow parent to control loading state
  onlyCompanies?: boolean // Optional prop to filter only companies
}

export default function CustomerSearchInput({
  selected,
  onSelectChange,
  children,
  isLoading: externalLoading = false, // Default to false if not provided
  onlyCompanies = false // Optional prop to filter only companies
}: CustomerSectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [isAddressLoading, setIsAddressLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [triggerWidth, setTriggerWidth] = useState(0)
  const triggerRef = useRef<HTMLDivElement>(null)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientDataReady, setClientDataReady] = useState(false)

  // Combine loading states
  const isLoading = externalLoading || isSearchLoading || isAddressLoading

  // Highlight function to highlight matched text (case insensitive, ignores spaces in search)
  const highlightMatch = useCallback(
    (text: string | null | undefined) => {
      if (!searchTerm || !text) return text || ''

      // Remove all spaces from both searchTerm and text for matching
      const searchNoSpaces = searchTerm.replace(/\s+/g, '')
      const textNoSpaces = text.replace(/\s+/g, '')

      // The "i" flag makes it case insensitive
      const regex = new RegExp(
        `(${searchNoSpaces.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
        'gi'
      )
      // Find all matches in the text without spaces
      let matchIndices: [number, number][] = []
      let match
      while ((match = regex.exec(textNoSpaces)) !== null) {
        matchIndices.push([match.index, match.index + match[0].length])
      }
      if (matchIndices.length === 0) return text

      // Map indices back to the original text (with spaces)
      let result: (string | JSX.Element)[] = []
      let pointer = 0
      let textPointer = 0
      for (let i = 0; i < matchIndices.length; i++) {
        const [start, end] = matchIndices[i]
        // Find the corresponding indices in the original text
        let origStart = textPointer
        let chars = 0
        while (chars < start && origStart < text.length) {
          if (text[origStart] !== ' ') chars++
          origStart++
        }
        let origEnd = origStart
        while (chars < end && origEnd < text.length) {
          if (text[origEnd] !== ' ') chars++
          origEnd++
        }
        if (pointer < origStart) {
          result.push(text.slice(pointer, origStart))
        }
        result.push(
          <mark key={i} className="bg-yellow-200 rounded-sm px-0.5">
            {text.slice(origStart, origEnd)}
          </mark>
        )
        pointer = origEnd
        textPointer = origEnd
      }
      if (pointer < text.length) {
        result.push(text.slice(pointer))
      }
      return result
    },
    [searchTerm]
  )

  useEffect(() => {
    if (isPopoverOpen && triggerRef.current) {
      setTriggerWidth(triggerRef.current.getBoundingClientRect().width)
      // Delay refocusing to the next tick
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }, [isPopoverOpen])

  // Fetch clients when search term changes
  useEffect(() => {
    const fetchClients = async () => {
      setIsSearchLoading(true)
      try {
        // Update the API endpoint to include address information
        const response = await fetch(
          `/api/clients?search=${encodeURIComponent(
            searchTerm
          )}&onlyCompanies=${onlyCompanies}`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch clients')
        }
        const data = await response.json()
        setClients(data.data || data)
        setClientDataReady(true)
      } catch (error) {
        console.error('Error fetching clients:', error)
      } finally {
        setIsSearchLoading(false)
      }
    }

    fetchClients()
  }, [searchTerm])

  // Select a client
  const selectClient = (client: Client) => {
    setClientDataReady(false) // Reset ready state when selecting a new client
    onSelectChange(client)
    setSearchTerm('')
    setIsPopoverOpen(false)
    setClientDataReady(true)
    inputRef.current?.focus()
  }

  // Clear selected client
  const clearSelectedClient = () => {
    onSelectChange(undefined)
    setClientDataReady(true) // Reset to ready state when clearing
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Icons.user className="h-6 w-6" />
            Sélectionner Un Acheteur
          </CardTitle>
          <AddNewClientDialogButton />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="relative w-full" ref={triggerRef}>
              <Search className="absolute left-2.5 top-4 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Rechercher par nom, email ou téléphone"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setIsPopoverOpen(true) // Always open popover on any input
                }}
                className="pl-8 h-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                onClick={(e) => {
                  e.stopPropagation() // Prevents closing the popover when clicking inside the input
                  setIsPopoverOpen(true) // Always open popover on click
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="p-0"
            align="start"
            style={{ width: triggerWidth > 0 ? `${triggerWidth}px` : 'auto' }}
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <Command>
              <CommandList>
                {isSearchLoading ? (
                  <div className="py-6 text-center">
                    <Icons.spinner className="h-6 w-6 mx-auto animate-spin" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Recherche en cours...
                    </p>
                  </div>
                ) : (
                  <>
                    <CommandEmpty>Aucun client trouvé.</CommandEmpty>
                    <CommandGroup heading="Acheteurs">
                      {clients.map((client) => {
                        return (
                          <CommandItem
                            key={client.id}
                            onSelect={() => selectClient(client)}
                            className="cursor-pointer py-3"
                          >
                            <div className="flex items-start w-full gap-2">
                              <div className="flex flex-col w-full">
                                {/* First row: Name and Phone */}
                                <div className="flex gap-1 items-center">
                                  <div className="">
                                    {client.isCompany ? (
                                      <Building className="w-4 h-4" />
                                    ) : (
                                      <User className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="font-medium">
                                      {highlightMatch(client.name)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-3">
                                  {client.phone && (
                                    <div className="text-sm text-muted-foreground flex gap-1 items-center">
                                      <Phone className="w-4 h-4" />
                                      {highlightMatch(client.phone)}
                                    </div>
                                  )}
                                  {client.province && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                      <span className="truncate ">
                                        {highlightMatch(client.province)}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex gap-4 items-center justify-start">
                                    {client.label && (
                                      <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                                        <Tag className="w-3 h-3 mr-1 flex-shrink-0" />
                                        <span className="truncate ">
                                          {highlightMatch(client.label)}
                                        </span>
                                      </div>
                                    )}
                                    {/* Email on the right */}
                                    {client.email && (
                                      <div className="flex  text-xs text-muted-foreground ">
                                        <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                                        <span className="truncate ">
                                          {highlightMatch(client.email)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* // Selected client state */}
        {selected && clientDataReady ? (
          <div className="w-full">
            <Card className="w-full border border-gray-200 dark:border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between  py-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  {selected.isCompany ? (
                    <Building className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Client Sélectionné
                    </h3>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelectedClient}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex justify-around space-y-2">
                  {selected.label && (
                    <div className="mt-2 flex items-center gap-3 py-2">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Libellé
                        </span>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {selected.label}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 py-2">
                    {selected.isCompany ? (
                      <Building className="h-4 w-4 text-gray-400" />
                    ) : (
                      <User className="h-4 w-4 text-gray-400" />
                    )}
                    <div className="flex-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {selected.isCompany ? 'Entreprise' : 'Nom'}
                      </span>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {selected.name}
                      </div>
                    </div>
                  </div>

                  {selected.email && (
                    <div className="flex items-center gap-3 py-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Email
                        </span>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {selected.email}
                        </div>
                      </div>
                    </div>
                  )}

                  {selected.province && (
                    <div className="flex items-center gap-3 py-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Wilaya
                        </span>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {selected.province}
                        </div>
                      </div>
                    </div>
                  )}

                  {selected.phone && (
                    <div className="flex items-center gap-3 py-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Téléphone
                        </span>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {formatPhoneNumber(selected.phone)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="w-full">
            <Card className="w-full border border-gray-200 dark:border-gray-800">
              <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center py-6">
                  <User className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Aucun client sélectionné
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
      {children && <CardFooter className="w-full">{children}</CardFooter>}
    </Card>
  )
}
