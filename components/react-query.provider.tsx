'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface ReactQueryProviderProps {
  children: React.ReactNode
}

export const ReactQueryProvider: React.FC<ReactQueryProviderProps> = ({
  children
}: ReactQueryProviderProps) => {
  const client = new QueryClient()
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
