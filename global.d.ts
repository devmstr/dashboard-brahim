declare module '*.css'

declare module 'thousands' {
  export default function thousands(
    value: number | string,
    separator?: string,
    groupSize?: number
  ): string
}
