'use client'

import type React from 'react'

import { useState, useRef, useEffect } from 'react'
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
import { Search, User, Building, Phone, X, Mail, MapPin } from 'lucide-react'
import { Icons } from '@/components/icons'
import { AddNewClientDialogButton } from '@/components/add-new-client.button'
import { Client } from '@prisma/client'

export type ClientWithOrdersCount = Partial<Client> & {
  Address: {
    City: {
      name: string | null
    }
  }
  _count: {
    Orders: number
  }
}

interface CustomerSectionProps {
  selected: Pick<
    ClientWithOrdersCount,
    'id' | 'isCompany' | 'email' | 'phone' | 'name' | 'Address' | '_count'
  > | null
  onSelectChange: (client: ClientWithOrdersCount | null) => void
  children?: React.ReactNode
}

export default function CustomerSearchInput({
  selected: selectedClient,
  onSelectChange,
  children
}: CustomerSectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [clients, setClients] = useState<ClientWithOrdersCount[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const [triggerWidth, setTriggerWidth] = useState(0)

  const triggerRef = useRef<HTMLDivElement>(null)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
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
      // Remove the minimum character check to search on every character
      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/clients?search=${encodeURIComponent(searchTerm)}`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch clients')
        }
        const data = await response.json()
        setClients(data)
      } catch (error) {
        console.error('Error fetching clients:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Remove the debounce and call fetchClients immediately
    fetchClients()
  }, [searchTerm])

  // Select a client
  const selectClient = (client: ClientWithOrdersCount) => {
    onSelectChange(client)
    setSearchTerm('')
    setIsPopoverOpen(false)
    // Optionally re-focus input after selection if needed:
    inputRef.current?.focus()
  }

  // Clear selected client
  const clearSelectedClient = () => {
    onSelectChange(null)
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
                {isLoading ? (
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
                      {clients.map((client) => (
                        <CommandItem
                          key={client.id}
                          onSelect={() => selectClient(client)}
                          className="cursor-pointer"
                        >
                          {client.isCompany ? (
                            <Building className="mr-2 w-4" />
                          ) : (
                            <User className="mr-2 w-4" />
                          )}
                          <div className="flex justify-between w-full">
                            <div className="flex flex-col items-start">
                              <div className="text-md">{client.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {client.phone?.replace(
                                  /(\d{4})(\d{2})(\d{2})(\d{2})$/,
                                  '$1 $2 $3 $4 '
                                )}
                              </div>
                            </div>
                            <div>
                              {client.email && (
                                <span className="text-sm text-muted-foreground">
                                  {client.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedClient && (
          <div className="mt-4 p-3 border rounded-md relative">
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
                {selectedClient.isCompany ? (
                  <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                ) : (
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">{selectedClient.name}</span>
              </div>
              {selectedClient.email && (
                <div className="flex items-center text-sm">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{selectedClient.email}</span>
                </div>
              )}
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{selectedClient.phone}</span>
              </div>
              {selectedClient.Address.City.name && (
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{selectedClient.Address.City.name}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="w-full">{children}</CardFooter>
    </Card>
  )
}
