import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

import { TailwindIndicator } from '@/components/tailwind-indicator'
import { Toaster } from '@/components/ui/toaster'
import '@/styles/globals.css'
import { DashboardNav } from '@/components/dashboard-nav'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { EmployeeDashboardConfig } from '@/config/dashboard'
import { ScrollArea } from '@/components/scroll-area'

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
          'min-h-screen bg-gray-50 font-sans antialiased',
          inter.variable
        )}
      >
        <div className="flex !max-h-screen h-screen w-full">
          <aside className="hidden md:flex flex-col h-full items-center bg-background ">
            <DashboardSidebar items={EmployeeDashboardConfig.sidebar} />
          </aside>
          <main className="flex flex-col w-full h-full">
            <nav className="h-16 z-40 w-full bg-primary">
              <div className="container h-full flex items-center justify-between">
                <DashboardNav />
              </div>
            </nav>
            <ScrollArea className="h-screen w-full">{children}</ScrollArea>
            <Toaster />
            <TailwindIndicator />
          </main>
        </div>
      </body>
    </html>
  )
}
