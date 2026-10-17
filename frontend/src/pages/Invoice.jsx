import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { orderApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import { formatCurrency, formatDate } from '../utils/format.js'
import usePageTitle from '../utils/usePageTitle.js'
import Loader from '../components/Loader.jsx'
import Alert from '../components/Alert.jsx'
import { ArrowLeftIcon, PrinterIcon } from '../components/Icons.jsx'

/** A printable invoice. Print styles hide the site chrome around it. */
export default function Invoice() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  usePageTitle(order ? `Invoice ${order.orderNumber}` : 'Invoice')

  useEffect(() => {
    orderApi.get(id)
      .then(({ data }) => setOrder(data))
      .catch((err) => setError(apiMessage(err, 'Order not found')))
  }, [id])

  if (error) return <Alert type="error">{error}</Alert>
  if (!order) return <Loader label="Preparing your invoice…" />

  return (
    <div className="invoice-page">
      <div className="invoice-toolbar no-print">
        <Link to={`/orders/${order.id}`} className="back-link"><ArrowLeftIcon size={14} /> Back to order</Link>
        <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
          <PrinterIcon size={15} /> Print / save as PDF
        </button>
      </div>

      <article className="invoice">
        <header className="invoice-head">
          <div>
            <span className="brand-word">ShopNest</span>
            <p className="muted small">ShopNest Maison · Curated essentials</p>
          </div>
          <div className="invoice-meta">
            <h1>Invoice</h1>
            <dl>
              <dt>Invoice no.</dt><dd>INV-{order.orderNumber.replace(/^ORD-/, '')}</dd>
              <dt>Order no.</dt><dd>{order.orderNumber}</dd>
              <dt>Date</dt><dd>{formatDate(order.createdAt)}</dd>
              <dt>Payment</dt><dd>{order.paymentMethod} · {order.paymentStatus}</dd>
            </dl>
          </div>
        </header>

        <section className="invoice-parties">
          <div>
            <h4>Billed to</h4>
            <p>{order.customerName}<br />{order.customerEmail}</p>
          </div>
          <div>
            <h4>Shipped to</h4>
            <p>
              {order.shippingName}<br />
              {order.shippingAddress}<br />
              {order.shippingCity}{order.shippingState ? `, ${order.shippingState}` : ''} — {order.shippingPincode}<br />
              {order.shippingPhone}
            </p>
          </div>
        </section>

        <table className="invoice-table">
          <thead>
            <tr><th>#</th><th>Item</th><th>Unit price</th><th>Qty</th><th>Amount</th></tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={item.id}>
                <td>{i + 1}</td>
                <td>{item.productName}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-totals">
          <div className="summary-row"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          {Number(order.discount) > 0 && (
            <div className="summary-row"><span>Discount ({order.couponCode})</span><span>− {formatCurrency(order.discount)}</span></div>
          )}
          <div className="summary-row">
            <span>Delivery</span><span>{Number(order.shipping) > 0 ? formatCurrency(order.shipping) : formatCurrency(0)}</span>
          </div>
          <div className="summary-row total"><span>Grand total</span><span>{formatCurrency(order.totalAmount)}</span></div>
          <p className="muted small">All prices are inclusive of applicable taxes.</p>
        </div>

        <footer className="invoice-foot">
          {order.status === 'CANCELLED' && <p className="badge badge-cancelled">This order was cancelled</p>}
          <p className="muted small">Payment reference {order.paymentReference || '—'}. Thank you for shopping with ShopNest.</p>
        </footer>
      </article>
    </div>
  )
}
