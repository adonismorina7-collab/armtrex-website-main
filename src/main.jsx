import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import { CatalogProvider } from './access/CatalogContext.jsx'
import { installContentProtection } from './utils/contentProtection.js'
import './index.css'

installContentProtection()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <CatalogProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
        </BrowserRouter>
      </CatalogProvider>
    </LanguageProvider>
  </React.StrictMode>,
)
