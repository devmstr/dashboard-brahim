'use client'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { capitalize } from 'lodash'
import { usePathname, useSelectedLayoutSegment } from 'next/navigation'

export function LinkerList() {
  const pathname = usePathname()
  const segment = useSelectedLayoutSegment() || 'timeline'
  const segments = pathname.split('/').filter((i) => i !== '')
  if (segments[segments.length - 1] !== segment)
    segments.push(segment?.replace(/\(|\)/g, ''))
  return (
    <Breadcrumb className="">
      <BreadcrumbList className="flex flex-nowrap items-center gap-1">
        {segments.map((link, index) => (
          <div className="flex items-center gap-1 " key={`${index}-${link}`}>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="hover:text-secondary"
                href={index == segments.length - 1 ? '#' : `/${link}`}
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
