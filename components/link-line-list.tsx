'use client'
import { SidebarNavItem } from '@/types'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ScrollArea, ScrollBar } from './ui/scroll-area'
import React, { useEffect } from 'react'
import { Skeleton } from './ui/skeleton'
import { Icons } from './icons'
interface Props {
  items: SidebarNavItem[]
  t: Record<string, string>
}

export const LinkLineList: React.FC<Props> = ({ items, t }: Props) => {
  const [isLoading, setIsLoading] = React.useState(true)
  const pathname = usePathname()
  //   const { width } = useWindowSize()

  useEffect(() => {
    if (typeof window != 'undefined') setIsLoading(false)
  }, [])

  if (isLoading)
    return (
      <div className="mx-auto max-w-md pt-8 pb-5 mb-2 space-y-3 ">
        <Skeleton className="bg-gray-200/45 h-[19px] w-full" />
        <div className="z-10 bg-gray-400/15 w-full h-[2px]" />
      </div>
    )

  return (
    <div className={`w-full flex justify-center pt-3 pb-5 `}>
      <ScrollArea
        // style={{ width: width < 768 ? 0.95 * width : 0.95 * (width - 64) }}
        className={`h-fit`}
      >
        <div className="relative flex gap-4 md:gap-5  lg:gap-6 xl:gap-8 pt-5 pb-3 ">
          {items.map((item, index) => {
            const active = pathname === `${item.href}`
            console.log(pathname, item.href)
            const Icon = Icons[item.icon as keyof typeof Icons]
            return (
              <div key={index} className="relative group">
                <div className="flex group gap-1 items-center">
                  <Icon
                    className={cn(
                      'flex items-center justify-center h-auto w-5 text-muted-foreground ',
                      item.icon == 'dollar' && 'scale-110',
                      active ? 'text-primary opacity-100' : 'opacity-70'
                    )}
                  />
                  <div
                    key={index}
                    className={cn(
                      'text-sm md:text-base lg:text-md  text-muted-foreground  transition-colors duration-200 flex-nowrap text-nowrap capitalize ',
                      active
                        ? 'text-primary opacity-100 font-bold'
                        : 'opacity-70 '
                    )}
                  >
                    {item.translationKey && t[item.translationKey]
                      ? t[item.translationKey]
                      : item.title}
                  </div>
                </div>

                <div
                  className={cn(
                    'absolute z-20 rounded-t-full left-0 -bottom-3 h-[3px] w-full bg-primary transition-all duration-500 ',
                    active ? 'scale-100' : 'scale-0'
                  )}
                />
              </div>
            )
          })}
          <div className="absolute z-10 bottom-0 bg-gray-400/15 w-full h-[2px]" />
        </div>
        <ScrollBar orientation="horizontal" hidden />
      </ScrollArea>
    </div>
  )
}
