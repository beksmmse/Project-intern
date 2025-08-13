import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/cesium/Build/Cesium/Workers/*',
          dest: 'cesium/Workers'
        },
        {
          src: 'node_modules/cesium/Build/Cesium/ThirdParty/*',
          dest: 'cesium/ThirdParty'
        },
        {
          src: 'node_modules/cesium/Build/Cesium/Assets/*',
          dest: 'cesium/Assets'
        },
        {
          src: 'node_modules/cesium/Build/Cesium/Widgets/*',
          dest: 'cesium/Widgets'
        }
      ]
    })
  ],

  define: {
    CESIUM_BASE_URL: JSON.stringify('/cesium/')
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      cesium: 'cesium'
    }
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined 
      }
    }
  },
  server: {
    port: 5173,
    open: true
  }
})
