import type React from 'react'
import { Car, Factory, Info, Tractor, Zap, Users } from 'lucide-react'
import type { OrderItem } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  product: {
    id: string
    label: string
    category: OrderItem['category'] // as "Automobile" | "Industriel" | "Générateurs" | "Agricole" | undefined
    Brands?: Array<{
      id: string
      name: string
      Models?: Array<{ id: string; name: string }>
    }>
    Clients?: Array<{ id: string; name: string }>
  }
  children?: React.ReactNode
}

export const RadiatorSearchCard: React.FC<Props> = ({ product, children }) => {
  // Function to get the appropriate icon based on category
  const getCategoryIcon = () => {
    switch (product.category) {
      case 'Automobile':
        return <Car className="h-auto w-36 opacity-5 text-blue-600" />
      case 'Industriel':
        return <Factory className="h-auto w-36 opacity-5 text-orange-600" />
      case 'Générateurs':
        return <Zap className="h-auto w-36 opacity-5 text-yellow-600" />
      case 'Agricole':
        return <Tractor className="h-auto w-36 opacity-5 text-green-600" />
      default:
        return <Info className="h-auto w-36 opacity-5 text-gray-600" />
    }
  }

  // Function to get gradient based on category
  const getGradient = () => {
    switch (product.category) {
      case 'Automobile':
        return 'bg-gradient-to-br from-blue-50 via-white to-white'
      case 'Industriel':
        return 'bg-gradient-to-br from-orange-50 via-white to-white'
      case 'Générateurs':
        return 'bg-gradient-to-br from-yellow-50 via-white to-white'
      case 'Agricole':
        return 'bg-gradient-to-br from-green-50 via-white to-white'
      default:
        return 'bg-gradient-to-br from-gray-50 via-white to-white'
    }
  }

  // Count total models across all brands
  const totalModels =
    product.Brands?.reduce(
      (acc, brand) => acc + (brand.Models?.length || 0),
      0
    ) || 0

  // Count total clients
  const totalClients = product.Clients?.length || 0

  return (
    <div
      className={cn(
        'p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden',
        getGradient()
      )}
    >
      {/* Category icon in top left */}
      <div className="absolute -top-4 -left-4 ">{getCategoryIcon()}</div>

      {/* Main content - vertically centered */}
      <div className="flex justify-between items-center min-h-[80px] pl-10">
        <div className="flex-1 text-center">
          <h3 className="text-2xl font-semibold mb-1">{product.label}</h3>
          <div className="text-md text-gray-500">{product.id}</div>
        </div>
        {children ? <div className="max-w-36">{children}</div> : null}
      </div>

      {/* Bottom section with brands and clients */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex">
        {/* Brands section */}
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Car className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">
              Brands ({product.Brands?.length || 0})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.Brands?.slice(0, 3).map((brand) => (
              <span
                key={brand.id}
                className="text-xs px-2 py-1 bg-white/80 rounded-full border border-gray-100"
              >
                {brand.name}
              </span>
            ))}
            {(product.Brands?.length || 0) > 3 && (
              <span className="text-xs px-2 py-1 bg-white/80 rounded-full border border-gray-100">
                +{(product.Brands?.length || 0) - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Vertical separator */}
        <div className="w-px bg-gray-200 mx-2"></div>

        {/* Clients section */}
        <div className="flex-1 pl-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">
              Clients ({totalClients})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.Clients?.slice(0, 3).map((client) => (
              <span
                key={client.id}
                className="text-xs px-2 py-1 bg-white/80 rounded-full border border-gray-100"
              >
                {client.name}
              </span>
            ))}
            {(product.Clients?.length || 0) > 3 && (
              <span className="text-xs px-2 py-1 bg-white/80 rounded-full border border-gray-100">
                +{(product.Clients?.length || 0) - 3} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
