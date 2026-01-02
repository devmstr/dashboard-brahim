import { cn } from '@/lib/utils'
import { Icons } from './icons'
import { STATUS_TYPES, PROCUREMENT_STATUS_TYPES } from '@/config/global'

interface StatusBudgeProps {
  variant?:
    | (typeof STATUS_TYPES)[number]
    | (typeof PROCUREMENT_STATUS_TYPES)[number]
}

interface ProcurementTypeBadgeProps {
  type?: string
}

// Merge French labels for both procurement and invoice statuses
const FrStatus: Record<string, string> = {
  // Procurement statuses (existing)
  CANCELLED: 'Annulé',
  PLANNED: 'Planifié',
  VALIDATED: 'Validé',
  ONGOING: 'En cours',
  FINISHED: 'Terminé',
  DELIVERED: 'Livré',

  // Invoice statuses (new)
  CREATED: 'Créée',
  RECEIVED: 'Reçue',
  APPROVED: 'Validée',
  PAID: 'Payée'
} as const

const TYPE_CONFIG: Record<
  string,
  {
    className: string
  }
> = {
  "Demande d'achat": {
    className: 'bg-[#e6f9ff] text-[#0d8bf2] border-[#0d8bf2]'
  },
  'Demande de devis': {
    className: 'bg-[#f1e8ff] text-[#7b2cbf] border-[#7b2cbf]'
  },
  'Bon de commande': {
    className: 'bg-[#e6f9ed] text-[#1aaa55] border-[#1aaa55]'
  },
  Reception: {
    className: 'bg-[#fff0d4] text-[#ffa500] border-[#ffa500]'
  },
  'Facture fournisseur': {
    className: 'bg-[#fff2f4] text-[#c62828] border-[#c62828]'
  },
  Contrat: {
    className: 'bg-[#f0f0f0] text-[#6b7280] border-[#6b7280]'
  },
  Immobilisation: {
    className: 'bg-[#e8f5e8] text-[#2e7d32] border-[#2e7d32]'
  },
  Autre: {
    className: 'bg-[#f8f9fa] text-[#a0a0a0] border-[#a0a0a0]'
  }
}

// Merge status config for both procurement and invoice
const STATUS_CONFIG: Record<
  string,
  {
    iconKey: keyof typeof Icons
    className: string
  }
> = {
  // Procurement statuses
  CANCELLED: {
    iconKey: 'abandoned',
    className: 'bg-[#f8f9fa] text-[#a0a0a0] border-[#a0a0a0]'
  },
  PLANNED: {
    iconKey: 'planned',
    className: 'bg-[#e6f9ff] text-[#0d8bf2] border-[#0d8bf2]'
  },
  VALIDATED: {
    iconKey: 'checkCircle',
    className: 'bg-[#e8f5e8] text-[#2e7d32] border-[#2e7d32]'
  },
  ONGOING: {
    iconKey: 'ongoing',
    className: 'bg-[#fff0d4] text-[#ffa500] border-[#ffa500]'
  },
  FINISHED: {
    iconKey: 'done',
    className: 'bg-[#f0f8e0] text-[#6ba800] border-[#6ba800]'
  },
  DELIVERED: {
    iconKey: 'deliveryPackage',
    className: 'bg-[#e6f9ed] text-[#1aaa55] border-[#1aaa55]'
  },

  // Invoice statuses
  CREATED: {
    iconKey: 'file',
    className: 'bg-[#e6f9ff] text-[#0d8bf2] border-[#0d8bf2]'
  },
  RECEIVED: {
    iconKey: 'inbox',
    className: 'bg-[#fff0d4] text-[#ffa500] border-[#ffa500]'
  },
  APPROVED: {
    iconKey: 'checkCircle',
    className: 'bg-[#e8f5e8] text-[#2e7d32] border-[#2e7d32]'
  },
  PAID: {
    iconKey: 'done',
    className: 'bg-[#e6f9ed] text-[#1aaa55] border-[#1aaa55]'
  }
}

export const StatusBudge: React.FC<StatusBudgeProps> = ({ variant }) => {
  if (!variant) return null

  const config = STATUS_CONFIG[variant] ?? {
    iconKey: 'close',
    className: 'bg-gray-200 text-gray-500'
  }

  const Icon = Icons[config.iconKey] || Icons['close']

  return (
    <div
      className={cn(
        config.className,
        'pl-1 pr-2 flex gap-1 w-fit text-md rounded-full capitalize border-2 py-[0.08rem] scale-[85%]'
      )}
    >
      <Icon className="w-5 h-5 p-[0.12rem]" /> {FrStatus[variant]}
    </div>
  )
}

export const ProcurementTypeBadge: React.FC<ProcurementTypeBadgeProps> = ({
  type
}) => {
  if (!type) return null

  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.Autre

  return (
    <div
      className={cn(
        config.className,
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium'
      )}
    >
      {type}
    </div>
  )
}
