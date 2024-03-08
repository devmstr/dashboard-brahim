import { cn } from '@/lib/utils'
import { Icons } from './icons'
import { StatusVariant } from '@/types'

interface StatusBudgeProps {
  variant?: StatusVariant
}

export const StatusBudge: React.FC<StatusBudgeProps> = ({
  variant = 'planned'
}: StatusBudgeProps) => {
  const Icon = Icons[variant as keyof typeof Icons] || Icons['close']
  return (
    <div className="flex items-center">
      <div
        className={cn(
          variant == 'planned' && 'bg-[#d9f5fd] text-[#0967b9]',
          variant == 'ongoing' && 'bg-[#feefcb] text-[#8f500d]',
          variant == 'done' && 'bg-[#e9f5ce] text-[#447003]',
          variant == 'abandoned' && 'bg-[#f5f6f7] text-[#686868]',
          'h-5 pl-1 pr-2 flex gap-1 w-fit text-md rounded-full capitalize'
        )}
      >
        <Icon className="w-auto h-full p-[0.15rem]" /> {variant}
      </div>
    </div>
  )
}
