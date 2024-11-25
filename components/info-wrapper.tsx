import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

export function InfoWrapper({
  children,
  infoNode
}: {
  children: React.ReactNode
  infoNode?: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="cursor-pointer" asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent>{infoNode}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
