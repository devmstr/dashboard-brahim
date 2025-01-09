'use client'

import { User } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export function useClientUser() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
    } else if (status === 'authenticated' && session?.user) {
      setUser(session?.user)
      setLoading(false)
    } else {
      setUser(null)
      setLoading(false)
    }
  }, [session, status])

  return { user, loading }
}
