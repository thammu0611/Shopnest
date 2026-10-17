/**
 * "Recently viewed" lives in this browser only. Each entry is a small product
 * snapshot so the rail can render without another request.
 */
const KEY = 'shopnest_recently_viewed'
const LIMIT = 8

export function readRecentlyViewed() {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function rememberProduct(product) {
  if (!product?.id) return
  const snapshot = {
    id: product.id,
    name: product.name,
    price: product.price,
    mrp: product.mrp,
    discountPercent: product.discountPercent,
    imageUrl: product.imageUrl,
    categoryName: product.categoryName,
    averageRating: product.averageRating,
    reviewCount: product.reviewCount,
    stock: product.stock,
  }
  try {
    const next = [snapshot, ...readRecentlyViewed().filter((p) => p.id !== product.id)].slice(0, LIMIT)
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* storage can be full or disabled - recently viewed is a nicety */
  }
}
