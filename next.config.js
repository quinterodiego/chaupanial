/** @type {import('next').NextConfig} */
// Deshabilitar PWA durante el build en Vercel para evitar stack overflow
// El PWA se generará en runtime si es necesario
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development' || process.env.VERCEL === '1',
  buildExcludes: [/app-manifest\.json$/],
  exclude: [
    // Excluir archivos que causan problemas en build traces
    ({ asset }) => {
      if (asset.name.includes('workbox') || asset.name.includes('sw.js')) {
        return true
      }
      return false
    },
  ],
})

const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com']
  },
  // Deshabilitar build traces para evitar stack overflow
  experimental: {
    webpackBuildWorker: false,
  },
  // Configuración de webpack para evitar problemas
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    // Ignorar ciertos módulos en el análisis de dependencias
    config.ignoreWarnings = [
      { module: /node_modules/ },
    ]
    return config
  },
}

module.exports = withPWA(nextConfig)