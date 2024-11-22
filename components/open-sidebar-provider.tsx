'use client'
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

type SidebarState = {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const openSidebarContext = createContext<SidebarState | null>(null)

export const SidebarStateProvider: React.FC<Props> = ({ children }: Props) => {
  const [open, setOpen] = useState<boolean>(false)
  return (
    <openSidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </openSidebarContext.Provider>
  )
}

export function useSidebarState() {
  const context = useContext(openSidebarContext)
  if (!context)
    throw new Error(
      'useSidebarState must be used inside a SidebarStateProvider'
    )
  return context
}
