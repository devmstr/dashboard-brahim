import { cn } from '@/lib/utils'
import { Icons } from './icons'
import { StatusVariant } from '@/types'

interface StatusBudgeProps {
  variant?: StatusVariant
}
const StatusIconName = {
  'Non Commencé': 'planned',
  Encoure: 'ongoing',
  Fini: 'done'
}

export const StatusBudge: React.FC<StatusBudgeProps> = ({
  variant = 'Non Commencé'
}: StatusBudgeProps) => {
  const Icon =
    Icons[StatusIconName[variant] as keyof typeof Icons] || Icons['close']
  return (
    <div className="flex items-center">
      <div
        className={cn(
          variant == 'Non Commencé' && 'bg-[#f5f6f7] text-[#686868]',
          variant == 'Encoure' && 'bg-[#feefcb] text-[#8f500d]',
          variant == 'Fini' && 'bg-[#e9f5ce] text-[#447003]',
          'h-5 pl-1 pr-2 flex gap-1 w-fit text-md rounded-full capitalize'
        )}
      >
        <Icon className="w-auto h-full p-[0.15rem]" /> {variant}
      </div>
    </div>
  )
}
