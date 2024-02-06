import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

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

// to screaming snake case
export function toScreamingSnakeCase(str: string): string {
  if (!str) return str
  return str
    .trim()
    .replace(/\.|\-/g, '_')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toUpperCase()
}
