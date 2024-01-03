'use client'
import { Dictionary, SidebarNavItem } from '@/types'

import React from 'react'
import { Icons } from './icons'
import { usePathname, useSelectedLayoutSegment } from 'next/navigation'
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
  const segment = useSelectedLayoutSegment()
  const [showSidebar, setShowSidebar] = React.useState(false)
  return (
    <div className="flex flex-col left-0 h-screen  z-50  ">
      <Button
        onClick={(e) => {
          e.preventDefault
          setShowSidebar(!showSidebar)
        }}
        className={cn(
          'bg-primary h-[67px] w-full flex pl-[0.4rem] justify-center items-center border-r-2 border-white border-opacity-15  rounded-none'
        )}
      >
        <BurgerMenu state={showSidebar} />
      </Button>

      <div
        className={cn(
          'flex pl-5 flex-col justify-center h-full drop-shadow-lg bg-white  ',
          showSidebar
            ? 'w-[14rem]  transition-all duration-300 ease-in'
            : 'w-16  transition-all duration-500 ease-out'
        )}
      >
        <div className={cn(showSidebar ? '' : '')}>
          {items?.length && (
            <nav className={cn('flex flex-col gap-8 ')}>
              {items?.map((item, index) => {
                const Icon = Icons[item.icon || 'arrowRight']
                const delay = (index = 0 ? 80 : index * 80)
                const active =
                  segment === item.href?.split('/').slice(1).join('')

                return (
                  item.href && (
                    <Link
                      key={index}
                      href={item.disabled ? '#' : item.href!}
                      className={cn(
                        'flex items-center text-gray-500  hover:text-primary  font-medium fill-current w-48',
                        active
                          ? 'text-primary opacity-100'
                          : 'opacity-70 hover:opacity-100',
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
    </div>
  )
}
