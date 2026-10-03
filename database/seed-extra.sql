-- Optional extra demo rows. The application already seeds two accounts,
-- four categories and twelve products on first start (DataSeeder.java),
-- so run this only if you want a bigger catalogue for screenshots.

USE shopnest_db;

INSERT INTO categories (name, description) VALUES
  ('Sports & Outdoors', 'Fitness gear and outdoor equipment')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO products (name, description, price, image_url, stock, active, category_id, created_at)
SELECT 'Yoga Mat 6mm', 'Non-slip TPE mat with carry strap.', 1299.00,
       'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600&q=80',
       55, b'1', c.id, NOW(6)
FROM categories c WHERE c.name = 'Sports & Outdoors';

INSERT INTO products (name, description, price, image_url, stock, active, category_id, created_at)
SELECT 'Insulated Water Bottle 1L', 'Double-wall steel, keeps drinks cold 24h.', 899.00,
       'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',
       80, b'1', c.id, NOW(6)
FROM categories c WHERE c.name = 'Sports & Outdoors';
