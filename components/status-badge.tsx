import { cn } from '@/lib/utils'
import { Icons } from './icons'

interface StatusBudgeProps {
  variant?: FrenchStatusNames
}

type FrenchStatusNames = 'Annuler' | 'Non Commence' | 'Encours' | 'Fini'
const getStatusIcon = (variant: FrenchStatusNames) => {
  switch (variant) {
    case 'Annuler':
      return 'abandoned'
    case 'Non Commence':
      return 'planned'
    case 'Encours':
      return 'ongoing'
    case 'Fini':
      return 'done'
  }
}

export const StatusBudge: React.FC<StatusBudgeProps> = ({
  variant
}: StatusBudgeProps) => {
  const Icon =
    Icons[getStatusIcon(variant as FrenchStatusNames) as keyof typeof Icons] ||
    Icons['close']
  return (
    <div className="flex items-center">
      <div
        className={cn(
          variant == 'Non Commence' &&
            'bg-[#d9f5fd] text-[#0967b9] rounded-full capitalize',
          variant == 'Encours' &&
            'bg-[#feefcb] text-[#8f500d] rounded-full capitalize',
          variant == 'Fini' &&
            'bg-[#e9f5ce] text-[#447003] rounded-full capitalize',
          'h-5 pl-1 pr-2 flex gap-1 w-fit text-md rounded-full capitalize',
          variant == 'Annuler' &&
            'bg-[#f5f6f7] text-[#686868]  rounded-full capitalize'
        )}
      >
        <Icon className="w-auto h-full p-[0.15rem]" /> {variant}
      </div>
    </div>
  )
}
