import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        sourcemap: true,
      },
      manifest: {
        name: 'fufood 食物管家',
        short_name: 'fufood',
        description: '就是庫存管理，只是聚焦在冰箱食物的管理',
        theme_color: '#ec5b4a',
        background_color: '#ffffff',
        start_url: '.',
        display: 'standalone',
        icons: [
          {
            src: './src/assets/logos/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: './src/assets/logos/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: './src/assets/logos/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: './src/assets/logos/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
