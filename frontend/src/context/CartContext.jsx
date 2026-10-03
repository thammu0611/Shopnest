import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { cartApi } from '../api/endpoints.js'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)

const EMPTY_CART = { items: [], totalItems: 0, subtotal: 0, shipping: 0, total: 0 }

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState(EMPTY_CART)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(EMPTY_CART)
      return
    }
    setLoading(true)
    try {
      const { data } = await cartApi.get()
      setCart(data)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Every mutation returns the whole recalculated cart from the server,
  // so the UI never has to guess totals.
  const addItem = async (productId, quantity = 1) => {
    const { data } = await cartApi.add(productId, quantity)
    setCart(data)
    return data
  }

  const updateItem = async (cartItemId, quantity) => {
    const { data } = await cartApi.update(cartItemId, quantity)
    setCart(data)
    return data
  }

  const removeItem = async (cartItemId) => {
    const { data } = await cartApi.remove(cartItemId)
    setCart(data)
    return data
  }

  const clearCart = async () => {
    const { data } = await cartApi.clear()
    setCart(data)
    return data
  }

  const resetCart = () => setCart(EMPTY_CART)

  const value = useMemo(
    () => ({ cart, loading, refresh, addItem, updateItem, removeItem, clearCart, resetCart }),
    [cart, loading, refresh]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
