'use client'
import { NewType } from '@/lib/validations'
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
  order?: NewType
  setOrder: Dispatch<SetStateAction<NewType | undefined>>
}

const OrderContext = createContext<ContextType | null>(null)

export const NewOrderProvider: React.FC<Props> = ({ children }: Props) => {
  const [order, setOrder] = useState<NewType | undefined>()
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
      'Production days context must be used in the production days provider'
    )
  return context
}
