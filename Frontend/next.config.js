/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  // Garante que cada rota gera um HTML estático standalone
  exportTrailingSlash: true,
  env: {
    NEXT_PUBLIC_API: process.env.NEXT_PUBLIC_API || 'http://localhost:5000'
  }
};
