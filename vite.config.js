import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/AI-Kitchen-Equipment-Finder/' // <-- important for GitHub Pages
});
