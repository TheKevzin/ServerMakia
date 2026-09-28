/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/map-api/:path*',
        destination: 'http://127.0.0.1:8100/:path*',
      },
      {
        source: '/assets/:path*',
        destination: 'http://127.0.0.1:8100/assets/:path*',
      },
      {
        source: '/maps/:path*',
        destination: 'http://127.0.0.1:8100/maps/:path*',
      },
      {
        source: '/live/:path*',
        destination: 'http://127.0.0.1:8100/live/:path*',
      },
      {
        source: '/lang/:path*',
        destination: 'http://127.0.0.1:8100/lang/:path*',
      },
      {
        source: '/data/:path*',
        destination: 'http://127.0.0.1:8100/data/:path*',
      },
      {
        source: '/settings.json',
        destination: 'http://127.0.0.1:8100/settings.json',
      },
    ]
  },
}

export default nextConfig
