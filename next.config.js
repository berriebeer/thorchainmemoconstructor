/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // This will completely ignore ESLint during builds
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 