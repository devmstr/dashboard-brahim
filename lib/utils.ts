import { UserRole } from '@/types'
import { Content } from '@tiptap/react'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import thousands from 'format-thousands'

export const formatPhoneNumber = (phone: string | null | undefined) => {
  if (!phone) return ''
  // remove the country code
  let cleanedPhone = phone.replace(/[^0-9]/g, '')
  // add the leading zero if it doesn't exist
  const hasLeadingZero = cleanedPhone.startsWith('0')
  const hasCountryCode = cleanedPhone.startsWith('213')
  const hasPlus = cleanedPhone.startsWith('+')
  const hasValidLength = cleanedPhone.length === 9 || cleanedPhone.length === 10
  if (!hasLeadingZero && !hasCountryCode && !hasPlus && hasValidLength) {
    cleanedPhone = '0' + cleanedPhone
  } else if (hasCountryCode) {
    cleanedPhone = cleanedPhone.replace('213', '0')
  } else if (hasPlus) {
    cleanedPhone = cleanedPhone.replace('+213', '0')
  }

  // if phone number is 10 digits, format it as 0X XX XX XX XX
  if (cleanedPhone.length === 10) {
    return cleanedPhone.replace(
      /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/,
      '$1 $2 $3 $4 $5'
    )
  }
  // if phone number is 9 digits, format it as 0X XX XX XX
  return cleanedPhone.replace(/(\d{3})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4')
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export function toKebabCase(str: string): string {
  if (!str) return str
  return str
    .trim()
    .replace(/[\s\.\-]+/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
}

export function toCapitalize(str: string): string {
  if (!str) return str
  return str
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// check user role
export const hasUserRole = (userRole: UserRole, roles: UserRole[]): boolean => {
  return userRole === 'ADMIN' || roles.includes(userRole)
}

// to screaming snake case
export function toScreamingSnakeCase(str: string): string {
  if (!str) return str
  return str
    .trim()
    .replace(/\.|\-/g, '_')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toUpperCase()
}

export const parseMetadata = (meta: any) => {
  if (!meta) return undefined
  if (typeof meta === 'object') return meta
  try {
    return JSON.parse(meta)
  } catch {
    return undefined
  }
}

export const dateDiff = (startDate: string, endDate: string) => {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  return Math.round((end - start) / (1000 * 60 * 60 * 24))
}

export function isContentEmpty(note: Content): boolean {
  if (note === null) return true

  if (typeof note === 'string') {
    return note.trim() === ''
  }

  if (Array.isArray(note)) {
    return note.length === 0 || note.every(isContentEmpty)
  }

  // It's a single JSONContent object
  if (typeof note === 'object') {
    const hasText = typeof note.text === 'string' && note.text.trim() !== ''
    const hasChildren =
      Array.isArray(note.content) &&
      note.content.some((child) => !isContentEmpty(child))
    return !hasText && !hasChildren
  }

  return true
}

export function formatPrice(value: number | string | undefined | null): string {
  if (!value) return '0'
  const rounded = Math.floor(Number(value) * 100) / 100
  return thousands(rounded.toFixed(2), {
    separator: ' ',
    formatFourDigits: true
  })
}
