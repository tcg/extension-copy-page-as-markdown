import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        background: 'src/background.ts',
        content: 'src/content.ts',
        popup: 'src/popup.ts'
      },
      output: [ // Keeping the array structure for consistency with previous state
        {
          entryFileNames: '[name].js',       // e.g., dist/background.js
          assetFileNames: '[name][extname]',
          format: 'es',                      // <<< CHANGED FROM 'iife' TO 'es'
          dir: 'dist',                       // Vite's build.outDir ('dist') takes precedence
          manualChunks: undefined,
          inlineDynamicImports: false,       // Keep this from the previous fix. While 'es' handles dynamic imports
                                             // by creating chunks, this flag might still influence Rollup's behavior.
        }
      ]
      // Note: For 'es' format with multiple inputs, a more common Rollup output config is a single object:
      /*
      output: {
        dir: 'dist', // Not strictly needed as Vite's build.outDir is used
        entryFileNames: '[name].js', // Or 'js/[name].js' if you want them in a subfolder
        chunkFileNames: 'chunks/[name]-[hash].js', // To handle any created chunks
        assetFileNames: 'assets/[name]-[hash][extname]',
        format: 'es',
      }
      */
      // For now, the minimal change above (just format: 'es') is fine to test.
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  publicDir: 'public',
})