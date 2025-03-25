'use client'

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
import { Search, User, Building, Phone, X } from 'lucide-react'
import { Icons } from '@/components/icons'
import { Customer } from '@/types'
import { AddNewClientDialogButton } from '@/components/add-new-client.button'

interface CustomerSectionProps {
  customers: Customer[]
  selectedCustomer: Customer | null
  setSelectedCustomer: (customer: Customer | null) => void
  children?: React.ReactNode
}

export default function CustomerSearchInput({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  children
}: CustomerSectionProps) {
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [isCustomerPopoverOpen, setIsCustomerPopoverOpen] = useState(false)

  const triggerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [triggerWidth, setTriggerWidth] = useState(0)

  useEffect(() => {
    if (isCustomerPopoverOpen && triggerRef.current) {
      setTriggerWidth(triggerRef.current.getBoundingClientRect().width)
      // Delay refocusing to the next tick
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }, [isCustomerPopoverOpen])

  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.company
        .toLowerCase()
        .includes(customerSearchTerm.toLowerCase()) ||
      customer.phone.includes(customerSearchTerm)
  )

  // Select a customer
  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerSearchTerm('')
    setIsCustomerPopoverOpen(false)
    // Optionally re-focus input after selection if needed:
    inputRef.current?.focus()
  }

  // Clear selected customer
  const clearSelectedCustomer = () => {
    setSelectedCustomer(null)
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
        <Popover
          open={isCustomerPopoverOpen}
          onOpenChange={setIsCustomerPopoverOpen}
        >
          <PopoverTrigger asChild>
            <div className="relative w-full" ref={triggerRef}>
              <Search className="absolute left-2.5 top-4 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Rechercher par nom, entreprise ou téléphone"
                value={customerSearchTerm}
                onChange={(e) => {
                  setCustomerSearchTerm(e.target.value)
                  if (e.target.value.length > 0) {
                    setIsCustomerPopoverOpen(true)
                  }
                }}
                className="pl-8 h-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                onClick={() => {
                  if (customerSearchTerm.length > 0) {
                    setIsCustomerPopoverOpen(true)
                  }
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
                <CommandEmpty>Aucun client trouvé.</CommandEmpty>
                <CommandGroup heading="Acheteurs">
                  {filteredCustomers.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      onSelect={() => selectCustomer(customer)}
                      className="cursor-pointer"
                    >
                      <Icons.user className="mr-2 w-4" />
                      <div className="flex flex-col">
                        <span className="text-md">{customer.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {customer.company}
                        </span>
                      </div>
                      <span className="ml-auto text-sm text-muted-foreground">
                        {customer.phone.replace(
                          /(\d{4})(\d{2})(\d{2})(\d{2})$/,
                          '$1 $2 $3 $4 '
                        )}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedCustomer && (
          <div className="mt-4 p-3 border rounded-md relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6"
              onClick={clearSelectedCustomer}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="grid gap-1">
              <div className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{selectedCustomer.name}</span>
              </div>
              <div className="flex items-center text-sm">
                <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{selectedCustomer.company}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{selectedCustomer.phone}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="w-full">{children}</CardFooter>
    </Card>
  )
}
