// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://betapixels.studio',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
  prefetch: false,
  integrations: [
    sitemap({
      filter: (page) => !/\/(404|thank-you|links)\//.test(page),
    }),
  ],
  image: {
    responsiveStyles: false,
  },
  vite: {
    build: {
      sourcemap: false,
      rolldownOptions: {
        output: {
          minify: { compress: { dropConsole: true, dropDebugger: true }, mangle: true },
          comments: false,
        },
      },
    },
  },
});
