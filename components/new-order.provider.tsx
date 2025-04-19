'use client'
import { OrderValidationType } from '@/lib/validations'
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState
} from 'react'

interface Props {
  children: React.ReactNode
}

type ContextType = {
  order?: OrderValidationType
  setOrder: Dispatch<SetStateAction<OrderValidationType | undefined>>
}

const OrderContext = createContext<ContextType | null>(null)

export const NewOrderProvider: React.FC<Props> = ({ children }: Props) => {
  const [order, setOrder] = useState<OrderValidationType | undefined>()
  return (
    <OrderContext.Provider value={{ order, setOrder }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrder() {
  const context = useContext(OrderContext)
  if (!context)
    throw new Error(
      'Order context must be used in the production order provider'
    )
  return context
}
