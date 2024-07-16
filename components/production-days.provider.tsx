'use client'
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState
} from 'react'

interface ProductionDaysProviderProps {
  children: React.ReactNode
}

type ProductionContext = {
  days: number
  setDays: Dispatch<SetStateAction<number>>
}

const ProductionDaysContext = createContext<ProductionContext | null>(null)

export const ProductionDaysProvider: React.FC<ProductionDaysProviderProps> = ({
  children
}: ProductionDaysProviderProps) => {
  const [days, setDays] = useState<number>(0)
  return (
    <ProductionDaysContext.Provider value={{ days, setDays }}>
      {children}
    </ProductionDaysContext.Provider>
  )
}

export function useProductionDays() {
  const context = useContext(ProductionDaysContext)
  if (!context)
    throw new Error(
      'Production days context must be used in the production days provider'
    )
  return context
}
