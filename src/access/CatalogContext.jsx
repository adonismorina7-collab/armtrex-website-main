import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'

// Product data never ships in the client bundle. A visitor arrives with
// ?access=<token> in the URL (the link Armtrex staff send after KYC/security
// clearance). We verify it against /api/access/verify, and only then fetch
// the real catalogue from /api/products — both calls hit the Worker, never
// the static bundle. The token itself is the credential (like any magic
// link), so it's fine to keep in sessionStorage for the rest of the tab's
// life; it's cleared on tab close and is time-limited server-side regardless.

const STORAGE_KEY = 'armtrex-access-token'

const CatalogContext = createContext({
  status: 'checking', // 'checking' | 'denied' | 'granted' | 'error'
  products: [],
  expiresAt: null,
  requestAccess: () => {},
})

export function CatalogProvider({ children }) {
  const [status, setStatus] = useState('checking')
  const [products, setProducts] = useState([])
  const [expiresAt, setExpiresAt] = useState(null)

  const verifyAndLoad = useCallback(async (token) => {
    if (!token) {
      setStatus('denied')
      return
    }
    try {
      const verifyRes = await fetch(`/api/access/verify?token=${encodeURIComponent(token)}`)
      if (!verifyRes.ok) {
        sessionStorage.removeItem(STORAGE_KEY)
        setStatus('denied')
        return
      }
      const verifyData = await verifyRes.json()
      if (!verifyData.ok) {
        sessionStorage.removeItem(STORAGE_KEY)
        setStatus('denied')
        return
      }

      const catalogRes = await fetch(`/api/products?token=${encodeURIComponent(token)}`)
      if (!catalogRes.ok) {
        setStatus('error')
        return
      }
      const catalogData = await catalogRes.json()

      sessionStorage.setItem(STORAGE_KEY, token)
      setProducts(catalogData.products || [])
      setExpiresAt(verifyData.expiresAt || null)
      setStatus('granted')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    const url = new URL(window.location.href)
    const urlToken = url.searchParams.get('access')

    if (urlToken) {
      // Strip the token from the visible URL/history/referrer once read.
      url.searchParams.delete('access')
      window.history.replaceState({}, '', url.pathname + url.search + url.hash)
      verifyAndLoad(urlToken)
      return
    }

    const stored = sessionStorage.getItem(STORAGE_KEY)
    verifyAndLoad(stored)
  }, [verifyAndLoad])

  const requestAccess = useCallback((token) => verifyAndLoad(token), [verifyAndLoad])

  const value = useMemo(
    () => ({ status, products, expiresAt, requestAccess }),
    [status, products, expiresAt, requestAccess],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  return useContext(CatalogContext)
}
