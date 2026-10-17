import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

/**
 * Shared "add to bag" behaviour: guests go to sign in (and come back here),
 * signed-in shoppers get a toast or an error message.
 */
export default function useAddToCart() {
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [addingId, setAddingId] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const add = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname + location.search } })
      return false
    }
    setAddingId(product.id)
    setError('')
    try {
      await addItem(product.id, quantity)
      setNotice(`${quantity > 1 ? `${quantity} × ` : ''}${product.name} added to your bag`)
      return true
    } catch (err) {
      setError(apiMessage(err, 'Could not add that item'))
      return false
    } finally {
      setAddingId(null)
    }
  }

  return { add, addingId, notice, setNotice, error, setError }
}
