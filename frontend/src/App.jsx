import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderSuccess from './pages/OrderSuccess.jsx'
import Orders from './pages/Orders.jsx'
import OrderDetail from './pages/OrderDetail.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Account from './pages/Account.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminProducts from './pages/AdminProducts.jsx'
import AdminOrders from './pages/AdminOrders.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/account" element={<Account />} />
            <Route path="/orders" element={<Orders />} />
            {/* success must be matched before the /orders/:id detail route */}
            <Route path="/orders/success/:id" element={<OrderSuccess />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
          </Route>

          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">
        ShopNest — Spring Boot · React · MySQL demo storefront
      </footer>
    </>
  )
}
