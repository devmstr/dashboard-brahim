'use server'

import { getServerSession } from 'next-auth/next'

import { authOptions } from '@/lib/auth'

export async function useServerUser() {
  const session = await getServerSession(authOptions)

  return session?.user
}
