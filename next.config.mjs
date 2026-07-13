/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/vault",
        destination: "/marketplace",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
