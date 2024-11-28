'use client'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { capitalize } from 'lodash'
import { usePathname, useRouter } from 'next/navigation'

export function LinkerList() {
  const router = useRouter()
  const pathname = usePathname()
  const segments = pathname.split('/').filter((i) => i !== '')
  if (segments[segments.length - 1] === 'dashboard') segments.push('timeline')

  return (
    <Breadcrumb className="">
      <BreadcrumbList className="flex flex-nowrap items-center gap-1">
        {segments.map((link, index) => (
          <div className="flex items-center gap-1 " key={`${index}-${link}`}>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="hover:text-secondary cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  router.replace(
                    link === 'dashboard' || link === 'timeline'
                      ? '/dashboard'
                      : `/dashboard/${link}`
                  )
                }}
              >
                {capitalize(link)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {index != segments.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
