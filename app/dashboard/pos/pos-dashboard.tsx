'use client'

import { useState, useEffect } from 'react'
import { CartItem, Product } from '@/types'
import CustomerSearchInput from '@/components/customer-search.input'
import ProductsSection from './product-section'
import CartSection from './cart-selection'
import { useRouter } from 'next/navigation'
import { ClientSchemaType } from '@/lib/validations'
import { toast } from '@/hooks/use-toast'
import { rest } from 'lodash'

const ITEMS_PER_INVOICE_PAGE = 15 // Match your pagination limit

export default function PosDashboard({
  radiators = []
}: {
  radiators?: Product[]
}) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  )
  const [selectedCustomer, setSelectedCustomer] = useState<
    ClientSchemaType | undefined
  >(undefined)
  const [products, setProducts] = useState<Product[]>(radiators)

  // Toggle item expansion in cart
  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  // Add product to cart
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      // const availableStock = product.stockLevel ?? Infinity
      const availableStock = Infinity
      if (existingItem) {
        if (existingItem.quantity >= availableStock) {
          // inform the user that they can't add more than available stock
          toast({
            title: 'Limite de stock atteinte',
            description: `Vous ne pouvez pas ajouter plus de ${availableStock} exemplaire(s) de cet article.`,
            variant: 'warning'
          })
          return prevCart // Do not add more than available stock
        }
        return prevCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                amount: item.price * (item.quantity + 1)
              }
            : item
        )
      } else {
        if (prevCart.length >= ITEMS_PER_INVOICE_PAGE) {
          toast({
            title: 'Limite atteinte',
            description: `Seulement ${ITEMS_PER_INVOICE_PAGE} articles sont autorisés par facture.`,
            variant: 'warning'
          })
          return prevCart
        }
        if (availableStock < 1) {
          return prevCart // No stock available
        }
        const maxId =
          prevCart.length > 0
            ? Math.max(...prevCart.map((item) => item.number))
            : 0
        return [
          ...prevCart,
          {
            id: product.id,
            number: maxId + 1,
            label: product.label,
            price: product.price,
            quantity: 1,
            amount: product.price, // always keep in sync
            radiatorId: product.id
          }
        ]
      }
    })
  }

  // Remove item from cart
  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  // Update item quantity
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    // Check if quantity exceeds available stock
    const product = products.find((p) => p.id == id)
    // const availableStock = product?.stockLevel ?? Infinity
    const availableStock = Infinity
    if (newQuantity > availableStock) {
      // inform the user that they can't add more than available stock
      toast({
        title: 'Limite de stock atteinte',
        description: `Vous ne pouvez pas ajouter plus de ${availableStock} exemplaire(s) de cet article.`,
        variant: 'warning'
      })
      return
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id)
          return {
            ...item,
            quantity: newQuantity,
            amount: item.price * newQuantity
          }
        else return item
      })
    )
  }

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const taxRate = 0.19
  const tax = subtotal * taxRate
  const total = subtotal + tax
  const router = useRouter()
  // Print receipt
  const printReceipt = async () => {
    if (!selectedCustomer) {
      toast({
        title: 'Champ requis !',
        description: 'Veuillez d’abord sélectionner un client.',
        variant: 'destructive'
      })
      return
    }

    const { id: clientId, ...client } = selectedCustomer

    const response = await fetch('/api/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...client,
        clientId,
        type: 'FINAL',
        paymentMode: 'Espèces',
        dueDate: new Date().toISOString(),
        status: 'PAID',
        items: cart,
        subtotal: subtotal,
        tax: tax,
        total: total
      })
    })

    if (!response.ok) {
      const error = await response.json()
      toast({
        title: 'Erreur',
        description:
          error.message ||
          'Une erreur est survenue lors de la création de la facture.',
        variant: 'destructive'
      })
      return
    }

    const data = (await response.json()) as { id: string } | null

    if (!data) {
      toast({
        title: 'Erreur',
        description:
          'Une erreur est survenue lors de la création de la facture.',
        variant: 'destructive'
      })
      return
    }

    toast({
      title: 'Succès',
      description: 'La facture a été créée avec succès.',
      variant: 'success'
    })
    // Redirect to the print page for the invoice
    router.push(`/dashboard/ledger/${data.id}`)
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 h-full">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <CustomerSearchInput
            onlyCompanies={false}
            selected={selectedCustomer}
            onSelectChange={setSelectedCustomer}
          />
          <ProductsSection products={products} addToCart={addToCart} />
        </div>
        <CartSection
          cart={cart}
          expandedItems={expandedItems}
          toggleItemExpansion={toggleItemExpansion}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          subtotal={subtotal}
          tax={tax}
          total={total}
          printReceipt={printReceipt}
        />
      </div>
    </div>
  )
}
