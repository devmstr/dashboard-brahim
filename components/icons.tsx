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
  eye: (
    props: LucideProps & {
      open?: boolean
    }
  ) => {
    if (props.open) return <Eye {...props} />
    return <EyeOff {...props} />
  },
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
  ongoing: RotateCw
}
