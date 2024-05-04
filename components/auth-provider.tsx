'use client'
import { SessionProvider } from 'next-auth/react'
interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children
}: AuthProviderProps) => {
  return <SessionProvider>{children}</SessionProvider>
}
