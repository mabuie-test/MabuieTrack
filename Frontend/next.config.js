/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,  // substitui exportTrailingSlash
  env: {
    NEXT_PUBLIC_API: process.env.NEXT_PUBLIC_API || 'http://localhost:5000'
  }
};
