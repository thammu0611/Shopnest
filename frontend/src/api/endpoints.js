import api from './client.js'

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me'),
}

export const productApi = {
  list: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  related: (id, limit = 4) => api.get(`/products/${id}/related`, { params: { limit } }),
  facets: () => api.get('/products/facets'),
  create: (payload) => api.post('/products', payload),
  update: (id, payload) => api.put(`/products/${id}`, payload),
  remove: (id) => api.delete(`/products/${id}`),
  adminList: () => api.get('/admin/products'),
}

export const categoryApi = {
  list: () => api.get('/categories'),
  create: (payload) => api.post('/categories', payload),
  update: (id, payload) => api.put(`/categories/${id}`, payload),
  remove: (id) => api.delete(`/categories/${id}`),
}

export const cartApi = {
  get: () => api.get('/cart'),
  add: (productId, quantity) => api.post('/cart/items', { productId, quantity }),
  update: (cartItemId, quantity) => api.put(`/cart/items/${cartItemId}`, { quantity }),
  remove: (cartItemId) => api.delete(`/cart/items/${cartItemId}`),
  clear: () => api.delete('/cart'),
  applyCoupon: (code) => api.post('/cart/coupon', { code }),
  removeCoupon: () => api.delete('/cart/coupon'),
}

export const orderApi = {
  checkout: (payload) => api.post('/orders/checkout', payload),
  mine: () => api.get('/orders'),
  get: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  all: () => api.get('/admin/orders'),
  updateStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
}

export const wishlistApi = {
  get: () => api.get('/wishlist'),
  ids: () => api.get('/wishlist/ids'),
  add: (productId) => api.post('/wishlist', { productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
  moveToCart: (productId) => api.post(`/wishlist/${productId}/move-to-cart`),
}

export const reviewApi = {
  // Public - returns the list, the average, the histogram and (when signed
  // in) the caller's own review, all in one response.
  summary: (productId) => api.get(`/products/${productId}/reviews`),
  submit: (productId, payload) => api.post(`/products/${productId}/reviews`, payload),
  removeMine: (productId) => api.delete(`/products/${productId}/reviews/mine`),
}

export const accountApi = {
  get: () => api.get('/account'),
  update: (payload) => api.put('/account', payload),
  changePassword: (payload) => api.put('/account/password', payload),
}

export const addressApi = {
  list: () => api.get('/account/addresses'),
  create: (payload) => api.post('/account/addresses', payload),
  update: (id, payload) => api.put(`/account/addresses/${id}`, payload),
  makeDefault: (id) => api.put(`/account/addresses/${id}/default`),
  remove: (id) => api.delete(`/account/addresses/${id}`),
}

export const storeApi = {
  // Public
  offers: () => api.get('/coupons/offers'),
  subscribe: (email) => api.post('/newsletter', { email }),
  contact: (payload) => api.post('/contact', payload),
}

export const adminApi = {
  coupons: () => api.get('/admin/coupons'),
  createCoupon: (payload) => api.post('/admin/coupons', payload),
  updateCoupon: (id, payload) => api.put(`/admin/coupons/${id}`, payload),
  removeCoupon: (id) => api.delete(`/admin/coupons/${id}`),
  customers: () => api.get('/admin/customers'),
  subscribers: () => api.get('/admin/subscribers'),
  messages: () => api.get('/admin/messages'),
  setMessageResolved: (id, resolved) => api.put(`/admin/messages/${id}`, { resolved }),
}

export const dashboardApi = {
  get: () => api.get('/admin/dashboard'),
}
