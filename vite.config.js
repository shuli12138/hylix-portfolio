import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const offline = mode === 'offline'
  const githubPages = mode === 'github-pages'
  const base = offline
    ? './'
    : githubPages
      ? process.env.VITE_GITHUB_PAGES_BASE || '/'
      : '/'

  return {
    base,
    publicDir: githubPages ? false : 'public',
    plugins: [
      {
        name: 'portable-offline-assets',
        enforce: 'pre',
        transform(code, id) {
          if ((!offline && !githubPages) || !id.replaceAll('\\', '/').includes('/src/')) return null

          const mediaBase = offline
            ? './media/'
            : githubPages
              ? process.env.VITE_GITHUB_PAGES_MEDIA_BASE || `${base}media/`
              : '/media/'
          const transformed = code.replaceAll('/media/', mediaBase)
          return offline ? transformed.replace(/\.webm(?=['"`])/g, '.mp4') : transformed
        },
      },
      react(),
    ],
    define: {
      __PORTABLE_OFFLINE__: JSON.stringify(offline),
      __GITHUB_PAGES__: JSON.stringify(githubPages),
    },
    build: offline
      ? {
          outDir: 'dist-offline',
          emptyOutDir: true,
          modulePreload: { polyfill: false },
          rollupOptions: {
            output: {
              format: 'iife',
            },
          },
        }
      : undefined,
  }
})
