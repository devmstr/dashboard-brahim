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
  Menu,
  type LucideIcon
} from 'lucide-react'
import { FaAlignLeft, FaUser } from 'react-icons/fa6'
import { LuPackageCheck } from 'react-icons/lu'

import { cn } from '@/lib/utils'

export type Icon = LucideIcon

export const Icons = {
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
  add: Plus,
  warning: AlertTriangle,
  arrowRight: ArrowRight,
  help: HelpCircle,
  pizza: Pizza,
  sun: SunMedium,
  moon: Moon,
  laptop: Laptop,
  twitter: Twitter,
  check: Check
}
