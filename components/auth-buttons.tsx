'use client'

import { signOut, useSession } from 'next-auth/react'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'

interface AuthButtonsProps {}

export const AuthButtons: React.FC<
  AuthButtonsProps
> = ({}: AuthButtonsProps) => {
  const { data: session } = useSession()
  if (!session) return null
  return (
    <div>
      <Button
        variant={'outline'}
        className="text-white bg-primary border-[1.5px]"
        onClick={(e) => signOut()}
      >
        Sortir
      </Button>
    </div>
  )
}
