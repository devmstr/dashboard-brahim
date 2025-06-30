'use client'

import { signOut, useSession } from 'next-auth/react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@ui/dropdown-menu'
import { UserAvatar } from '@/components/user-avatar'
import { toCapitalize, cn, delay } from '@/lib/utils'
import { Dictionary, SidebarNavItem } from '@/types'

import { Icons } from './icons'
import { useRouter, useSelectedLayoutSegment } from 'next/navigation'
import { promise } from 'zod'
import React, { useEffect, useState } from 'react'
import { useServerUser } from '@/hooks/useServerUser'
import { User } from 'next-auth'
import Link from 'next/link'
import useScreenSize from '@/hooks/use-screen-size'

interface UserAccountNavProps extends React.HTMLAttributes<HTMLDivElement> {
  items: SidebarNavItem[]
  user: User
}

export const UserAccountNav: React.FC<UserAccountNavProps> = ({
  items: linkList,
  user: { username, email, employeeId, sub, role, image }
}: UserAccountNavProps) => {
  const isMobile = useScreenSize('(max-width: 768px)')
  const [items, setItems] = useState(linkList)
  const segment = useSelectedLayoutSegment()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!isMobile)
      setItems(items.filter(({ href }) => href == '/dashboard/settings'))
    else setItems(linkList)
  }, [isMobile])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex justify-center items-center">
        <UserAvatar
          image={image}
          onLoad={() => setIsLoading(true)}
          className={cn(
            ' transaction-opacity duration-500  ',
            isLoading ? 'opacity-100' : 'opacity-0'
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="px-3 pt-2 pb-5" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <div className="flex gap-1">
              <p className="font-medium">{toCapitalize(username)}</p>
              <p className="font-medium text-muted-foreground/65">
                #{toCapitalize(employeeId.toString())}
              </p>
            </div>
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              {email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        {items.length &&
          items.map((item, index) => {
            const Icon = Icons[item.icon || 'arrowRight']
            const active = segment === item.href?.split('/').slice(2).join('')
            return (
              <DropdownMenuItem key={index} asChild>
                <div
                  className={cn(
                    'flex gap-3 font-medium fill-current group ',
                    active
                      ? 'text-primary opacity-100'
                      : 'text-gray-500 hover:opacity-100'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 group-hover:text-gray-800 text-opacity-85'
                    )}
                  />
                  <Link
                    href={item.href || '#'}
                    className={cn(
                      'group-hover:text-gray-800 text-sm md:text-base lg:text-md  '
                    )}
                  >
                    {item.title.toLowerCase()}
                  </Link>
                </div>
              </DropdownMenuItem>
            )
          })}
        <DropdownMenuItem
          className="cursor-pointer group"
          onSelect={(event) => {
            event.preventDefault()
            signOut({
              // callbackUrl: `${window.location.origin}/`
            })
          }}
        >
          <div className="flex gap-1 text-base font-medium items-center !text-gray-500 group ">
            <Icons.logout className="w-5 h-5 mr-2 group-hover:text-gray-800 " />
            <span className=" group-hover:text-gray-800">{'Déconnecter'}</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
