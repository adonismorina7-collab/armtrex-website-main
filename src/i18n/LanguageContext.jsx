import { createContext, useContext } from 'react'

const LanguageContext = createContext({ lang: 'en' })

export function LanguageProvider({ children }) {
  return (
    <LanguageContext.Provider value={{ lang: 'en' }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
