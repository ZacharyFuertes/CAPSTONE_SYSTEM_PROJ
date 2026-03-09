/// <reference types="vite/client" />
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'

// Dev-only warning about Supabase Strict Mode lock issue
if (import.meta.env.DEV) {
  console.warn(
    '%c⚠️ Supabase Auth Lock Warning',
    'color: orange; font-weight: bold;',
    'React Strict Mode is DISABLED in development to prevent Supabase Web Lock timeouts.',
    'This is expected and harmless — Strict Mode is enabled in production.'
  )
}

// Get root element safely
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found. Make sure <div id="root"></div> exists in index.html')
}

// Create root
const root = ReactDOM.createRoot(rootElement)

// Render conditionally: no StrictMode in DEV, keep it in production
root.render(
  import.meta.env.DEV ? (
    <>
      <LanguageProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LanguageProvider>
    </>
  ) : (
    <React.StrictMode>
      <LanguageProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LanguageProvider>
    </React.StrictMode>
  )
)