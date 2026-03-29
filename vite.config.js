import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import  netlify  from '@netlify/vite-plugin'

export default defineConfig({
  plugins: [
    react(),
    netlify(), // enables local emulation of Netlify functions via netlify dev
  ],
  build: {
    outDir: 'dist',
  },
})
