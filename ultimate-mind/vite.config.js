import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Use './' if you deploy the built app to a subfolder on GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: './',
});
