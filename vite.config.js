import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    port: parseInt(process.env.PORT || '5173'),
    strictPort: true
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'pluto-icon.png', 'og-image.jpg'],
      manifest: {
        name: 'Pluto',
        short_name: 'Pluto',
        description: 'Task management for busy people',
        theme_color: '#0a0a0f',
        background_color: '#0a0a0f',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/pluto-icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pluto-icon.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pluto-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ]
})
