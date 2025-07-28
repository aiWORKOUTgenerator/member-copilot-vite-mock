import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'src': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5177, // Prefer this port
    strictPort: false, // Allow fallback to different port if 5177 is busy
    host: true, // Allow external connections
    open: true, // Auto-open browser
    hmr: {
      overlay: false // Disable the error overlay
    }
  },
  optimizeDeps: {
    include: ['lucide-react'], // Pre-bundle lucide-react
    exclude: ['lucide-react/icons'] // Don't pre-bundle individual icons
  },
  define: {
    // Ensure process.env is available in the browser
    'process.env': process.env
  }
});
