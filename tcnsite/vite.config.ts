import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import site from './data/site.json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'json-page-title',
      transformIndexHtml(html) {
        const title = site.documentTitle.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)
        return html.replace('__DOCUMENT_TITLE__', title)
      },
    },
    tailwindcss(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
})
