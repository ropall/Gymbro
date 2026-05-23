/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [react(), tailwindcss()],
    define: Object.fromEntries(
      Object.entries(env).map(([k, v]) => [`import.meta.env.${k}`, JSON.stringify(v)])
    ),
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
    },
  }
})
