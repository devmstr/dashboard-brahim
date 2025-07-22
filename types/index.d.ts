import { Icons } from '@/components/icons'
import { STATUS_TYPES, userRoles } from '@/config/global'
import { Brand, Car } from '@prisma/client'

type NavItem = {
  title: string
  href: string
  translationKey?: string
  disabled?: boolean
}

export type EmployeePasswordsEntry = {
  id: string
  name: string
  role: string | null
  password: string
  updatedAt: Date
}

export type MainNavItem = NavItem

export type DashboardConfig = {
  sidebar: SidebarNavItem[]
}

export type HomeConfig = {
  nav: MainNavItem[]
}

export type OrderTableEntry = {
  id: string
  deadline?: string
  customer: string
  phone: string
  status: (typeof STATUS_TYPES)[number]
  progress?: number
  state?: string
  total?: number
  items?: number
  createdAt?: string
}
export type CarsTableEntry = {
  id: string
  manufacture: string
  car: string
  model?: string
  type?: string
  fuel?: string
  year?: string
}

export type InventoryTableEntry = {
  id: string
  designation: string
  barcode?: string
  brand?: string
  model?: string
  minLevel?: number
  maxLevel?: number
  quantity: number
  price?: number
  priceTTC?: number
  bulkPrice?: number
  bulkPriceTTC?: number
  bulkPriceThreshold?: number
}

export type ClientTableEntry = {
  id: string
  name: string
  city: string | null
  label: string | null
  email: string | null
  phone: string
  orderCount: number
  isCompany: boolean
}
export type ProductPosTableEntry = {
  id: string
  label: string
  stockLevel: number
  price: number
  priceTTC: number
}

export type FooterConfig = {
  companyNav: MainNavItem[]
  resourcesNav: MainNavItem[]
  legalNav: MainNavItem[]
}

export type SidebarNavItem = {
  title: string
  disabled?: boolean
  external?: boolean
  key?: string
  icon?: keyof typeof Icons
} & (
  | {
      href: string
      items?: never
    }
  | {
      href?: string
      items: NavLink[]
    }
)

export type SocialMediaConfig = {
  links: SidebarNavItem[]
}

export type Dictionary = Record<string, string>

declare type UserRole = Uppercase<(typeof userRoles)[number]>

declare type ApiRadiator = {
  id: string
  partNumber: string | null
  category: string | null
  dirId: string | null
  cooling: string | null
  barcode: string | null
  label: string | null
  hash: string | null
  status: string | null
  type: string | null
  production: string | null
  fabrication: string | null
  fins: string | null
  pitch: number | null
  tube: string | null
  rows: number | null
  tubeDiameter: number | null
  betweenCollectors: number | null
  width: number | null
  position: string | null
  tightening: string | null
  perforation: string | null
  isTinned: boolean | null
  tubeType: string | null
  isPainted: boolean | null
  upperCollectorLength: number | null
  lowerCollectorLength: number | null
  upperCollectorWidth: number | null
  lowerCollectorWidth: number | null
  isActive: boolean | null
  inventoryLevel: number | null
  inventoryMaxLevel: number | null
  inventoryAlertAt: number | null
  inventoryLocation: string | null
  inventorId: string | null
  priceId: string | null
  priceHT: number | null
  priceTTC: number | null
  bulkPriceHT: number | null
  bulkPriceTTC: number | null
  bulkPriceThreshold: number | null
  createdAt: Date | null
  Components: {
    usages: {
      id: string
      name: string
      quantity: number | null
      reference: string | null
      description: string | null
      unit: string | null
      baseUnit: string | null
      conversionFactor: number | null
      unitCost: number | null
    }[]
    id: string
    label: string
    type: string | null
    radiatorId: string | null
  }[]
  Types: {
    Model: {
      id: string
      name: string
    }
    Family: {
      id: string
      name: string
    }
    Brand: {
      id: string
      name: string
    }
    id: string
    name: string
    year: string | null
    fuel: string | null
  }[]
  Clients: {
    id: string
    name: string
    phone: string | null
    label: string | null
    email: string | null
    isCompany: boolean
    website: string | null
    fiscalNumber: string | null
    tradeRegisterNumber: string | null
    registrationArticle: string | null
    taxIdNumber: string | null
    statisticalIdNumber: string | null
    approvalNumber: string | null
    addressId: string | null
  }[]
}

declare type InvoiceItem = {
  id?: string
  number: number
  label: string | null
  price: number | null
  amount: number | null
  quantity: number | null
}

declare type Client = {
  id: string
  name: string
  isCompany: boolean | null
  phone: string | null
  label: string | null
  email: string | null
  website: string | null
  tradeRegisterNumber: string | null
  fiscalNumber: string | null
  registrationArticle: string | null
  taxIdNumber: string | null
  statisticalIdNumber: string | null
  approvalNumber: string | null
  addressId: string | null
  street: string | null
  cityId: string | null
  provinceId: string | null
  countryId: string | null
  country: string | null
  province: string | null
  city: string | null
  zip: string | null
  _count: {
    Orders: number
  } | null
}

declare type Invoice = {
  id: string
  reference: string
  date: Date | null
  name: string | null
  address: string | null
  tradeRegisterNumber: string | null
  registrationArticle: string | null
  taxIdNumber: string | null
  type: string | null
  status: string | null
  paymentMode: string | null
  purchaseOrder: string | null
  deliverySlip: string | null
  discountRate: number | null
  refundRate: number | null
  stampTaxRate: number | null
  offerValidity: string | null
  guaranteeTime: string | null
  deliveryTime: string | null
  note: string | null
  total: number | null
  subtotal: number | null
  tax: number | null
  orderId: string | null
  clientId: string | null
  items: InvoiceItem[] | []
}

declare type BillingConfig = {
  discountRate?: number | null // e.g., 0.03 for 3%
  refundRate?: number | null // RG is provided directly as a number
  vatRate?: number | null // fixed at 0.19 (19%)
  stampTaxRate?: number | null // fixed at 0.01 (1%)
}

export interface Product {
  id: string
  label: string
  stockLevel: number
  price: number
  priceTTC: number
  bulkPrice: number
  bulkPriceTTC: number
  image?: string
}

export interface CartItem {
  id: string
  number: number
  label: string
  price: number
  quantity: number
  amount: number
  radiatorId: string
}

export interface Customer {
  id: string
  name: string
  company: string
  phone: string
  city?: string
}
