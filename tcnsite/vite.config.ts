import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import site from './data/site.json'
import themes from './data/themes.json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'json-page-title',
      transformIndexHtml(html) {
        const title = site.documentTitle.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)
        const initial = themes.themes[themes.defaultTheme as keyof typeof themes.themes]
        const variables = Object.entries(initial.colors).map(([key, value]) => `${key}:${value}`).join(';')
        const settings = JSON.stringify({ palettes: themes.themes, key: themes.storageKey, fallback: themes.defaultTheme }).replaceAll('<', '\\u003c')
        // Apply the saved palette before the first paint; blocked storage uses the JSON default.
        const bootstrap = `<style>:root{${variables};color-scheme:${initial.colorScheme};background:var(--color-bg);color:var(--color-text)}</style><script>(()=>{try{const c=${settings};const k=localStorage.getItem(c.key);const t=c.palettes[k&&Object.hasOwn(c.palettes,k)?k:c.fallback];for(const [key,value]of Object.entries(t.colors))document.documentElement.style.setProperty(key,value);document.documentElement.style.colorScheme=t.colorScheme}catch{}})()</script>`
        return html.replace('__DOCUMENT_TITLE__', title).replace('__THEME_BOOTSTRAP__', bootstrap)
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
