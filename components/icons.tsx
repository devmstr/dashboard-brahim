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
  UserRoundPlus,
  PackagePlus,
  Puzzle,
  UsersRoundIcon,
  Tag,
  Boxes,
  PackagePlusIcon,
  UserRoundPlusIcon,
  LayoutDashboardIcon,
  RatioIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronDownSquare,
  TableProperties,
  Printer,
  UserRound,
  UserPlus,
  UploadCloud,
  Database,
  Globe,
  Car
} from 'lucide-react'
import { FaAlignLeft, FaUser } from 'react-icons/fa6'
import { LuPackage, LuPackageCheck } from 'react-icons/lu'
import { AiOutlineCalculator } from 'react-icons/ai'
import { FiSidebar } from 'react-icons/fi'
import { RiLogoutCircleLine } from 'react-icons/ri'
import {
  TbLayoutSidebarLeftExpandFilled,
  TbLayoutSidebarRightExpandFilled
} from 'react-icons/tb'
import { BiDollarCircle } from 'react-icons/bi'
import { FiEdit } from 'react-icons/fi'
import { TbTruckDelivery } from 'react-icons/tb'
import { BiCar } from 'react-icons/bi'
import { FaChartGantt } from 'react-icons/fa6'
import { LiaFileInvoiceDollarSolid } from 'react-icons/lia'
import { TbDeviceIpadDollar, TbFileInvoice } from 'react-icons/tb'
import { TbPackageImport } from 'react-icons/tb'
import { PiBuildingsBold } from 'react-icons/pi'
import { IoPricetagsOutline } from 'react-icons/io5'
import { RiOrganizationChart } from 'react-icons/ri'
import { HiOutlineChartPie } from 'react-icons/hi2'
import { TbFileDownload } from 'react-icons/tb'

import { cn } from '@/lib/utils'

export type Icon = LucideIcon

export const Icons = {
  priceMargin: HiOutlineChartPie,
  category: RiOrganizationChart,
  globe: Globe,
  file: TbFileDownload,
  pricingTag: IoPricetagsOutline,
  carBrand: PiBuildingsBold,
  deliveryPackage: TbPackageImport,
  checkCircle: CheckCircle,
  sideCar: Car,
  database: Database,
  ledger: TbDeviceIpadDollar,
  upload: UploadCloud,
  printer: Printer,
  gantt: FaChartGantt,
  table: TableProperties,
  car: BiCar,
  truck: TbTruckDelivery,
  squareChevronDown: ChevronDownSquare,
  plus: PlusIcon,
  dollar: BiDollarCircle,
  ratio: RatioIcon,
  dashboard: LayoutDashboardIcon,
  packagePlus: PackagePlusIcon,
  inventory: Boxes,
  addClient: UserRoundPlusIcon,
  sell: Tag,
  clients: UsersRoundIcon,
  partials: ({ className, ...props }: LucideProps) => (
    <Puzzle className={cn('scale-95', className)} {...props} />
  ),
  logout: RiLogoutCircleLine,
  userPlus: UserRoundPlus,
  user: UserRound,
  calculator: AiOutlineCalculator,
  edit: FiEdit,
  package: LuPackage,
  menu: Menu,
  details: ListEnd,
  notification: Bell,
  orders: GanttChartSquare,
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
  bill: TbFileInvoice,

  eye: (
    props: LucideProps & {
      open?: boolean
    }
  ) => {
    if (props.open) return <Eye {...props} />
    return <EyeOff {...props} />
  },

  sidebar: ({ direction, ...props }: LucideProps) => {
    if (direction == 'left')
      return <TbLayoutSidebarLeftExpandFilled {...props} />
    else return <TbLayoutSidebarRightExpandFilled {...props} />
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
  ),
  identity: ({ color = '#ffd831', ...props }: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="260.122"
      height="26.076"
      viewBox="0 0 260.122 26.076"
      {...props}
    >
      <path
        id="logo-identity"
        d="M4.5,8.535a2.337,2.337,0,0,0,.562,1.589,1.741,1.741,0,0,0,1.349.651H25.737a5.8,5.8,0,0,1,4.541,2.178,7.79,7.79,0,0,1,1.884,5.274v.363a7.8,7.8,0,0,1-1.884,5.26,5.782,5.782,0,0,1-4.541,2.185H1.463a.145.145,0,0,1-.123-.068.27.27,0,0,1-.055-.171V21.782a.284.284,0,0,1,.055-.171.166.166,0,0,1,.123-.062H25.744a1.731,1.731,0,0,0,1.349-.651,2.291,2.291,0,0,0,.562-1.562V17.46a2.35,2.35,0,0,0-.562-1.575,1.714,1.714,0,0,0-1.349-.664H6.415a5.8,5.8,0,0,1-4.541-2.178A7.757,7.757,0,0,1-.01,7.8V7.4A7.745,7.745,0,0,1,1.874,2.158,5.834,5.834,0,0,1,6.415-.006H30.7a.145.145,0,0,1,.123.068.221.221,0,0,1,.055.144V4.24a.221.221,0,0,1-.055.144.189.189,0,0,1-.123.068H6.415A1.721,1.721,0,0,0,5.065,5.1,2.337,2.337,0,0,0,4.5,6.692V8.542ZM63.717-.006a5.816,5.816,0,0,1,4.562,2.178,7.791,7.791,0,0,1,1.884,5.274V18.6a7.791,7.791,0,0,1-1.884,5.274,5.816,5.816,0,0,1-4.562,2.178h-19.3a5.819,5.819,0,0,1-4.548-2.178,7.762,7.762,0,0,1-1.89-5.274V7.446a7.762,7.762,0,0,1,1.89-5.274A5.829,5.829,0,0,1,44.416-.006h19.3Zm1.938,6.692a2.35,2.35,0,0,0-.562-1.575,1.737,1.737,0,0,0-1.377-.664h-19.3a1.74,1.74,0,0,0-1.363.664,2.328,2.328,0,0,0-.575,1.575V19.343a2.328,2.328,0,0,0,.575,1.575,1.74,1.74,0,0,0,1.363.664h19.3a1.737,1.737,0,0,0,1.377-.664,2.35,2.35,0,0,0,.562-1.575ZM103.636.227a.284.284,0,0,1,.055-.171.2.2,0,0,1,.144-.068h4.123a.145.145,0,0,1,.123.068.27.27,0,0,1,.055.171v25.6a.221.221,0,0,1-.055.144.189.189,0,0,1-.123.068H99.533a4.763,4.763,0,0,1-4.075-2.527L84.985,5.466a1.917,1.917,0,0,0-1.623-.986H80.478V25.837a.221.221,0,0,1-.055.144.2.2,0,0,1-.144.068H76.156a.145.145,0,0,1-.123-.068.221.221,0,0,1-.055-.144V.227a.284.284,0,0,1,.055-.171.189.189,0,0,1,.123-.068h8.425a4.806,4.806,0,0,1,4.075,2.555L99.129,20.57a1.857,1.857,0,0,0,1.623,1.014h2.884V.227Zm14.829,10.548h24.254a.164.164,0,0,1,.144.068.27.27,0,0,1,.055.171v4.014a.284.284,0,0,1-.055.171.2.2,0,0,1-.144.068H118.465v4.089a2.35,2.35,0,0,0,.562,1.575,1.737,1.737,0,0,0,1.377.664h25.542a.177.177,0,0,1,.144.062.221.221,0,0,1,.055.144v4.014a.284.284,0,0,1-.055.171.2.2,0,0,1-.144.068H120.4a5.816,5.816,0,0,1-4.562-2.178,7.79,7.79,0,0,1-1.884-5.274V7.446a7.79,7.79,0,0,1,1.884-5.274A5.816,5.816,0,0,1,120.4-.006h25.542a.164.164,0,0,1,.144.068.27.27,0,0,1,.055.171V4.247a.221.221,0,0,1-.055.144.2.2,0,0,1-.144.068H120.4a1.737,1.737,0,0,0-1.377.664,2.351,2.351,0,0,0-.562,1.575v4.089Zm65.659-.726a8.031,8.031,0,0,1-1.034,4.075,6.755,6.755,0,0,1-2.747,2.7l.089.205,3.582,8.7a.355.355,0,0,1-.021.205.157.157,0,0,1-.158.1h-4.569a.192.192,0,0,1-.178-.13l-3.466-8.411H156.48V25.83a.221.221,0,0,1-.055.144.2.2,0,0,1-.144.068h-4.123a.145.145,0,0,1-.123-.068.221.221,0,0,1-.055-.144V.227a.284.284,0,0,1,.055-.171.189.189,0,0,1,.123-.068H177.72a5.8,5.8,0,0,1,4.541,2.178,7.791,7.791,0,0,1,1.884,5.274v2.6Zm-27.658,2.973h21.24a1.721,1.721,0,0,0,1.349-.651,2.337,2.337,0,0,0,.562-1.589V6.692a2.291,2.291,0,0,0-.562-1.562,1.741,1.741,0,0,0-1.349-.651h-21.24v8.541ZM209.673,1.973a5.414,5.414,0,0,1,4.1-1.979h8.986a.164.164,0,0,1,.144.068.27.27,0,0,1,.055.171v25.6a.221.221,0,0,1-.055.144.2.2,0,0,1-.144.068h-4.123a.145.145,0,0,1-.123-.068.191.191,0,0,1-.055-.144V4.473h-3.76a1.772,1.772,0,0,0-1.349.651L195.193,25.987a.233.233,0,0,1-.137.055h-5.74a.17.17,0,0,1-.178-.13.223.223,0,0,1,.048-.233L209.68,1.973Zm22.781,6.562a2.337,2.337,0,0,0,.562,1.589,1.741,1.741,0,0,0,1.349.651h19.322a5.8,5.8,0,0,1,4.541,2.178,7.791,7.791,0,0,1,1.884,5.274v.363a7.8,7.8,0,0,1-1.884,5.26,5.782,5.782,0,0,1-4.541,2.185H229.406a.145.145,0,0,1-.123-.068.235.235,0,0,1-.055-.171V21.782a.284.284,0,0,1,.055-.171.156.156,0,0,1,.123-.062h24.281a1.721,1.721,0,0,0,1.349-.651,2.291,2.291,0,0,0,.562-1.562V17.46a2.35,2.35,0,0,0-.562-1.575,1.714,1.714,0,0,0-1.349-.664H234.365a5.8,5.8,0,0,1-4.541-2.178A7.757,7.757,0,0,1,227.94,7.8V7.4a7.745,7.745,0,0,1,1.884-5.247A5.8,5.8,0,0,1,234.365-.02h24.281a.145.145,0,0,1,.123.068.221.221,0,0,1,.055.144V4.227a.221.221,0,0,1-.055.144.189.189,0,0,1-.123.068H234.365a1.721,1.721,0,0,0-1.349.651,2.337,2.337,0,0,0-.562,1.589V8.528Z"
        transform="translate(0.01 0.02)"
        fill={color}
      />
    </svg>
  ),
  timeline: ({ color = '#ffd831', className, ...props }: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17.049"
      height="21.535"
      viewBox="0 0 17.049 21.535"
      className={cn('scale-95', className)}
      {...props}
    >
      <g id="timeline-icon" transform="translate(-27.036 -168)">
        <path
          id="icons8_Move_up_row_3"
          d="M8.094,6A2.108,2.108,0,0,0,6,8.094V9.888a2.108,2.108,0,0,0,2.094,2.094h7.178a2.108,2.108,0,0,0,2.094-2.094V8.094A2.108,2.108,0,0,0,15.272,6Zm0,1.795h7.178a.286.286,0,0,1,.3.3V9.888a.286.286,0,0,1-.3.3H8.094a.286.286,0,0,1-.3-.3V8.094A.286.286,0,0,1,8.094,7.795Z"
          transform="translate(21.036 169.777)"
        />
        <path
          id="icons8_Move_up_row_3-2"
          data-name="icons8_Move_up_row_3"
          d="M8.094,6A2.108,2.108,0,0,0,6,8.094V9.888a2.108,2.108,0,0,0,2.094,2.094h7.178a2.108,2.108,0,0,0,2.094-2.094V8.094A2.108,2.108,0,0,0,15.272,6Zm0,1.795h7.178a.286.286,0,0,1,.3.3V9.888a.286.286,0,0,1-.3.3H8.094a.286.286,0,0,1-.3-.3V8.094A.286.286,0,0,1,8.094,7.795Z"
          transform="translate(26.719 162)"
        />
        <path
          id="icons8_Move_up_row_3-3"
          data-name="icons8_Move_up_row_3"
          d="M8.094,6A2.108,2.108,0,0,0,6,8.094V9.888a2.108,2.108,0,0,0,2.094,2.094h7.178a2.108,2.108,0,0,0,2.094-2.094V8.094A2.108,2.108,0,0,0,15.272,6Zm0,1.795h7.178a.286.286,0,0,1,.3.3V9.888a.286.286,0,0,1-.3.3H8.094a.286.286,0,0,1-.3-.3V8.094A.286.286,0,0,1,8.094,7.795Z"
          transform="translate(24.625 177.553)"
        />
      </g>
    </svg>
  ),
  completeProduct: ({ className, ...props }: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      height="800px"
      width="800px"
      version="1.2"
      viewBox="0 0 256 256.3"
      xmlSpace="preserve"
      className={cn('scale-[85%]', className)}
      {...props}
    >
      <path d="M243.2,1.4H11.5c-6,0-10.8,4.8-10.8,10.8v231.9c0,6,4.8,10.8,10.8,10.8h231.7c6,0,10.8-4.8,10.8-10.8V12.2  C254,6.2,249.2,1.4,243.2,1.4z M242,127.9h-30.2c-9.4-1.7-16.1-15.1-8.9-20.9c6.5-4.8,10.8-12.5,10.8-21.1  c0-14.4-11.5-25.9-25.9-25.9s-25.9,11.5-25.9,25.9c0,8.6,4.3,16.3,10.8,21.1c7.2,6,0.5,19.7-9.6,20.9h-35.8V92.1v-0.5  c0-9.8-13.7-17-19.4-10.1c-4.3,6-11.5,10.1-19.4,10.1c-13.2,0-24-10.8-24-24s10.8-24,24-24c8.2,0,15.1,4.1,19.4,10.1  c5.8,7,19.4-0.5,19.4-9.8V13.4H242V127.9z M12.7,128.4h30c9.4,1.7,16.1,15.1,8.9,20.9c-6.5,4.8-10.8,12.5-10.8,21.1  c0,14.4,11.5,25.9,25.9,25.9s25.9-11.5,25.9-25.9c0-8.6-4.3-16.3-10.8-21.1c-7.2-6-0.5-19.9,9.6-20.9h35.8v35.8v0.5  c0,9.8,13.7,17,19.4,10.1c4.3-6,11.5-10.1,19.4-10.1c13.2,0,24,10.8,24,24s-10.8,24-24,24c-8.2,0-15.1-4.1-19.4-10.1  c-5.8-7-19.4,0.5-19.4,9.8v30.5H12.7V128.4z" />
    </svg>
  )
}
