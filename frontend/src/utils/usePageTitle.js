import { useEffect } from 'react'

const BRAND = 'ShopNest'

/** Sets the browser tab title for the current page. */
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${BRAND}` : `${BRAND} — Curated Essentials`
  }, [title])
}
