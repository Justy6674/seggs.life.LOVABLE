/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  async redirects() {
    // Hide test routes in production
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/test-gemini',
          destination: '/404',
          permanent: false,
        },
        {
          source: '/test-seggsy',
          destination: '/404',
          permanent: false,
        },
        {
          source: '/test-quiz',
          destination: '/404',
          permanent: false,
        },
        {
          source: '/test-journey',
          destination: '/404',
          permanent: false,
        },
        {
          source: '/test-onboarding',
          destination: '/404',
          permanent: false,
        },
        {
          source: '/test-conversation-memory',
          destination: '/404',
          permanent: false,
        },
        {
          source: '/test-feedback',
          destination: '/404',
          permanent: false,
        },
        {
          source: '/test-predictive-insights',
          destination: '/404',
          permanent: false,
        },
        {
          source: '/debug',
          destination: '/404',
          permanent: false,
        },
        {
          source: '/debug-env',
          destination: '/404',
          permanent: false,
        },
        {
          source: '/couples-demo',
          destination: '/404',
          permanent: false,
        },
        {
          source: '/intimacy-demo',
          destination: '/404',
          permanent: false,
        },
      ]
    }
    return []
  },
}

module.exports = nextConfig 