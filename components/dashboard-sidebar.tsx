'use client'
import { Dictionary, SidebarNavItem } from '@/types'

import React from 'react'
import { Icons } from './icons'
import {
  usePathname,
  useRouter,
  useSelectedLayoutSegment
} from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import Fade from './Fade'
import { BurgerMenu } from './nav-icon'
import { Button } from './ui/button'

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
        'fixed top-0 left-0 bg-white h-screen z-10 flex flex-col pl-5 justify-center drop-shadow-md',
        showSidebar
          ? 'w-[12rem] transition-all duration-300 ease-in'
          : 'w-16  transition-all duration-500 ease-out'
      )}
      onMouseEnter={(e) => setShowSidebar(true)}
      onMouseLeave={(e) => setShowSidebar(false)}
    >
      <div className={cn(showSidebar ? '' : '')}>
        {items?.length && (
          <nav className={cn('flex flex-col gap-8 ')}>
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
                      'flex items-center text-gray-500    font-medium fill-current w-48',
                      active
                        ? 'text-primary opacity-100'
                        : 'opacity-80 hover:opacity-100 hover:text-foreground',
                      item.disabled && 'cursor-not-allowed opacity-80'
                    )}
                  >
                    <Icon
                      className={cn(
                        'flex h-[1.4rem] w-[1.4rem]',
                        showSidebar ? 'mr-2' : 'mr-0'
                      )}
                    />
                    {showSidebar && (
                      <Fade
                        className={cn('text-md sm:text-sm')}
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
