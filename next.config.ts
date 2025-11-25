import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "chakriskitchen.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.flavourstreat.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "shop.sresthproducts.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i0.wp.com",
        port: "",
        pathname: "/**",
      }
    ],
  },
};

export default nextConfig;
