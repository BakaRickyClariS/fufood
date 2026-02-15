import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      devOptions: { enabled: true, type: 'module' },
      injectRegister: 'auto',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,svg}'],
        globIgnores: ['**/assets/images/group/**'], // Exclude large group images from precache
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
            },
          },
        ],
      },
      manifest: {
        name: 'fufood 食物管家',
        short_name: 'fufood',
        description: '輕鬆管理冰箱食材，追蹤到期並接收通知',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        start_url: '.',
        display: 'standalone',
        icons: [
          {
            src: './logos/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: './logos/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: './logos/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: './logos/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          'vendor-firebase': ['firebase/app', 'firebase/messaging'],
          // gsap 不放入此 chunk，因為 SplashScreen 需要同步載入以確保啟動動畫流暢
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            'sonner',
            'lucide-react',
          ],
        },
      },
    },
    target: 'es2015',
    minify: 'esbuild',
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/modules': path.resolve(__dirname, './src/modules'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/lib': path.resolve(__dirname, './src/lib'),
    },
  },
});
