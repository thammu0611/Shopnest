import { Link } from 'react-router-dom'
import usePageTitle from '../utils/usePageTitle.js'
import { ReturnIcon, ShieldIcon, SparkleIcon, TruckIcon } from '../components/Icons.jsx'

/*
 * Static store pages. The policy text describes how this app actually
 * behaves (shipping threshold, cancellation, simulated payments) - edit it
 * to match your real business before going live.
 */

function InfoLayout({ eyebrow, title, intro, children }) {
  usePageTitle(title)
  return (
    <article className="info-page">
      <header className="info-head">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {intro && <p className="info-intro">{intro}</p>}
      </header>
      <div className="info-body">{children}</div>
    </article>
  )
}

const ABOUT_IMAGE = 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1100&q=80'

export function About() {
  usePageTitle('Our story')
  return (
    <div className="about-page">
      <section className="about-hero">
        <div>
          <span className="eyebrow">Our story</span>
          <h1>Fewer, better things.</h1>
          <p className="info-intro">
            ShopNest began with a simple idea: that the objects we use every day deserve
            the same care as the ones we save for special occasions. We keep the edit
            small, look for honest materials and good design, and let real buyers tell
            you what they think.
          </p>
          <Link to="/shop" className="btn btn-primary btn-lg">Explore the collection</Link>
        </div>
        <figure className="about-image"><img src={ABOUT_IMAGE} alt="" /></figure>
      </section>

      <section className="values">
        {[
          { icon: SparkleIcon, title: 'A considered edit', text: 'A small catalogue, chosen piece by piece rather than by the thousand.' },
          { icon: ShieldIcon, title: 'Honest reviews', text: 'Ratings come from signed-in customers, and verified purchases are marked as such.' },
          { icon: TruckIcon, title: 'Thoughtful delivery', text: 'Complimentary delivery above ₹2,000 and a flat ₹49 below it. No surprises at checkout.' },
          { icon: ReturnIcon, title: 'Freedom to change your mind', text: 'Cancel any order yourself until it ships — stock is released and payments refunded.' },
        ].map(({ icon: Icon, title, text }) => (
          <div className="value" key={title}>
            <Icon size={28} strokeWidth={1.2} />
            <h3>{title}</h3>
            <p className="muted">{text}</p>
          </div>
        ))}
      </section>
    </div>
  )
}

const FAQS = [
  {
    group: 'Orders',
    items: [
      ['How do I track my order?', <>Every order has its own page under <Link to="/orders">My orders</Link> with a live progress tracker: placed, confirmed, shipped and delivered.</>],
      ['Can I cancel an order?', 'Yes. Open the order and choose “Cancel order”. This is possible until the order has shipped. The items go back into stock and a card or UPI payment is refunded.'],
      ['Can I order the same things again?', 'Open any past order and press “Buy again” — everything still available goes straight back into your bag.'],
      ['Where is my invoice?', 'Each order page has an “Invoice” button. You can print it or save it as a PDF from your browser.'],
    ],
  },
  {
    group: 'Payment & offers',
    items: [
      ['Which payment methods do you accept?', 'Credit and debit cards, UPI and cash on delivery. In this demo store card and UPI payments are simulated and marked paid instantly.'],
      ['How do promo codes work?', <>Enter a code in your <Link to="/cart">shopping bag</Link>, or pick one from “offers available”. Some codes need a minimum order value and some can be used once per customer.</>],
      ['Are prices inclusive of tax?', 'Yes, all prices shown are inclusive of applicable taxes.'],
    ],
  },
  {
    group: 'Delivery',
    items: [
      ['How much is delivery?', 'Delivery is complimentary on orders of ₹2,000 or more. Below that a flat ₹49 delivery fee applies.'],
      ['Can I save my addresses?', <>Yes — tick “save this address” at checkout or manage them in <Link to="/account?tab=addresses">your address book</Link>.</>],
    ],
  },
  {
    group: 'Your account',
    items: [
      ['Do I need an account to shop?', 'You can browse without one, but you need to sign in to add to your bag, save a wishlist and check out.'],
      ['How do I change my password?', <>Go to <Link to="/account?tab=security">My account → Password</Link>.</>],
    ],
  },
]

export function Faq() {
  return (
    <InfoLayout
      eyebrow="Client services"
      title="Frequently asked questions"
      intro={<>Can’t find what you need? <Link to="/contact">Write to us</Link> and we will reply within one business day.</>}
    >
      {FAQS.map((g) => (
        <section key={g.group} className="faq-group">
          <h2>{g.group}</h2>
          {g.items.map(([q, a]) => (
            <details key={q} className="faq-item">
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </section>
      ))}
    </InfoLayout>
  )
}

export function ShippingReturns() {
  return (
    <InfoLayout eyebrow="Policies" title="Shipping & returns" intro="Everything you need to know about getting your order — and changing your mind.">
      <h2>Delivery charges</h2>
      <p>Delivery is complimentary on orders with a subtotal of ₹2,000 or more. Orders below that carry a flat delivery fee of ₹49, shown in your bag before you check out.</p>
      <h2>Order progress</h2>
      <p>Every order moves through four stages — placed, confirmed, shipped and delivered — and you can follow it from <Link to="/orders">My orders</Link>. Card and UPI orders are confirmed as soon as payment succeeds; cash-on-delivery orders are confirmed by our team.</p>
      <h2>Cancellations</h2>
      <p>You can cancel an order yourself at any time before it ships. Cancelled items are returned to stock straight away, and card or UPI payments are marked as refunded. Any promo code used on the order becomes available again.</p>
      <h2>Damaged or incorrect items</h2>
      <p>If something arrives damaged or is not what you ordered, <Link to="/contact">contact us</Link> with your order number within 7 days of delivery and we will put it right.</p>
    </InfoLayout>
  )
}

export function Privacy() {
  return (
    <InfoLayout eyebrow="Legal" title="Privacy policy" intro="What we collect, why, and how you stay in control.">
      <h2>What we store</h2>
      <p>Your name, email address and optional phone number; the delivery addresses you choose to save; your orders, reviews and wishlist; and, if you subscribe, your email address on our newsletter list.</p>
      <h2>How we use it</h2>
      <p>Only to run your account and deliver your orders, to show your reviews on product pages (with your name), and to send the newsletter you asked for.</p>
      <h2>Passwords and payments</h2>
      <p>Passwords are stored as one-way hashes and never in plain text. This store does not collect or store card or UPI details.</p>
      <h2>On this device</h2>
      <p>We keep your sign-in token and a short “recently viewed” list in your browser’s local storage. Clearing your browser data removes them.</p>
      <h2>Your choices</h2>
      <p>You can update your profile and addresses at any time from <Link to="/account">My account</Link>, and <Link to="/contact">contact us</Link> to have your account removed.</p>
    </InfoLayout>
  )
}

export function Terms() {
  return (
    <InfoLayout eyebrow="Legal" title="Terms of sale" intro="The short version: we describe products honestly, charge what we show, and let you cancel before dispatch.">
      <h2>Prices</h2>
      <p>Prices are in Indian rupees and include applicable taxes. Where an MRP is shown, the selling price is the amount you pay. Delivery charges, if any, are shown before you place your order.</p>
      <h2>Availability</h2>
      <p>Stock is reserved when your order is placed. If an item sells out while it sits in your bag, we will tell you at checkout.</p>
      <h2>Promo codes</h2>
      <p>Codes may have a minimum order value, a maximum discount, an expiry date or a limit of one use per customer. Only one code can be applied per order, and a code that no longer qualifies at checkout is not applied.</p>
      <h2>Cancellation</h2>
      <p>You may cancel any order before it ships, as described in our <Link to="/shipping-returns">shipping &amp; returns policy</Link>.</p>
    </InfoLayout>
  )
}
