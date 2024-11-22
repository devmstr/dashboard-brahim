'use client'

import { Icons } from './icons'
import { useSidebarState } from './open-sidebar-provider'
import { Button } from './ui/button'

interface Props {}

export const SidebarButton: React.FC<Props> = ({}: Props) => {
  const { open, setOpen } = useSidebarState()

  return (
    <Button
      onClick={(e) => setOpen(!open)}
      className="bg-transparent border-none hover:bg-transparent text-muted-foreground hover:text-secondary"
    >
      <Icons.sidebar className="w-7 h-auto cursor-pointer" />
    </Button>
  )
}
