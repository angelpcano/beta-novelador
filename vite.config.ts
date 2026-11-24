import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isUserPage = repository?.endsWith('.github.io') ?? false;
const supabaseConfigured = Boolean(
  process.env.VITE_SUPABASE_URL &&
  process.env.VITE_SUPABASE_ANON_KEY,
);
const base = process.env.GITHUB_ACTIONS === 'true' && repository && !isUserPage
  ? `/${repository}/`
  : '/';

export default defineConfig({
  base,
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (supabaseConfigured && id.includes('/node_modules/@supabase/')) return 'supabase';
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [],
      manifest: {
        name: 'BETA-Novelador',
        short_name: 'BETA-Novelador',
        description: 'Tu espacio personal para escribir novelas',
        theme_color: '#eeeae1',
        background_color: '#eeeae1',
        display: 'standalone',
        start_url: base,
        scope: base,
        lang: 'es',
        icons: [],
      },
    }),
  ],
});
