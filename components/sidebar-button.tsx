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
      className="bg-transparent border-none hover:bg-transparent text-muted-foreground/40 hover:text-secondary ring-0 focus-visible:ring-0"
    >
      <Icons.sidebar
        direction={open ? 'right' : 'left'}
        className="w-7 h-auto cursor-pointer "
      />
    </Button>
  )
}
