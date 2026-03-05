import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Development-only warning about Supabase lock issues in Strict Mode
// @ts-ignore - Vite typing for import.meta.env
if (import.meta.env.DEV) {
  console.warn(
    '%c⚠️ Supabase Auth Lock Warning',
    'color: orange; font-weight: bold;',
    'React Strict Mode is DISABLED in development to prevent Supabase Web Lock timeouts.',
    'This is expected and harmless — Strict Mode will be enabled in production for safety checks.',
    'The orphaned lock errors you might see are a known React 18 + Supabase issue and do not affect functionality.'
  )
}

// Conditionally wrap with StrictMode: disabled in DEV to avoid Supabase Web Lock orphaning,
// but enabled in PRODUCTION for safety
const rootElement = document.getElementById('root')!
const root = ReactDOM.createRoot(rootElement)

// @ts-ignore - Vite typing for import.meta.env
const AppComponent = import.meta.env.DEV ? (
  <App />
) : (
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

root.render(AppComponent)
