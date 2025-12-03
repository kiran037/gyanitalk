/** @type {import("next").NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [

      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**"
      },

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
      }
    ]
  }
};

export default nextConfig;
