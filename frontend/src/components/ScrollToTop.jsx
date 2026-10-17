import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** New page, new scroll position - unless the link targets an anchor. */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])
  return null
}
