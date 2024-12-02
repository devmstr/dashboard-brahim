'use client'
import { SidebarNavItem } from '@/types'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import Fade from './Fade'
import { Icons } from './icons'
import { useSidebarState } from './open-sidebar-provider'

interface DashboardSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: SidebarNavItem[]
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  items,
  className,
  ...props
}: DashboardSidebarProps) => {
  const { open } = useSidebarState()
  const pathname = usePathname()
  return (
    <div
      className={cn(
        'flex-col gap-3 items-center shadow-md ',
        open
          ? 'w-64 px-3 items-start transition-all duration-300 ease-in'
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
            <h1 className={cn('flex text-2xl font-black mt-1 text-secondary')}>
              SONERAS<span className="font-light">Flow</span>
            </h1>
          </Fade>
        )}
      </div>
      <div className="h-full flex flex-col justify-start mt-6 w-full">
        {items?.length && (
          <nav
            className={cn(
              'flex flex-col gap-2 w-full',
              open ? 'items-start px-0' : 'items-center px-2'
            )}
          >
            {items
              ?.filter((item) => item.title !== 'Paramètres')
              .map((item, index) => {
                const Icon = Icons[item.icon || 'arrowRight']
                const delay = (index = 0 ? 80 : index * 80)

                const active =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname?.startsWith(
                        item.href?.split('/').slice(0, 3).join('/') as string
                      )

                return (
                  item.href && (
                    <Link
                      key={index}
                      href={item.disabled ? '#' : item.href!}
                      className={cn(
                        'relative group flex items-center text-gray-400 font-medium fill-current bg-slate-700/25 w-full p-3   rounded-lg',
                        active
                          ? 'text-primary bg-secondary opacity-100'
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
                      {open ? (
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
                      ) : (
                        <span
                          className={cn(
                            'absolute z-40 scale-0  group-hover:scale-100 transition-all duration-300 ease-in-out  ml-14 bg-primary p-3 rounded-lg text-gray-400 group-hover:text-secondary opacity-100  shadow-lg text-nowrap ',
                            active &&
                              'bg-secondary text-primary group-hover:text-primary'
                          )}
                        >
                          {item.title}
                        </span>
                      )}
                    </Link>
                  )
                )
              })}
          </nav>
        )}
      </div>
      <div
        className={cn(
          'pb-8 flex flex-col gap-2 w-full',
          open ? 'items-start px-0' : 'items-center px-2'
        )}
      >
        {items
          ?.filter((item) => item.title == 'Paramètres')
          .map((item, index) => {
            const Icon = Icons[item.icon || 'arrowRight']
            const delay = (index = 0 ? 80 : index * 80)

            const active =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname?.startsWith(item.href as string)

            return (
              item.href && (
                <Link
                  key={index}
                  href={item.disabled ? '#' : item.href!}
                  className={cn(
                    'relative group flex items-center text-gray-400 font-medium fill-current bg-slate-700/25 w-full p-3   rounded-lg',
                    active
                      ? 'text-primary bg-secondary opacity-100'
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
                  {open ? (
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
                  ) : (
                    <span
                      className={cn(
                        'absolute z-40 scale-0  group-hover:scale-100 transition-all duration-300 ease-in-out  ml-14 bg-primary p-3 rounded-lg text-gray-400 group-hover:text-secondary opacity-100  shadow-lg text-nowrap',
                        active &&
                          'bg-secondary text-primary group-hover:text-primary'
                      )}
                    >
                      {item.title}
                    </span>
                  )}
                </Link>
              )
            )
          })}
      </div>
    </div>
  )
}
