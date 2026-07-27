/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/experience", destination: "/work", permanent: true },
      { source: "/education", destination: "/", permanent: true },
      { source: "/summary", destination: "/", permanent: true },
      { source: "/skills", destination: "/", permanent: true },
    ]
  },
}

export default nextConfig
