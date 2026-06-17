import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    // Output to dist/ — this is what Capacitor picks up
    outDir: 'dist',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      /**
       * Externalize packages that are native-only and are NOT available
       * in the browser bundle. @capgo/capacitor-llm's web.js references
       * these — they are only resolved at runtime via the Capacitor native
       * bridge on the device, never bundled into the web assets.
       */
      external: [
        '@mediapipe/tasks-genai',
        // Add others here if new native deps surface during build
      ],
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'recharts': ['recharts'],
          'konva': ['konva', 'react-konva'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
  // Required for Capacitor's native bridge to work
  define: {
    global: 'window',
  },
});
