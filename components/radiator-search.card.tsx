import type React from 'react'
import { Car, Factory, Info, Tractor, Zap, Users, Package } from 'lucide-react'
import type { OrderItem } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ApiRadiator } from '@/types'
import { SiMercedes } from 'react-icons/si'

interface Props {
  product: ApiRadiator
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
      <div className="mt-6 pt-4 w-full border-t border-gray-100 flex">
        {/* Brands section */}
        {product.CarType && (
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <SiMercedes className="h-6 w-6 text-gray-400" />
              <div className="flex-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Marque & Modèle
                </span>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {product.CarType.Model.Family.Brand.name} -{' '}
                  {product.CarType.Model.name}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vertical separator */}
        <div className="w-px bg-gray-200 mx-2"></div>

        {/* Clients section */}
        {product.Clients && product.Clients.length > 0 && (
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-gray-400" />
              <div className="flex-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Clients ({product.Clients.length})
                </span>
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {product.Clients.slice(0, 3).map((client) => (
                      <span
                        key={client.id}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                      >
                        {client.name}
                      </span>
                    ))}
                    {product.Clients.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                        +{product.Clients.length - 3} autres
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
