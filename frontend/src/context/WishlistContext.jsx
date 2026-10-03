import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { wishlistApi } from '../api/endpoints.js'
import { useAuth } from './AuthContext.jsx'

const WishlistContext = createContext(null)

/**
 * Holds the saved-product ids so every product card can paint its heart
 * without each one making its own request. The full wishlist page fetches
 * the detailed rows separately.
 */
export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [ids, setIds] = useState([])
  const [busyId, setBusyId] = useState(null)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setIds([])
      return
    }
    try {
      const { data } = await wishlistApi.ids()
      setIds(data)
    } catch {
      setIds([])
    }
  }, [isAuthenticated])

  useEffect(() => {
    refresh()
  }, [refresh])

  const has = useCallback((productId) => ids.includes(Number(productId)), [ids])

  /** Returns true if the product ended up saved, false if it was removed. */
  const toggle = useCallback(
    async (productId) => {
      const id = Number(productId)
      const saved = ids.includes(id)
      setBusyId(id)
      try {
        const { data } = saved ? await wishlistApi.remove(id) : await wishlistApi.add(id)
        setIds(data.items.map((i) => i.productId))
        return !saved
      } finally {
        setBusyId(null)
      }
    },
    [ids]
  )

  const removeItem = useCallback(async (productId) => {
    const { data } = await wishlistApi.remove(Number(productId))
    setIds(data.items.map((i) => i.productId))
    return data
  }, [])

  const moveToCart = useCallback(async (productId) => {
    const { data } = await wishlistApi.moveToCart(Number(productId))
    setIds((prev) => prev.filter((i) => i !== Number(productId)))
    return data
  }, [])

  const resetWishlist = useCallback(() => setIds([]), [])

  const value = useMemo(
    () => ({ ids, count: ids.length, busyId, has, toggle, removeItem, moveToCart, refresh, resetWishlist }),
    [ids, busyId, has, toggle, removeItem, moveToCart, refresh, resetWishlist]
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>')
  return ctx
}
