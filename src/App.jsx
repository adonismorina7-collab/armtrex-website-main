import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import { useT } from './i18n/ui.js'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Contact from './pages/Contact.jsx'
import Kyc from './pages/Kyc.jsx'
import ProductGate from './components/ProductGate.jsx'
import BackToTop from './components/BackToTop.jsx'
import useScrollReveal from './hooks/useScrollReveal.js'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  const t = useT()
  useScrollReveal(pathname)

  return (
    <>
      <ScrollToTop />
      <a href="#main" className="skip-link">
        {t('skipToContent')}
      </a>
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/products"
            element={
              <ProductGate>
                <Products />
              </ProductGate>
            }
          />
          <Route
            path="/products/:catId"
            element={
              <ProductGate>
                <Products />
              </ProductGate>
            }
          />
          <Route
            path="/products/:catId/:slug"
            element={
              <ProductGate>
                <ProductDetail />
              </ProductGate>
            }
          />
          <Route path="/kyc" element={<Kyc />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
