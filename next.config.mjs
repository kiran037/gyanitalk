/** @type {import("next").NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gyanitalk.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "gyanitalk.s3.ap-south-1.amazonaws.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "pub-b7fd9c30cdbf439183b75041f5f71b92.r2.dev",
        pathname: "/**"
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "app.gyanitalk.com",
        pathname: "/**",
      },
    ]
  },

  // --- 1. MASK S3 BUCKET (The Security Fix) ---
  async rewrites() {
    return [
      {
        // When user visits: /assets/public/storage/images/image.png
        source: '/assets/:path*',
        // Next.js fetches: https://gyanitalk.s3.../public/storage/images/image.png
        destination: 'https://gyanitalk.s3.ap-south-1.amazonaws.com/:path*',
      },
    ];
  },

  // --- 2. EXISTING REDIRECTS ---
  async redirects() {
    return [
      // Static page redirects
      {
        source: "/landing/about-us",
        destination: "/about-us",
        permanent: true,
      },
      {
        source: "/landing/terms-of-service",
        destination: "/terms-of-service",
        permanent: true,
      },
      {
        source: "/landing/privacy-policy",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/landing/contact",
        destination: "/contact",
        permanent: true,
      },
      
      // Dynamic route redirects
      {
        source: "/landing/blog/:path*",
        destination: "/blog/:path*",
        permanent: true,
      },
      {
        source: "/landing/astro/:path*",
        destination: "/talk-to-astrologers/:path*",
        permanent: true,
      },
      {
        source: "/landing/mall/:path*",
        destination: "/mall/:path*",
        permanent: true,
      },
      {
        source: "/landing/courses/:path*",
        destination: "/courses/:path*",
        permanent: true,
      },
      {
        source: "/landing/horoscope/:path*",
        destination: "/horoscope/:path*",
        permanent: true,
      },
      {
        source: "/landing/panchang/:path*",
        destination: "/panchang/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;