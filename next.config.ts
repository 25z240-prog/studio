
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
        protocol: 'https' as const,
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https" as const,
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https" as const,
        hostname: "encrypted-tbn0.gstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https" as const,
        hostname: "chakriskitchen.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https" as const,
        hostname: "www.flavourstreat.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https" as const,
        hostname: "shop.sresthproducts.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https" as const,
        hostname: "i0.wp.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https" as const,
        hostname: "www.subbuskitchen.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https" as const,
        hostname: "www.vegrecipesofindia.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https" as const,
        hostname: "www.yummytummyaarthi.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https" as const,
        hostname: "www.indianhealthyrecipes.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https" as const,
        hostname: "www.google.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https" as const,
        hostname: "www.eggoz.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https" as const,
        hostname: "drive.google.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
