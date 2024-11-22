import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { AuthProvider } from '@/components/auth-provider'
import { DashboardNav } from '@/components/dashboard-nav'
import { Toaster } from '@/components/ui/toaster'
import '@/styles/globals.css'
import { ReactQueryProvider } from '@/components/react-query.provider'

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

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html className="w-screen overflow-x-hidden ">
      <ReactQueryProvider>
        <body
          className={cn('flex flex-col h-full bg-slate-100 ', inter.variable)}
        >
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </body>
      </ReactQueryProvider>
    </html>
  )
}
