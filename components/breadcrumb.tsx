'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { capitalize } from 'lodash'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'

export function LinkerList() {
  const { data: session } = useSession()
  const user = session?.user
  const router = useRouter()
  const pathname = usePathname()
  const segments = pathname.split('/').filter((i) => i !== '')

  return (
    <Breadcrumb className="">
      <BreadcrumbList className="flex flex-nowrap items-center gap-1">
        {segments.map((link, index) => {
          // Create the path for this breadcrumb item
          const path = `/${segments.slice(0, index + 1).join('/')}`
          return (
            <div className="flex items-center gap-1" key={`${index}-${link}`}>
              <BreadcrumbItem>
                <BreadcrumbLink
                  className="hover:text-secondary cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault()
                    router.replace(path)
                  }}
                >
                  {capitalize(link)}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {index !== segments.length - 1 && <BreadcrumbSeparator />}
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
