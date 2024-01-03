import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { Icons } from './icons'
import React from 'react'

interface DashboardNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DashboardNav = ({}: DashboardNavProps) => {
  return (
    <div className="flex gap-2 md:gap-4 ">
      <Link href="/" className=" text-white font-bold font-tropical ">
        {siteConfig.name}
      </Link>
    </div>
  )
}
