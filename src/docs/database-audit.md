# ESMARC Database Audit (Phase 1 & 2)

## ERD-Style Relationship Map

```text
profiles
  -> auth.users

shops
  -> shop_members (1:N)
  -> product_categories (1:N)
  -> products (1:N)
  -> customers (1:N)
  -> orders (1:N)
  -> subscriptions (1:N)
  -> shop_themes (1:N)
  -> domains (1:N)
  -> shop_settings (1:1)

shop_members
  -> profiles/auth.users (N:1)

plans
  -> subscriptions (1:N)

themes
  -> shop_themes (1:N)

product_categories
  -> products (1:N)

products
  -> product_variants (1:N)
  -> product_images (1:N)

product_variants
  -> product_images (1:N)
  -> inventory_logs (1:N)
  -> order_items (1:N)

customers
  -> customer_addresses (1:N)
  -> orders (1:N)

orders
  -> order_items (1:N)

domains
  -> shops (N:1)

analytics_events -> (Standalone / system level)
analytics_daily_aggregates -> (Standalone / system level)
activity_logs -> (Standalone / system level)
notifications -> (Standalone / system level)
```

## Table Audit Summary

### 1. `profiles`
- **Primary key**: `id`
- **Foreign keys**: `id` -> `auth.users(id)`
- **Indexes**: None explicit (PK is indexed).
- **Relationships**: 1:1 with `auth.users`. N:1 with `shop_members`.
- **API Endpoints**: implicitly through Auth/Permissions. 
- **UI Screens**: Profile settings / Member management.

### 2. `shops`
- **Primary key**: `id`
- **Foreign keys**: None.
- **Indexes**: None explicit.
- **Relationships**: 1:N with products, domains, subscriptions, themes, members, orders, customers.
- **API Endpoints**: `GET /api/v1/admin/shops`, `GET /api/v1/admin/shops/:id`, `POST /api/v1/admin/shops`, `PATCH /api/v1/admin/shops/:id`
- **UI Screens**: Platform Dashboard, Shops Management (Super Admin).

### 3. `shop_members`
- **Primary key**: `id`
- **Foreign keys**: `shop_id` -> `shops(id)`, `user_id` -> `auth.users(id)`
- **Indexes**: None explicit.
- **Relationships**: Join table referencing `shops` and `auth.users`.
- **API Endpoints**: Used in Authorization middleware (`requireShopOwner`, etc.).
- **UI Screens**: Team / Staff Management (Shop Admin).

### 4. `plans`
- **Primary key**: `id`
- **Foreign keys**: None.
- **Indexes**: None explicit.
- **Relationships**: 1:N with `subscriptions`.
- **API Endpoints**: `GET /api/v1/admin/plans`, `POST /api/v1/admin/plans`
- **UI Screens**: Billing / Subscriptions Management.

### 5. `subscriptions`
- **Primary key**: `id`
- **Foreign keys**: `shop_id` -> `shops(id)`, `plan_id` -> `plans(id)`
- **Indexes**: None explicit.
- **Relationships**: Links shops to their billing plans.
- **API Endpoints**: `POST /api/v1/admin/plans/assign`
- **UI Screens**: Billing / Subscriptions Management.

### 6. `themes`
- **Primary key**: `id`
- **Foreign keys**: None.
- **Indexes**: None explicit.
- **Relationships**: 1:N with `shop_themes`.
- **API Endpoints**: `GET /api/v1/admin/themes`, `POST /api/v1/admin/themes`
- **UI Screens**: Theme Store, Platform Settings.

### 7. `shop_themes`
- **Primary key**: `id`
- **Foreign keys**: `shop_id` -> `shops(id)`, `theme_id` -> `themes(id)`
- **Indexes**: None explicit.
- **Relationships**: Links a shop to a theme.
- **API Endpoints**: `POST /api/v1/admin/themes/assign`
- **UI Screens**: Shop Admin Appearance settings.

### 8. `product_categories`
- **Primary key**: `id`
- **Foreign keys**: `shop_id` -> `shops(id)`
- **Indexes**: None explicit.
- **Relationships**: 1:N with `products`.
- **API Endpoints**: `GET /api/v1/products` (potential future categories filters).
- **UI Screens**: Shop Admin Product Categories.

### 9. `products`
- **Primary key**: `id`
- **Foreign keys**: `shop_id` -> `shops(id)`, `category_id` -> `product_categories(id)`
- **Indexes**: None explicit.
- **Relationships**: 1:N with `product_variants`, `product_images`.
- **API Endpoints**: `GET /api/v1/products`, `GET /api/v1/products/:id`, `POST /api/v1/products`, `PATCH /api/v1/products/:id`, `DELETE /api/v1/products/:id`
- **UI Screens**: Shop Admin Products List, Product Detail.

### 10. `product_variants`
- **Primary key**: `id`
- **Foreign keys**: `product_id` -> `products(id)`
- **Indexes**: None explicit.
- **Relationships**: 1:N with `order_items`, `inventory_logs`, `product_images`.
- **API Endpoints**: `POST /api/v1/products/:id/variants`, `PATCH /api/v1/products/variants/:id`, `DELETE /api/v1/products/variants/:id`
- **UI Screens**: Shop Admin Product Detail Variant section.

### 11. `product_images`
- **Primary key**: `id`
- **Foreign keys**: `product_id` -> `products(id)`, `variant_id` -> `product_variants(id)`
- **Indexes**: None explicit.
- **Relationships**: None beyond foreign keys.
- **API Endpoints**: `GET /api/v1/products/:id` (nested inclusion)
- **UI Screens**: Shop Admin Product Detail Image Uploader.

### 12. `customers`
- **Primary key**: `id`
- **Foreign keys**: `shop_id` -> `shops(id)`
- **Indexes**: None explicit.
- **Relationships**: 1:N with `customer_addresses`, 1:N with `orders`.
- **API Endpoints**: `GET /api/v1/customers`, `GET /api/v1/customers/:id`, `POST /api/v1/customers`, `PATCH /api/v1/customers/:id`, `DELETE /api/v1/customers/:id`
- **UI Screens**: Shop Admin Customers List, Customer Detail.

### 13. `customer_addresses`
- **Primary key**: `id`
- **Foreign keys**: `customer_id` -> `customers(id)`
- **Indexes**: None explicit.
- **Relationships**: N:1 with `customers`.
- **API Endpoints**: `GET /api/v1/customers/:id` (nested inclusion).
- **UI Screens**: Shop Admin Customer Detail.

### 14. `orders`
- **Primary key**: `id`
- **Foreign keys**: `shop_id` -> `shops(id)`, `customer_id` -> `customers(id)`
- **Indexes**: None explicit.
- **Relationships**: 1:N with `order_items`.
- **API Endpoints**: `GET /api/v1/orders`, `GET /api/v1/orders/:id`, `POST /api/v1/orders`, `POST /api/v1/orders/:id/cancel`, `POST /api/v1/orders/:id/fulfill`
- **UI Screens**: Shop Admin Orders List, Order Detail.

### 15. `order_items`
- **Primary key**: `id`
- **Foreign keys**: `order_id` -> `orders(id)`, `variant_id` -> `product_variants(id)`
- **Indexes**: None explicit.
- **Relationships**: N:1 with `orders`, N:1 with `product_variants`.
- **API Endpoints**: Managed via `POST /api/v1/orders`, `POST /api/v1/orders/:id/cancel`.
- **UI Screens**: Shop Admin Order Detail.

### 16. `inventory_logs`
- **Primary key**: `id`
- **Foreign keys**: `variant_id` -> `product_variants(id)`, `product_id` -> `products(id)`
- **Indexes**: None explicit.
- **Relationships**: N:1 with `product_variants`.
- **API Endpoints**: Triggered implicitly via order fulfillment or variant stock modifications.
- **UI Screens**: Shop Admin Inventory / Stock adjustment history.

### 17. `domains`
- **Primary key**: `id`
- **Foreign keys**: `shop_id` -> `shops(id)` (implicitly understood, not defined in Phase 2 SQL but inferred).
- **Indexes**: None explicit.
- **Relationships**: N:1 with `shops`.
- **API Endpoints**: `GET /api/v1/domains`, `POST /api/v1/domains`, `POST /api/v1/domains/verify`, `DELETE /api/v1/domains/:id`
- **UI Screens**: Settings -> Domains.

### 18. `notifications`
- **Primary key**: `id`
- **Foreign keys**: None explicitly tied to shop yet depending on Phase 1 implementation (may belong to user or shop).
- **Indexes**: None explicit.
- **Relationships**: Standalone log for UI notifications.
- **API Endpoints**: `GET /api/v1/notifications`, `POST /api/v1/notifications`
- **UI Screens**: Super Admin/Shop Admin Notifications bell.

### 19. `analytics_events`
- **Primary key**: `id`
- **Foreign keys**: N/A
- **Indexes**: None explicit.
- **Relationships**: None.
- **API Endpoints**: `GET /api/v1/analytics/traffic`
- **UI Screens**: Platform Analytics Dashboard.

### 20. `analytics_daily_aggregates`
- **Primary key**: `id` or composite (date, group)
- **Foreign keys**: N/A
- **Indexes**: None explicit.
- **Relationships**: None.
- **API Endpoints**: `GET /api/v1/analytics/revenue`, `GET /api/v1/analytics/shops`
- **UI Screens**: Platform Analytics Dashboard line charts.

### 21. `activity_logs`
- **Primary key**: `id`
- **Foreign keys**: N/A
- **Indexes**: None explicit.
- **Relationships**: None.
- **API Endpoints**: Underlying audits.
- **UI Screens**: Admin dashboard recent activity feeds.


## Architecture Assessment

### Missing Indexes
A significant problem with the current schema is a complete lack of explicitly defined `INDEX` statements besides the auto-generated Primary Key indexes. This will result in full-table scans.
- `shop_id` columns in almost every multi-tenant table (`products`, `orders`, `customers`, `shop_members`, `product_categories`, `shop_themes`) require indexes because practically every read query filters by `eq('shop_id', shopId)`.
- `user_id` in `shop_members` needs an index for fast authorization checks.
- `status` fields in `orders`, `shops`, and `products` often used in filters (e.g. "where status='active'") needs indexing.

### Missing Foreign Keys
- `domains` likely missing a hard reference `FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE`.
- The notification system does not have clear associations tied via foreign key to `shops` or `users`.

### Redundant Tables
- `analytics_events` and `analytics_daily_aggregates`: Instead of separate rollup tables, modern databases like PostgreSQL/Supabase can use materialized views. Managing dual tables can create data mismatches if the rollup job fails.
- `shop_themes` could simply be a `theme_id` column inside `shops` if a shop only ever has *one* active theme. (A dedicated table is only necessary if they hold multiple themes over time or in draft states, which seems overkill based on `shop_settings` holding 1-to-1).

### Potential Scalability Problems
1. **Multi-tenant Indexing**: The absence of `shop_id` indices on core commerce tables (`orders`, `products`) will cause read performance to plummet drastically as soon as total row counts exceed a few thousand. Row Level Security (RLS) can alleviate some of this for the client by forcing index scans, but our middleware currently hits `supabaseAdmin`, bypassing RLS.
2. **Order Totals**: We calculate totals and inventory implicitly through backend iteration. Supabase REST doesn't natively do multi-table transactions (outside of calling an RPC stored procedure). Writing multiple inserts in loops (e.g., `for (const item of items) { update stock }`) is highly vulnerable to race conditions, partial failures (phantom orders with no stock drawn), and latency.
3. **Analytics Growth**: `analytics_events` appending raw clicks will grow exponentially and choke standard queries. We must utilize PostgreSQL partitions by date, or shift to ClickHouse or an equivalent time-series store once traffic picks up. materialised views for aggregates.
4. **Soft Deletes**: Implementing `ON DELETE CASCADE` implies hard-deletes across the board. In a real-world commerce system, losing historic `inventory_logs`, `order_items`, or `products` because a member deleted a shop or variant can ruin accounting ledgers and data integrity. We need a `deleted_at` soft-delete column strategy for financial ledgers like `orders` and `products`.
