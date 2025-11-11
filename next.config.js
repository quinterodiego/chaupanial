/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
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
  // Usar output standalone para evitar problemas con build traces
  output: 'standalone',
  // Excluir node_modules del análisis de build traces para evitar stack overflow
  outputFileTracingExcludes: {
    '*': [
      'node_modules/**/*',
    ],
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