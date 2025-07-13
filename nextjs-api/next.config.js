/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    MYSQL_HOST: process.env.MYSQL_HOST || 'localhost',
    MYSQL_PORT: process.env.MYSQL_PORT || '8889',
    MYSQL_USER: process.env.MYSQL_USER || 'root',
    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || 'root',
    MYSQL_DATABASE: process.env.MYSQL_DATABASE || 'portfolio',
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
  }
}

module.exports = nextConfig 