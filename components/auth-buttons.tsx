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
        variant={'ghost'}
        className="text-white"
        onClick={(e) => signOut()}
      >
        Sortir
      </Button>
    </div>
  )
}
