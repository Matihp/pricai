// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: true
    }
  },
  output: 'server',
  vite: {
    plugins: [tailwindcss(),TanStackRouterVite()]
  }
});