import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// For GitHub Pages, relative base works regardless of repo name.
// Override with VITE_BASE if you deploy to a custom domain or subpath.
export default defineConfig({
  base: process.env.VITE_BASE || './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
