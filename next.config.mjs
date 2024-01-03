/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    path: '/_next/image',
    remotePatterns: [
      {
        hostname: 'localhost',
        port: '3000'
      },
      {
        hostname: 'perfectassesspro.com'
      },
      {
        hostname: 'avatars.githubusercontent.com'
      }
    ]
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'referrer-policy',
            value: 'no-referrer'
          }
        ]
      }
    ]
  }
}

export default nextConfig
