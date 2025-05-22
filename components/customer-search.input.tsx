'use client'

import type React from 'react'
import { findAll } from 'highlight-words-core'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Search,
  User,
  Building,
  X,
  Mail,
  MapPin,
  Tag,
  Phone
} from 'lucide-react'
import { Icons } from '@/components/icons'
import { AddNewClientDialogButton } from '@/components/add-new-client.button'
import type { Client } from '@/lib/validations'
import type { Address } from '@prisma/client'
import { toast } from '@/hooks/use-toast'

interface CustomerSectionProps {
  selected?: Client
  onSelectChange: (client: Client | undefined) => void
  children?: React.ReactNode
  isLoading?: boolean // Add prop to allow parent to control loading state
}

// Extended client type to include address information
export type ClientWithAddress = Client & {
  Address?: {
    Province?: {
      name: string
    }
  } | null
}

export default function CustomerSearchInput({
  selected,
  onSelectChange,
  children,
  isLoading: externalLoading = false // Default to false if not provided
}: CustomerSectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [clients, setClients] = useState<ClientWithAddress[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [isAddressLoading, setIsAddressLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [triggerWidth, setTriggerWidth] = useState(0)
  const triggerRef = useRef<HTMLDivElement>(null)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [address, setAddress] = useState<ClientWithAddress['Address'] | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const [clientDataReady, setClientDataReady] = useState(false)

  // Combine loading states
  const isLoading = externalLoading || isSearchLoading || isAddressLoading

  // Highlight function to highlight matched text (case insensitive, no diacritic support)
  const highlightMatch = useCallback(
    (text: string | null | undefined) => {
      if (!searchTerm || !text) return text || ''

      // The "i" flag makes it case insensitive
      const regex = new RegExp(
        `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
        'gi'
      )
      const parts = text.split(regex)

      return parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )
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
          )}&includeAddress=true`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch clients')
        }
        const data = await response.json()
        setClients(data.data || data) // Handle both formats (with pagination or direct array)
      } catch (error) {
        console.error('Error fetching clients:', error)
      } finally {
        setIsSearchLoading(false)
      }
    }

    fetchClients()
  }, [searchTerm])

  useEffect(() => {
    // Reset states when client changes
    setAddress(null)
    setClientDataReady(false)
    setError(null)

    // Only fetch if client exists and has an addressId
    if (!selected) {
      setClientDataReady(true) // No client selected means we're ready (nothing to load)
      return
    }

    // If client has no addressId, we're ready immediately
    if (!selected.addressId) {
      setClientDataReady(true)
      return
    }

    async function fetchClientAddress() {
      setIsAddressLoading(true)

      try {
        // Fetch client with address details
        const response = await fetch(`/api/clients/${selected?.id}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch client address: ${response.status}`)
        }

        const data = await response.json()

        // Check if address data exists
        if (data.Address) {
          setAddress(data.Address)
        } else {
          // Client has addressId but no address found
          setAddress(null)
          console.warn(
            `Client ${selected?.id} has addressId but no address was found`
          )
        }

        // Mark client data as ready
        setClientDataReady(true)
      } catch (err) {
        console.error('Error fetching client address:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch address')
        toast({
          title: 'Error',
          description: 'Failed to load client address information',
          variant: 'destructive'
        })
        setClientDataReady(true) // Still mark as ready so UI isn't stuck
      } finally {
        setIsAddressLoading(false)
      }
    }

    fetchClientAddress()
  }, [selected])

  // Select a client
  const selectClient = (client: ClientWithAddress) => {
    setClientDataReady(false) // Reset ready state when selecting a new client
    onSelectChange(client)
    setSearchTerm('')
    setIsPopoverOpen(false)
    inputRef.current?.focus()
  }

  // Clear selected client
  const clearSelectedClient = () => {
    onSelectChange(undefined)
    setClientDataReady(true) // Reset to ready state when clearing
  }

  // Format address for display
  const formatAddress = (client: ClientWithAddress) => {
    if (!client.Address) return null

    const parts = []
    if (client.Address.Province?.name) parts.push(client.Address.Province.name)

    return parts.length > 0 ? parts.join(', ') : null
  }

  // Format phone for display
  const formatPhone = (phone: string | null | undefined) => {
    if (!phone) return ''
    // remove the country code
    const cleanedPhone = phone.replace(/^\+213/, '')

    // check if it a mobile number
    const isMobile =
      cleanedPhone.startsWith('7') ||
      cleanedPhone.startsWith('6') ||
      cleanedPhone.startsWith('5')

    if (isMobile) {
      return `0${cleanedPhone.replace(
        /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/,
        '$1 $2 $3 $4 $5'
      )}`
    }

    return cleanedPhone.replace(/(\d{3})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4')
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
      <CardContent>
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
                onClick={() => {
                  setIsPopoverOpen(true) // Always open popover on click
                }}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="p-0"
            align="start"
            style={{ width: triggerWidth > 0 ? `${triggerWidth}px` : 'auto' }}
            onMouseDown={(e) => e.preventDefault()}
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
                        const addressText = formatAddress(client)
                        const phoneFormatted = formatPhone(client.phone)

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
                                      {highlightMatch(phoneFormatted)}
                                    </div>
                                  )}
                                  {addressText && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                      <span className="truncate ">
                                        {highlightMatch(addressText)}
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
        {/* Selected Client Card */}
        <div className="mt-4 min-h-8 flex items-center justify-center">
          {selected && !clientDataReady && (
            <div className="w-full flex flex-col items-center justify-center py-4">
              <Icons.spinner className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">
                Chargement des informations client...
              </p>
            </div>
          )}

          {selected && clientDataReady && (
            <div className="w-full p-3 border rounded-md relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-6 w-6"
                onClick={clearSelectedClient}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="grid gap-1">
                <div className="flex items-center text-sm">
                  {selected.isCompany ? (
                    <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                  ) : (
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-medium">{selected.name}</span>
                </div>
                {selected.phone && (
                  <div className="flex gap-1 items-center">
                    <Phone className="w-4 h-4  text-muted-foreground" />
                    <span className="text-foreground ">
                      {selected.phone.replace(
                        /(\d{4})(\d{2})(\d{2})(\d{2})$/,
                        '$1 $2 $3 $4'
                      )}
                    </span>
                  </div>
                )}
                {selected.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{selected.email}</span>
                  </div>
                )}
                {selected.label && (
                  <div className="flex items-center text-sm">
                    <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{selected.label}</span>
                  </div>
                )}
                {address && address.Province && (
                  <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{address.Province?.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!selected && !isLoading && (
            <p className="text-sm text-muted-foreground">
              Aucun client sélectionné
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="w-full">{children}</CardFooter>
    </Card>
  )
}
