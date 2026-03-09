import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/blog/we-tested-50-uk-ifa-firms-on-chatgpt-only-3-were-recommended',
        destination: '/blog/we-tested-149-uk-ifa-firms-on-chatgpt-79-percent-were-invisible',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
