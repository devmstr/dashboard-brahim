'use client'
import { SidebarNavItem } from '@/types'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { Dispatch } from 'react'
import Fade from './Fade'
import { Icons } from './icons'
import { Button } from './ui/button'
import { useSidebarState } from './open-sidebar-provider'

interface DashboardSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: SidebarNavItem[]
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  items,
  className,

  ...props
}: DashboardSidebarProps) => {
  const { open, setOpen } = useSidebarState()
  const pathname = usePathname()

  return (
    <div
      className={cn(
        'flex flex-col gap-3 items-center shadow-md ',
        open
          ? 'w-64 px-5 items-start transition-all duration-300 ease-in'
          : 'w-16  transition-all duration-500 ease-out',
        className
      )}
      {...props}
    >
      <div className="flex gap-3 pt-3 items-center">
        <Icons.logo className={'flex w-11 h-auto'} />
        {open && (
          <Fade
            from={'top'}
            amount={0.4}
            duration={300}
            delay={200}
            easing={'easeOut'}
          >
            <Icons.identity className={cn('flex h-4 w-auto mt-1')} />
          </Fade>
        )}
      </div>
      <div className="h-full flex flex-col justify-start mt-8">
        {items?.length && (
          <nav className={cn('flex flex-col gap-8')}>
            {items
              ?.filter((item) => item.title !== 'Paramètres')
              .map((item, index) => {
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
                          ? 'text-secondary opacity-100'
                          : 'opacity-80 hover:opacity-100 hover:text-secondary',
                        item.disabled && 'cursor-not-allowed opacity-80'
                      )}
                    >
                      <Icon
                        className={cn(
                          'flex h-[1.4rem] w-[1.4rem] min-h-[1.4rem] min-w-[1.4rem]',
                          open ? 'mr-2' : 'mr-0'
                        )}
                      />
                      {open && (
                        <Fade
                          className={cn(
                            'text-md sm:text-sm'
                            // showSidebar
                            //   ? 'flex transition-all duration-300 ease-in'
                            //   : 'hidden transition-all duration-500 ease-out'
                          )}
                          from={'top'}
                          amount={0.4}
                          duration={300}
                          delay={delay}
                          easing={'easeOut'}
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
      <div className="pb-10">
        {items
          ?.filter((item) => item.title == 'Paramètres')
          .map((item, index) => {
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
                      ? 'text-secondary opacity-100'
                      : 'opacity-80 hover:opacity-100 hover:text-secondary',
                    item.disabled && 'cursor-not-allowed opacity-80'
                  )}
                >
                  <Icon
                    className={cn(
                      'flex h-[1.4rem] w-[1.4rem] min-h-[1.4rem] min-w-[1.4rem]',
                      open ? 'mr-2' : 'mr-0'
                    )}
                  />
                  {open && (
                    <Fade
                      className={cn(
                        'text-md sm:text-sm'
                        // showSidebar
                        //   ? 'flex transition-all duration-300 ease-in'
                        //   : 'hidden transition-all duration-500 ease-out'
                      )}
                      from={'top'}
                      amount={0.4}
                      duration={300}
                      delay={delay}
                      easing={'easeOut'}
                    >
                      <span>{item.title}</span>
                    </Fade>
                  )}
                </Link>
              )
            )
          })}
      </div>
    </div>
  )
}
