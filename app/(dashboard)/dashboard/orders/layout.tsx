import React from 'react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = async ({ children }: LayoutProps) => {
  return <div className="py-10">{children}</div>
}

export default Layout
