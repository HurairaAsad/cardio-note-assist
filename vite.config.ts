import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { componentTagger } from 'lovable-tagger'

// Root deploy: no `base` needed
export default defineConfig(({ mode }) => ({
  server: { host: '::', port: 8080 }, // dev only
  plugins: [react(), mode === 'development' && componentTagger()].filter(Boolean),
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
}))
