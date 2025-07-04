/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,           // usa o SWC para minificação mais rápida
  experimental: {
    workerThreads: true,     // paraleliza build
    cpus: 4
  },
  // mantém o cache entre builds no Render
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
