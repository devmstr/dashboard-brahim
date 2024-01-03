'use client'
import { NavItem } from '@/types'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface MenuListLinksProps {
  items: NavItem[]
}

export const MenuListLinks: React.FC<MenuListLinksProps> = ({
  items
}: MenuListLinksProps) => {
  const pathname = usePathname()

  return (
    <div className="flex gap-2 md:gap-3 lg:gap-4">
      {items.map((item, index) => {
        const active = pathname === `/${item.href}`
        return (
          <Link
            key={index}
            className={cn(
              'text-sm md:text-base lg:text-md font-medium text-muted-foreground hover:text-primary transition-colors duration-200',
              active
                ? 'text-primary  opacity-100'
                : 'opacity-70 hover:opacity-100'
            )}
            href={item.href}
          >
            {item.title}
          </Link>
        )
      })}
    </div>
  )
}
