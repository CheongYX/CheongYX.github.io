import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/cyx-portfolio/', // ✨ 告诉 Vite 我们现在住在子目录里
  plugins: [react()],
})