import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  File,
  FileText,
  HelpCircle,
  Image,
  Laptop,
  Loader2,
  Moon,
  MoreVertical,
  Pizza,
  Plus,
  Settings,
  SunMedium,
  Trash,
  Twitter,
  X,
  List,
  ChevronDown,
  Mail,
  GanttChartSquare,
  Languages,
  Bell,
  ListEnd,
  Eye,
  Menu,
  PlusCircleIcon,
  Pencil,
  type LucideIcon,
  Ban,
  CheckCircle,
  Clock,
  RotateCw,
  LucideProps,
  EyeOff,
  Users,
  UserRoundPlus
} from 'lucide-react'
import { FaAlignLeft, FaUser } from 'react-icons/fa6'
import { LuPackageCheck } from 'react-icons/lu'
import { AiOutlineCalculator } from 'react-icons/ai'

export type Icon = LucideIcon

export const Icons = {
  users: UserRoundPlus,
  calculator: AiOutlineCalculator,
  add: PlusCircleIcon,
  edit: Pencil,
  package: LuPackageCheck,
  menu: Menu,
  details: ListEnd,
  notification: Bell,
  orders: List,
  dashboard: GanttChartSquare,
  user: FaUser,
  mail: Mail,
  dropdown: ChevronDown,
  languages: Languages,
  close: X,
  spinner: Loader2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  trash: Trash,
  post: FileText,
  page: File,
  media: Image,
  settings: Settings,
  billing: CreditCard,
  ellipsis: MoreVertical,
  warning: AlertTriangle,
  arrowRight: ArrowRight,
  help: HelpCircle,
  pizza: Pizza,
  sun: SunMedium,
  moon: Moon,
  laptop: Laptop,
  twitter: Twitter,
  check: Check,
  abandoned: Ban,
  planned: Clock,
  done: CheckCircle,
  ongoing: RotateCw,
  eye: (
    props: LucideProps & {
      open?: boolean
    }
  ) => {
    if (props.open) return <Eye {...props} />
    return <EyeOff {...props} />
  },
  logo: ({ color = '#ffd831', ...props }: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="98.146"
      height="98.132"
      viewBox="0 0 98.146 98.132"
      {...props}
    >
      <path
        id="logo-sahpe"
        d="M97.961,44.912c-.13-1.589-.342-3.158-.623-4.706a48.55,48.55,0,0,0-2.39-8.576.914.914,0,0,0-.849-.582H14.747a.61.61,0,0,1-.534-.9,39.655,39.655,0,0,1,62.262-9.733.9.9,0,0,0,1.267-.021l5.377-5.377a.918.918,0,0,0,0-1.295A49.1,49.1,0,0,0,3.411,31.049a48.336,48.336,0,0,0-2.4,8.055.916.916,0,0,0,.89,1.1H87.721c.274,1.2.493,2.425.658,3.664a.919.919,0,0,1-.9,1.041H.178Q0,46.967,0,49.07a48.2,48.2,0,0,0,.253,5c.137,1.384.342,2.747.6,4.1a48.662,48.662,0,0,0,2.438,8.576.914.914,0,0,0,.849.582H84.276a39.652,39.652,0,0,1-62.611,10.4.9.9,0,0,0-1.267.021l-5.37,5.37a.918.918,0,0,0,0,1.295A49.051,49.051,0,0,0,97.064,59.268a.909.909,0,0,0-.89-1.1H10.466c-.233-1-.432-2.014-.589-3.041a.916.916,0,0,1,.9-1.055H97.057a.91.91,0,0,0,.911-.829q.175-2.065.178-4.178c0-1.411-.062-2.788-.178-4.158Z"
        fill={color}
      />
    </svg>
  )
}
