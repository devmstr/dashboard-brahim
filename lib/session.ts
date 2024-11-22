import { getServerSession } from 'next-auth/next'

import { authOptions } from '@/lib/auth'

export async function getUser() {
  const session = await getServerSession(authOptions)

  return session?.user
}
