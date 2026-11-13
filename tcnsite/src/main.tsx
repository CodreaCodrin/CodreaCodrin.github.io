import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './hooks/useTheme.tsx'
import { BackgroundProvider } from './context/BackgroundContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BackgroundProvider><App /></BackgroundProvider>
    </ThemeProvider>
  </StrictMode>,
)
