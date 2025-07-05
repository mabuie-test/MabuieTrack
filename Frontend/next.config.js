/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API: process.env.NEXT_PUBLIC_API || 'http://localhost:5000'
  }
};
