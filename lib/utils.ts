import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function Capitalize(inputString: string): string {
  return inputString
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))
