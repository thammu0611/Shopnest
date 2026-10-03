-- =================================================================
--  ShopNest - MySQL schema (reference)
--
--  You normally DO NOT need to run this file: the Spring Boot app
--  creates the schema automatically (spring.jpa.hibernate.ddl-auto=update)
--  and the connection URL has createDatabaseIfNotExist=true.
--
--  Keep this file for your report / viva: it documents the exact
--  tables, keys and relationships the application uses.
-- =================================================================

CREATE DATABASE IF NOT EXISTS shopnest_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE shopnest_db;

-- ----------------------------------------------------------------
-- 1. users
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL,
    password    VARCHAR(255) NOT NULL,          -- BCrypt hash
    role        VARCHAR(20)  NOT NULL DEFAULT 'ROLE_USER',
    phone       VARCHAR(20)           DEFAULT NULL,
    created_at  DATETIME(6)           DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------
-- 2. categories
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    name        VARCHAR(80) NOT NULL,
    description VARCHAR(255)         DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_categories_name (name)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------
-- 3. products
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id          BIGINT         NOT NULL AUTO_INCREMENT,
    name        VARCHAR(150)   NOT NULL,
    description VARCHAR(2000)           DEFAULT NULL,
    price       DECIMAL(12,2)  NOT NULL,
    image_url   VARCHAR(500)            DEFAULT NULL,
    stock       INT            NOT NULL DEFAULT 0,
    active      BIT(1)         NOT NULL DEFAULT b'1',
    category_id BIGINT                  DEFAULT NULL,
    created_at  DATETIME(6)             DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_products_category (category_id),
    KEY idx_products_name (name),
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories (id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------
-- 4. cart_items  (one live cart row per user + product)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart_items (
    id         BIGINT NOT NULL AUTO_INCREMENT,
    user_id    BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity   INT    NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_cart_user_product (user_id, product_id),
    CONSTRAINT fk_cart_user    FOREIGN KEY (user_id)    REFERENCES users (id),
    CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------
-- 5. orders
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id                BIGINT        NOT NULL AUTO_INCREMENT,
    order_number      VARCHAR(40)   NOT NULL,
    user_id           BIGINT        NOT NULL,
    total_amount      DECIMAL(12,2) NOT NULL,
    status            VARCHAR(20)   NOT NULL,   -- PLACED/CONFIRMED/SHIPPED/DELIVERED/CANCELLED
    payment_status    VARCHAR(20)   NOT NULL,   -- PENDING/PAID/FAILED/REFUNDED
    payment_method    VARCHAR(40)            DEFAULT NULL,
    payment_reference VARCHAR(60)            DEFAULT NULL,
    shipping_name     VARCHAR(100)  NOT NULL,
    shipping_phone    VARCHAR(20)   NOT NULL,
    shipping_address  VARCHAR(255)  NOT NULL,
    shipping_city     VARCHAR(80)   NOT NULL,
    shipping_pincode  VARCHAR(12)   NOT NULL,
    created_at        DATETIME(6)            DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_orders_number (order_number),
    KEY idx_orders_user (user_id),
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------
-- 6. order_items  (price/name snapshot at purchase time)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    order_id     BIGINT        NOT NULL,
    product_id   BIGINT                 DEFAULT NULL,
    product_name VARCHAR(150)  NOT NULL,
    image_url    VARCHAR(500)           DEFAULT NULL,
    unit_price   DECIMAL(12,2) NOT NULL,
    quantity     INT           NOT NULL,
    PRIMARY KEY (id),
    KEY idx_orderitem_order (order_id),
    CONSTRAINT fk_orderitem_order   FOREIGN KEY (order_id)   REFERENCES orders (id),
    CONSTRAINT fk_orderitem_product FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------
-- Handy verification queries
-- ----------------------------------------------------------------
-- SELECT * FROM users;
-- SELECT p.name, c.name AS category, p.price, p.stock FROM products p LEFT JOIN categories c ON c.id = p.category_id;
-- SELECT o.order_number, u.email, o.total_amount, o.status, o.payment_status
--   FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.id DESC;
-- SELECT oi.product_name, oi.quantity, oi.unit_price FROM order_items oi WHERE oi.order_id = 1;
