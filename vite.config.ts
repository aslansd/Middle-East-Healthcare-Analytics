import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  build: {
    target: 'es2022',
    sourcemap: false,
    // Split the vendor libraries out of the app bundle. Recharts and d3 are
    // by far the largest dependencies, and they change far less often than
    // application code, so isolating them makes repeat visits much cheaper.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          // Recharts pulls in d3; keep them together as the charting chunk.
          if (id.includes('recharts') || id.includes('/d3-') || id.includes('victory')) {
            return 'charts';
          }
          if (id.includes('framer-motion') || id.includes('/motion')) return 'motion';
          if (id.includes('lucide-react')) return 'icons';
          if (
            id.includes('/react-dom/') ||
            id.includes('/react/') ||
            id.includes('/scheduler/')
          ) {
            return 'react';
          }
          return 'vendor';
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },

  server: {
    port: 3000,
    host: '0.0.0.0',
    // AI Studio disables HMR via DISABLE_HMR to prevent flicker during edits.
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },

  preview: {
    port: 8080,
    host: '0.0.0.0',
  },
});
