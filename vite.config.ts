/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // api/client.ts가 import 시점에 이 값을 요구한다. 테스트는 실제로 요청하지 않는다
    env: { VITE_API_BASE_URL: 'http://localhost/api/v1' },
  },
})
