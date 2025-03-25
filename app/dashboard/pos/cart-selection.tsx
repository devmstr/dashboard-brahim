'use client'

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ShoppingCart, Trash2, Printer } from 'lucide-react'
import { Icons } from '@/components/icons'
import { CartItem } from '@/types'

interface CartSectionProps {
  cart: CartItem[]
  expandedItems: Record<string, boolean>
  toggleItemExpansion: (itemId: string) => void
  updateQuantity: (id: string, quantity: number) => void
  removeFromCart: (id: string) => void
  subtotal: number
  tax: number
  total: number
  printReceipt: () => void
}

export default function CartSection({
  cart,
  expandedItems,
  toggleItemExpansion,
  updateQuantity,
  removeFromCart,
  subtotal,
  tax,
  total,
  printReceipt
}: CartSectionProps) {
  return (
    <Card className="flex flex-col h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          Panier
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {cart.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            Votre panier est vide
          </div>
        ) : (
          <ScrollArea className="rounded-md border max-h-[400px] overflow-y-scroll">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-full">Article</TableHead>
                  <TableHead className="text-right w-fit whitespace-nowrap">
                    Qté
                  </TableHead>
                  <TableHead className="text-right w-fit whitespace-nowrap">
                    Prix
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium w-full">
                      <div
                        className="cursor-pointer"
                        onClick={() => toggleItemExpansion(item.id)}
                      >
                        {expandedItems[item.id]
                          ? item.name
                          : `${item.name.substring(0, 13)}${
                              item.name.length > 13 ? '...' : ''
                            }`}
                      </div>
                    </TableCell>
                    <TableCell className="text-right w-fit whitespace-nowrap">
                      <div className="flex items-center justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right w-fit whitespace-nowrap">
                      {(item.price * item.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell className="w-fit">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}

        <div className="space-y-2 mt-4">
          <div className="flex justify-between">
            <span>Total H.T</span>
            <span>{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>TVA (19%)</span>
            <span>{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button
          className="w-full flex items-center gap-1"
          size="lg"
          disabled={cart.length === 0}
          onClick={printReceipt}
        >
          <Printer className="mr-2 h-5 w-5" />
          Imprimer Facture
          <Icons.arrowRight className="w-5 ml-1 mt-[2px]" />
        </Button>
      </CardFooter>
    </Card>
  )
}
