import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { AuthProvider } from '@/components/auth-provider'
import { Toaster } from '@/components/ui/toaster'
import '@/styles/globals.css'
import { ReactQueryProvider } from '@/components/react-query.provider'
import localFont from 'next/font/local'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const geistSans = localFont({
  src: '../public/fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
})
const geistMono = localFont({
  src: '../public/fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
})

const notoNaskhArabic = localFont({
  src: [
    {
      path: '../public/fonts/Noto_Naskh_Arabic/NotoNaskhArabic-Regular.ttf',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../public/fonts/Noto_Naskh_Arabic/NotoNaskhArabic-Medium.ttf',
      weight: '500',
      style: 'normal'
    },
    {
      path: '../public/fonts/Noto_Naskh_Arabic/NotoNaskhArabic-SemiBold.ttf',
      weight: '600',
      style: 'normal'
    },
    {
      path: '../public/fonts/Noto_Naskh_Arabic/NotoNaskhArabic-Bold.ttf',
      weight: '700',
      style: 'normal'
    },
    {
      path: '../public/fonts/Noto_Naskh_Arabic/NotoNaskhArabic-VariableFont_wght.ttf',
      weight: '100 900',
      style: 'normal'
    }
  ],
  variable: '--font-noto-naskh'
})

// Import Poppins (All Weights)
const poppins = localFont({
  src: [
    {
      path: '../public/fonts/Poppins/Poppins-Thin.ttf',
      weight: '100',
      style: 'normal'
    },
    {
      path: '../public/fonts/Poppins/Poppins-ExtraLight.ttf',
      weight: '200',
      style: 'normal'
    },
    {
      path: '../public/fonts/Poppins/Poppins-Light.ttf',
      weight: '300',
      style: 'normal'
    },
    {
      path: '../public/fonts/Poppins/Poppins-Regular.ttf',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../public/fonts/Poppins/Poppins-Medium.ttf',
      weight: '500',
      style: 'normal'
    },
    {
      path: '../public/fonts/Poppins/Poppins-SemiBold.ttf',
      weight: '600',
      style: 'normal'
    },
    {
      path: '../public/fonts/Poppins/Poppins-Bold.ttf',
      weight: '700',
      style: 'normal'
    },
    {
      path: '../public/fonts/Poppins/Poppins-ExtraBold.ttf',
      weight: '800',
      style: 'normal'
    },
    {
      path: '../public/fonts/Poppins/Poppins-Black.ttf',
      weight: '900',
      style: 'normal'
    }
  ],
  variable: '--font-poppins'
})

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
          className={cn(
            'flex flex-col h-full bg-slate-100 ',
            inter.variable,
            geistSans.variable,
            geistMono.variable,
            notoNaskhArabic.variable,
            poppins.variable
          )}
        >
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </body>
      </ReactQueryProvider>
    </html>
  )
}
