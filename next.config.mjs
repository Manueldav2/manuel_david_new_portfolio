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
  // The /3 playground loads @dimforge/rapier3d, which ships its 1.4 MB engine
  // as a real .wasm file instead of a base64 string. That needs webpack's
  // async WebAssembly support; without it the module cannot be bundled at all.
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true }
    return config
  },
  async redirects() {
    return [
      { source: "/1", destination: "/", permanent: true },
      { source: "/experience", destination: "/work", permanent: true },
      { source: "/education", destination: "/", permanent: true },
      { source: "/summary", destination: "/", permanent: true },
      { source: "/skills", destination: "/", permanent: true },
    ]
  },
}

export default nextConfig
