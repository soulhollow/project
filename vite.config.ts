import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/rest/v1': {
        target: 'https://yawywplnwastaeyumubj.supabase.co',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/rest\/v1/, '/rest/v1')
      }
    }
  }
});