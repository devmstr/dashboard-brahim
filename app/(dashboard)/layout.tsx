import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

import { TailwindIndicator } from '@/components/tailwind-indicator'
import { Toaster } from '@/components/ui/toaster'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  authors: siteConfig.authors,
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  },
  manifest: `${siteConfig.url}/site.webmanifest`
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        {children}
        <Toaster />
        <TailwindIndicator />
      </body>
    </html>
  )
}
