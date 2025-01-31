import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 5173, // Explicitly set the port
    proxy: {
      '/api': {
        target: 'https://goapi.nuritas.tr',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  },
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

