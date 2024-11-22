'use client'
import { SidebarNavItem } from '@/types'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import Fade from './Fade'
import { Icons } from './icons'

interface DashboardSidebarProps {
  items?: SidebarNavItem[]
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  items
}: DashboardSidebarProps) => {
  const pathname = usePathname()
  const [showSidebar, setShowSidebar] = React.useState(false)
  return (
    <div
      className={cn(
        'fixed bg-white h-screen z-30 flex flex-col pl-5 justify-center drop-shadow-md',
        showSidebar
          ? 'w-[12rem] transition-all duration-300 ease-in'
          : 'w-16  transition-all duration-500 ease-out'
      )}
    >
      <div>
        {items?.length && (
          <nav
            onMouseEnter={(e) => setShowSidebar(true)}
            onMouseLeave={(e) => setShowSidebar(false)}
            className={cn('flex flex-col gap-8')}
          >
            {items?.map((item, index) => {
              const Icon = Icons[item.icon || 'arrowRight']
              const delay = (index = 0 ? 80 : index * 80)
              const active =
                pathname?.split('/').slice(2).join('') ===
                item.href?.split('/').slice(2).join('')
              return (
                item.href && (
                  <Link
                    key={index}
                    href={item.disabled ? '#' : item.href!}
                    className={cn(
                      'flex items-center text-gray-500 font-medium fill-current',
                      active
                        ? 'text-primary opacity-100'
                        : 'opacity-80 hover:opacity-100 hover:text-foreground',
                      item.disabled && 'cursor-not-allowed opacity-80'
                    )}
                  >
                    <Icon
                      className={cn(
                        'flex h-[1.4rem] w-[1.4rem] min-h-[1.4rem] min-w-[1.4rem]',
                        showSidebar ? 'mr-2' : 'mr-0'
                      )}
                    />
                    {showSidebar && (
                      <Fade
                        className={cn(
                          'text-md sm:text-sm'
                          // showSidebar
                          //   ? 'flex transition-all duration-300 ease-in'
                          //   : 'hidden transition-all duration-500 ease-out'
                        )}
                        from={'top'}
                        amount={0.4}
                        duration={250}
                        delay={delay}
                        easing={'easeInOut'}
                      >
                        <span>{item.title}</span>
                      </Fade>
                    )}
                  </Link>
                )
              )
            })}
          </nav>
        )}
      </div>
    </div>
  )
}
