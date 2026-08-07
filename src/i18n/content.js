// English-only content accessors for the Armtrex website.
// The product catalogue remains gated and is loaded only after a verified
// KYC access link is accepted by the Worker.

import { categories as categoriesEn, heroTeasers } from '../data/products.js'
import { company as companyEn } from '../data/company.js'
import { useCatalog } from '../access/CatalogContext.jsx'

export function getCategories() {
  return categoriesEn
}

export function getCompany() {
  return companyEn
}

export { heroTeasers }

export function useCompany() {
  return companyEn
}

export function useCategories() {
  return categoriesEn
}

export function useProducts() {
  const { products } = useCatalog()
  return products
}
