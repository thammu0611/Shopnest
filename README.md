# ShopNest — Full Stack E-Commerce Application

**Spring Boot (REST API) · React (Vite) · MySQL**

A complete e-commerce platform: JWT authentication, admin product management,
shopping cart, checkout with a simulated payment step, and order tracking —
all persisted in MySQL.

**Shopper:** browse and search · star ratings on every product · wishlist ·
cart · checkout · order history with a status timeline · cancel an order before
it ships · write and edit reviews · self-service account page.

**Admin:** analytics dashboard (revenue, orders by status, best sellers, low
stock) · product management · move orders through the pipeline.

---

## 1. What's inside

```
shopnest/
├── backend/          Spring Boot 3.3.5 REST API (Java 17+, Maven)
│   └── src/main/java/com/shopnest/ecommerce/
│       ├── config/       SecurityConfig (JWT + CORS), DataSeeder
│       ├── controller/   Auth, Product, Category, Cart, Order, Address, Support, Admin
│       ├── dto/          Request/response records (never expose entities)
│       ├── entity/       User, Category, Product, CartItem, Order, OrderItem, Review,
│       │                 WishlistItem, Coupon, Address, ContactMessage, NewsletterSubscriber
│       ├── exception/    Custom exceptions + @RestControllerAdvice
│       ├── repository/   Spring Data JPA repositories
│       ├── security/     JwtService, JwtAuthenticationFilter, UserDetailsService
│       └── service/      Business logic (Auth, Product, Cart, Coupon, Order, Address, ...)
├── frontend/         React 18 + Vite + React Router + Axios
│   └── src/
│       ├── api/          Axios instance, interceptors, endpoint map
│       ├── components/   Navbar, Footer, SearchOverlay, ProductCard, ProductRail,
│       │                 PriceTag, AddressBook, Newsletter, Toast, ProtectedRoute, ...
│       ├── context/      AuthContext, CartContext
│       ├── pages/        Home, Shop, ProductDetail, Login, Register, Cart, Checkout,
│       │                 OrderSuccess, Orders, OrderDetail, Invoice, Wishlist, Account,
│       │                 Contact, InfoPages (About/FAQ/Shipping/Privacy/Terms),
│       │                 Admin: Dashboard, Products, Orders, Categories, Coupons,
│       │                 Customers, Messages · NotFound
│       └── styles/       Single hand-written stylesheet (no UI framework)
├── database/
│   ├── schema.sql        Reference DDL (documentation / viva)
│   └── seed-extra.sql    Optional extra demo rows
└── api-tests.http        50 ready-to-run API calls (VS Code REST Client / IntelliJ)
```

---

## 2. Prerequisites

| Tool | Version | Check with |
|---|---|---|
| JDK | 17 or newer | `java -version` |
| Maven | 3.8+ (or use your IDE's bundled one) | `mvn -version` |
| Node.js | 18 or newer | `node -v` |
| MySQL | 8.x, running on port 3306 | `mysql --version` |

---

## 2b. Quick start on this machine (already set up)

Everything below has been installed and verified locally, so you can skip
section 3 unless you want to run the steps by hand.

**Run it:**

| What | How |
|---|---|
| Start everything (MySQL) | double-click **`Start ShopNest.bat`** |
| Start everything (no database setup) | double-click **`Start ShopNest (H2 - no database setup).bat`** |
| Set your MySQL password | double-click **`Set MySQL Password.bat`** (masked prompt, tests the connection, saves it) |
| Stop everything | `powershell -File stop-shopnest.ps1`, or close the two ShopNest windows |

The launcher builds the backend if needed, starts the API, waits for it to
respond, starts the React dev server, and opens the browser.

**URLs:** UI <http://localhost:5180> · API <http://localhost:8080/api>

### What was changed to make it run here

| Change | Why |
|---|---|
| Installed Maven 3.9.9 to `%USERPROFILE%	oolspache-maven-3.9.9` and added it (plus MySQL's `bin`) to the user PATH | Neither `mvn` nor `mysql` was on PATH |
| `pom.xml`: pinned `lombok.version` to 1.18.36 | The Boot 3.3.5 default (1.18.34) cannot parse JDK 23 |
| `pom.xml`: declared Lombok in `maven-compiler-plugin` → `annotationProcessorPaths` | JDK 23 no longer auto-discovers annotation processors from the classpath, so Lombok silently generated nothing and every getter/builder failed to compile |
| `application.properties`: datasource now reads `${DB_HOST}`, `${DB_PORT}`, `${DB_NAME}`, `${DB_USERNAME}`, `${DB_PASSWORD}` (same defaults as before) | Keeps your real MySQL password out of the repo |
| `vite.config.js`: port pinned to **5180** with `strictPort` | Port 5173 is permanently taken by another local project, so Vite kept drifting to 5174 and falling outside the CORS allowlist |
| Added `frontend/.env` with `VITE_API_BASE_URL=/api` | Routes API calls through Vite's dev proxy, so the browser never makes a cross-origin request — CORS can no longer break the app on any port |
| `application.properties`: added ports 5180 and 5174 to `app.cors.allowed-origins` | Safety net if you switch back to an absolute API URL |

### Visual design

The storefront uses a boutique, editorial design system. All of it lives in
`frontend/src/styles/index.css`.

| | |
|---|---|
| Palette | Ivory paper (`#f8f5ef`) and ink, with an antique-bronze accent (`#9c7a4a`) |
| Type | **Cormorant Garamond** for headings and product names, **Jost** for UI text (loaded in `index.html`) |
| Dark mode | Full second palette via `prefers-color-scheme`, so it follows your OS automatically |
| Layout | Announcement bar, centred wordmark, slide-out mobile menu, sticky header, full footer |
| Motion | Entrance transitions and image zooms, all disabled under `prefers-reduced-motion` |

Everything is driven by CSS custom properties on `:root` — change `--accent`
in one place and the whole storefront follows.

### Store features

| Area | What you get |
|---|---|
| Home | Hero, category tiles, "The Edit" (featured), sale banner, new arrivals, best sellers, recently viewed, newsletter sign-up |
| Shop (`/shop`) | Filters for category, price range, brand, rating, in-stock and on-sale; sort by newest / best selling / price / name; filter chips; every filter lives in the URL; mobile filter drawer |
| Search | Header search with live product suggestions |
| Product page | Image gallery, MRP with % off, stock status, quantity, add to bag / buy now, wishlist, share, description / details / delivery tabs, reviews, related products, recently viewed |
| Bag | Promo codes plus "offers available", free-delivery progress meter, save for later (moves to wishlist), savings summary |
| Checkout | Saved-address picker, new address with "save to my account", card / UPI / COD (simulated) |
| Orders | Progress tracker, price breakdown with discount, printable invoice, buy again, self-service cancellation |
| Account | Overview, profile, address book (default address, edit, delete), password |
| Pages | Our story, contact form, FAQ, shipping & returns, privacy policy, terms of sale |
| Admin ("Atelier") | Dashboard, products (brand, MRP, featured, gallery), orders, categories, coupons, customers & subscribers, contact inbox |

The policy pages describe how this app actually behaves (₹2,000 free-delivery
threshold, cancellation before dispatch, simulated payments). Edit them to
match your real business before going live.

### Database

MySQL 9.6 is installed and running as service `MySQL96`, but its `root`
password is not the `root` default this project assumed. Run
**`Set MySQL Password.bat`** once — it prompts you privately, verifies the
credentials against MySQL, and stores them as the user environment variables
`DB_USERNAME` / `DB_PASSWORD`. Then open a new terminal and use
`Start ShopNest.bat`.

Until you do that, use the **H2** launcher — it is fully functional
(auth, cart, checkout, admin) but resets its data on every restart.

---

## 3. Execution — step by step

### Step 1 · Start MySQL

Just make sure the MySQL service is running. **You do not need to create the
database manually** — the connection URL contains `createDatabaseIfNotExist=true`
and Hibernate creates every table on first start.

### Step 2 · Point the backend at your MySQL

Open `backend/src/main/resources/application.properties` and change the two
lines below to match your local MySQL login:

```properties
spring.datasource.username=root
spring.datasource.password=root
```

> Everything else works as-is. Database name: `shopnest_db`.

### Step 3 · Run the backend

```bash
cd backend
mvn clean install       # first run downloads dependencies (2–4 min)
mvn spring-boot:run
```

API is now on **http://localhost:8080**.

You should see these lines in the console the first time:

```
Seeded admin account -> admin@shopnest.com / Admin@123
Seeded customer account -> user@shopnest.com / User@123
Seeded 12 demo products across 4 categories
```

*From an IDE instead:* open the `backend` folder as a Maven project and run
`EcommerceApplication.java`.

### Step 4 · Run the frontend

Open a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

App is now on **http://localhost:5180** — open it in your browser.
(Pinned in `vite.config.js`; 5173 is in use by another local project.)

### Step 5 · Log in and try the flow

| Role | Email | Password |
|---|---|---|
| Customer | `user@shopnest.com` | `User@123` |
| Admin | `admin@shopnest.com` | `Admin@123` |

**Customer path:** browse → search/filter → open a product → add to cart →
adjust quantities → checkout (address + payment method) → order confirmation →
*My Orders*.

**Admin path:** log in as admin → *Products* (create / edit / hide products) →
*Orders Admin* (see every order, move it through PLACED → CONFIRMED → SHIPPED →
DELIVERED).

### Step 6 · Verify the data actually landed in MySQL

```sql
USE shopnest_db;
SELECT * FROM users;
SELECT id, name, price, stock FROM products;
SELECT order_number, total_amount, status, payment_status FROM orders;
SELECT product_name, quantity, unit_price FROM order_items;
```

---

## 4. API reference

Base URL: `http://localhost:8080/api`

### Authentication

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | public | Create account, returns JWT |
| POST | `/auth/login` | public | Sign in, returns JWT |
| GET | `/auth/me` | any logged-in user | Current profile |

### Products & categories

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/products?search=&categoryId=&brand=&minPrice=&maxPrice=&minRating=&inStock=&onSale=&featured=&page=0&size=12&sort=latest` | public | Paged, filtered catalogue (`sort`: `latest`, `popular`, `price_asc`, `price_desc`, `name`) |
| GET | `/products/facets` | public | Price bounds and brand list for the filter panel |
| GET | `/products/{id}` | public | Single product, with gallery images |
| GET | `/products/{id}/related?limit=4` | public | "You may also like" — same category first |
| POST | `/products` | ADMIN | Create |
| PUT | `/products/{id}` | ADMIN | Update |
| DELETE | `/products/{id}` | ADMIN | Soft delete (`active=false`, keeps order history intact) |
| GET | `/admin/products` | ADMIN | Catalogue including hidden products |
| GET | `/categories` | public | List |
| POST | `/categories` | ADMIN | Create |
| PUT | `/categories/{id}` | ADMIN | Update name, description, tile image |
| DELETE | `/categories/{id}` | ADMIN | Delete (only when it has no products) |

### Cart (all require a token)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/cart` | Cart with subtotal, shipping and total |
| POST | `/cart/items` | `{ "productId": 1, "quantity": 2 }` |
| PUT | `/cart/items/{id}` | `{ "quantity": 3 }` |
| DELETE | `/cart/items/{id}` | Remove one line |
| DELETE | `/cart` | Empty the cart |

### Orders

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/orders/checkout` | user | Cart → order (validates stock, decrements it, simulates payment, clears cart) |
| GET | `/orders` | user | My order history |
| GET | `/orders/{id}` | user | One of my orders |
| GET | `/admin/orders` | ADMIN | Every order |
| PUT | `/admin/orders/{id}/status` | ADMIN | `{ "status": "SHIPPED" }` |

Send the token on every protected call:

```
Authorization: Bearer <token from /auth/login>
```

`api-tests.http` in the project root has all of this pre-written, including two
negative tests (401 without a token, 403 with a customer token on an admin route).

---

### Wishlist (all require a token)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/wishlist` | Saved products, with ratings |
| GET | `/wishlist/ids` | Just the ids — paints the heart icons on the grid |
| POST | `/wishlist` | `{ "productId": 1 }` — idempotent, saving twice is not an error |
| DELETE | `/wishlist/{productId}` | Unsave |
| POST | `/wishlist/{productId}/move-to-cart` | Add to cart, then unsave |

### Ratings & reviews

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/products/{id}/reviews` | public | List, average, star histogram, and your own review when signed in |
| POST | `/products/{id}/reviews` | user | `{ "rating": 1-5, "comment": "..." }` — posting again **edits** your review |
| DELETE | `/products/{id}/reviews/mine` | user | Remove your own review |

One review per person per product, enforced by a unique constraint. A review is
flagged **verified purchase** when that account has actually ordered the product.
`averageRating` and `reviewCount` are also returned on every product in the
catalogue, fetched as a single grouped query rather than one per row.

### Account

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/account` | Profile plus order count, total spent, wishlist and review counts |
| PUT | `/account` | Update name and phone |
| PUT | `/account/password` | `{ currentPassword, newPassword }` — verifies the old one first |

### Order detail & cancellation

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/orders/{id}` | One of my orders, for the detail page and status timeline |
| PUT | `/orders/{id}/cancel` | Cancel my own order — only before it ships |

Cancelling returns every line's quantity to `products.stock` and flips a `PAID`
order to `REFUNDED`. The admin route and the customer route share one
`applyCancellation` helper so they can never drift apart on this.

### Admin dashboard

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/admin/dashboard` | ADMIN | Revenue, order counts by status, average order value, best sellers, low stock |

Revenue and the average order value both exclude cancelled orders. Products at
or below 15 units are reported as low stock.

### Coupons, addresses and support

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/coupons/offers` | public | Promo codes currently open to shoppers |
| POST | `/cart/coupon` | logged in | Apply a code `{ "code": "WELCOME10" }` (validated against the cart) |
| DELETE | `/cart/coupon` | logged in | Remove the applied code |
| GET / POST | `/account/addresses` | logged in | List / save delivery addresses (max 10) |
| PUT / DELETE | `/account/addresses/{id}` | logged in | Edit / delete an address |
| PUT | `/account/addresses/{id}/default` | logged in | Make an address the default |
| POST | `/newsletter` | public | Subscribe an email (idempotent) |
| POST | `/contact` | public | Send a message to the store |
| GET / POST | `/admin/coupons` | ADMIN | List / create coupons |
| PUT / DELETE | `/admin/coupons/{id}` | ADMIN | Edit / delete a coupon |
| GET | `/admin/customers` | ADMIN | Accounts with order count and spend |
| GET | `/admin/subscribers` | ADMIN | Newsletter list |
| GET | `/admin/messages` | ADMIN | Contact inbox |
| PUT | `/admin/messages/{id}` | ADMIN | Mark resolved `{ "resolved": true }` |

Coupon rules: `PERCENT` or `FLAT`, optional minimum order, maximum discount,
expiry date, total usage limit and once-per-customer. The cart response shows
the applied code and, when it does not currently qualify, the reason (for
example "Add ₹1,500.00 more to use FLAT250"). A code that no longer qualifies
at checkout is simply not applied. Cancelling an order gives its redemption back.

Demo codes seeded on first start: `WELCOME10` (10% up to ₹500, once per
customer), `FLAT250` (₹250 off ₹2,499+), `FESTIVE15` (15% up to ₹1,000 on ₹4,999+).

---

## 5. How the pieces fit together

**Authentication.** Passwords are BCrypt-hashed before they reach the database.
`/auth/login` verifies the credentials through Spring Security's
`AuthenticationManager` and returns a signed JWT (HS256, 24 h). Every later
request carries that token; `JwtAuthenticationFilter` validates it and puts the
user into the `SecurityContext`. The API is fully stateless — no sessions.

**Authorisation.** Two roles. `ROLE_USER` can shop; `ROLE_ADMIN` additionally
gets the write endpoints, enforced both in `SecurityConfig` (URL rules) and with
`@PreAuthorize` on the admin controllers.

**Cart.** Stored server-side, one row per user + product, with a unique
constraint so the same product can never appear twice. Every mutation returns
the entire recalculated cart, so the React UI never has to compute totals
itself. Stock is checked on add and on quantity change.

**Checkout.** One transaction: re-validate stock → copy each line into
`order_items` with a **price and name snapshot** (so old invoices don't change
when you edit a product later) → decrement stock → mark payment → empty the
cart. Card/UPI orders are marked `PAID` immediately with a generated reference;
cash-on-delivery stays `PENDING` until an admin marks it `DELIVERED`.
No real gateway is called — swapping in Razorpay/Stripe means replacing that one
block in `OrderService.checkout`.

**Frontend state.** `AuthContext` holds the JWT and user profile (persisted in
`localStorage`, revalidated against `/auth/me` on page load). `CartContext`
mirrors the server cart. An Axios response interceptor catches any `401` and
bounces you to the login page. `ProtectedRoute` guards the private routes and
takes an `adminOnly` flag for the two admin screens.

**Errors.** `GlobalExceptionHandler` turns every exception into the same JSON
shape (`timestamp, status, error, message, path, fieldErrors`), and the React
`apiMessage()` helper reads it, so validation errors show up as readable text
in the UI instead of a generic failure.

---

## 6. Troubleshooting

| Symptom | Fix |
|---|---|
| `Access denied for user 'root'@'localhost'` | Wrong `spring.datasource.password` in `application.properties` |
| `Communications link failure` | MySQL service isn't running |
| `Port 8080 was already in use` | Change `server.port`, or stop the other process |
| Frontend loads but no products | Backend isn't running, or its port changed — set `VITE_API_BASE_URL` in `frontend/.env` |
| CORS error in the browser console | Add your frontend URL to `app.cors.allowed-origins` |
| `401` on every call after a day | JWT expired (24 h) — log in again |
| Want to reset the demo data | `DROP DATABASE shopnest_db;` then restart the backend |
| No MySQL available at all | `mvn spring-boot:run -Dspring-boot.run.profiles=h2` runs it on an in-memory H2 database |

---

## 7. Resume / report wording

> **Full Stack E-Commerce Application (Spring Boot | React | MySQL)**
> - Designed a complete e-commerce platform with JWT-based authentication,
>   role-based authorisation and admin product management.
> - Developed 20+ secure REST endpoints using Spring Boot 3, Spring Security and
>   Spring Data JPA, with layered controller–service–repository architecture.
> - Built a responsive React frontend with reusable components, context-based
>   state management and protected routing.
> - Implemented a server-side shopping cart and transactional checkout with
>   stock validation, price snapshots and order-status tracking.
> - Added wishlist, product ratings and reviews with verified-purchase flags,
>   customer order cancellation with automatic stock restoration, a self-service
>   account area, and an admin analytics dashboard.
> - Modelled and connected a normalised MySQL database (6 tables, foreign-key
>   constraints) for persistent storage.

---

## 8. Ideas if you want to extend it

- Product image upload (`MultipartFile`) instead of image URLs
- Guest checkout / a guest cart that merges into the account on sign-in
- Real payment gateway (Razorpay / Stripe) in place of the simulated one
- Email confirmation on checkout (`spring-boot-starter-mail`)
- Swagger UI (`springdoc-openapi-starter-webmvc-ui`) for live API docs
- Unit tests with JUnit 5 + Mockito, integration tests with `@SpringBootTest`
- Docker Compose for MySQL + API + frontend
