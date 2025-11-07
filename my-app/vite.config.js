import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'Public', // Ensure Public folder is served correctly
  build: {
    rollupOptions: {
      output: {
        // Ensure asset filenames don't cause issues
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
})
