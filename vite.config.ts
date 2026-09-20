import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // So funcoes puras (offsets, segmentos, selecao): nao precisam de DOM.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
