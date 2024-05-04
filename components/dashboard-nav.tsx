import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { Icons } from './icons'
import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AuthButtons } from './auth-buttons'

interface DashboardNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DashboardNav = async (props: DashboardNavProps) => {
  return (
    <div {...props}>
      <nav className="container  flex items-center justify-between ">
        <div className="flex gap-1">
          <Icons.package className="min-w-5 min-h-5 text-background" />
          <Link href="/" className=" text-white font-bold font-tropical ">
            {siteConfig.name}
          </Link>
        </div>
        <AuthButtons />
      </nav>
    </div>
  )
}
