interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }: LayoutProps) => {
  return <div className="container">{children}</div>
}

export default Layout
