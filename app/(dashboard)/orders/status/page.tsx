import React from 'react'

interface PageProps {}

const Page: React.FC<PageProps> = async ({}: PageProps) => {
  // await for 1 second to simulate loading
  return <h1 className=""> status </h1>
}

export default Page
