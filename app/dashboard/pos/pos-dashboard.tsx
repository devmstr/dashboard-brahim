'use client'

import { useState } from 'react'
import { sampleProducts, sampleCustomers } from './data'
import { CartItem, Customer, Product } from '@/types'
import CustomerSearchInput, {
  ClientWithOrdersCount
} from '../../../components/customer-search.input'
import ProductsSection from './product-section'
import CartSection from './cart-selection'
import { useRouter } from 'next/navigation'
import { AddNewClientDialogButton } from '@/components/add-new-client.button'

export default function PosDashboard() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  )
  const [selectedCustomer, setSelectedCustomer] =
    useState<ClientWithOrdersCount | null>(null)

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

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.description,
            price: product.price,
            quantity: 1
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
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return

    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
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
  const printReceipt = () => {
    router.push('printing/24-2025')
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 h-full">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <CustomerSearchInput
            selected={selectedCustomer}
            onSelectChange={setSelectedCustomer}
          />
          <ProductsSection products={sampleProducts} addToCart={addToCart} />
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
