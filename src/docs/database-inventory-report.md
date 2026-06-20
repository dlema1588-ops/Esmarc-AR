# ESMARC Database Inventory Report

## Existing Tables in Database

### table_name [REMOVE]
- **Row Count**: 0
- **Columns**:
- id (bigint)
- inserted_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- data (jsonb)
- name (text)
- **Foreign Keys**:
- None
- **Indexes**:
- PK: id

### platform_admins [REMOVE]
- **Row Count**: 0
- **Columns**:
- id (uuid)
- user_id (uuid)
- role (text)
- created_at (timestamp with time zone)
- **Foreign Keys**:
- user_id -> profiles(id)
- **Indexes**:
- PK: id

### shops [MODIFY]
- **Row Count**: 0
- **Columns**:
- id (uuid)
- owner_id (uuid)
- name (text)
- description (text)
- category (text)
- logo_url (text)
- is_active (boolean)
- created_at (timestamp with time zone)
- subdomain (text)
- theme_color (text)
- banner_url (text)
- tagline (text)
- address (text)
- phone (text)
- verification_status (text)
- **Foreign Keys**:
- owner_id -> profiles(id)
- **Indexes**:
- PK: id

### orders [KEEP]
- **Row Count**: 0
- **Columns**:
- id (uuid)
- shop_id (uuid)
- customer_name (text)
- customer_phone (text)
- delivery_address (text)
- total (numeric)
- status (text)
- payment_status (text)
- payment_ref (text)
- created_at (timestamp with time zone)
- **Foreign Keys**:
- shop_id -> shops(id)
- **Indexes**:
- PK: id

### subscriptions [KEEP]
- **Row Count**: 0
- **Columns**:
- id (uuid)
- shop_id (uuid)
- plan (text)
- status (text)
- started_at (timestamp with time zone)
- ends_at (timestamp with time zone)
- **Foreign Keys**:
- shop_id -> shops(id)
- **Indexes**:
- PK: id

### contact_messages [REMOVE]
- **Row Count**: 0
- **Columns**:
- id (uuid)
- shop_id (uuid)
- customer_name (text)
- customer_phone (text)
- message (text)
- status (text)
- created_at (timestamp with time zone)
- **Foreign Keys**:
- shop_id -> shops(id)
- **Indexes**:
- PK: id

### profiles [KEEP]
- **Row Count**: 0
- **Columns**:
- id (uuid)
- auth_user_id (uuid)
- full_name (text)
- avatar_url (text)
- phone (text)
- created_at (timestamp with time zone)
- **Foreign Keys**:
- None
- **Indexes**:
- PK: id

### shop_stats [REMOVE]
- **Row Count**: 0
- **Columns**:
- id (uuid)
- shop_id (uuid)
- total_views (integer)
- total_products (integer)
- updated_at (timestamp with time zone)
- **Foreign Keys**:
- shop_id -> shops(id)
- **Indexes**:
- PK: id

### products [MODIFY]
- **Row Count**: 0
- **Columns**:
- id (uuid)
- shop_id (uuid)
- title (text)
- description (text)
- price (numeric)
- currency (text)
- status (text)
- created_at (timestamp with time zone)
- category (text)
- image_url (text)
- stock (integer)
- available (boolean)
- visible (boolean)
- **Foreign Keys**:
- shop_id -> shops(id)
- **Indexes**:
- PK: id

### shop_members [KEEP]
- **Row Count**: 0
- **Columns**:
- id (uuid)
- shop_id (uuid)
- user_id (uuid)
- role (text)
- created_at (timestamp with time zone)
- **Foreign Keys**:
- shop_id -> shops(id)
- user_id -> profiles(id)
- **Indexes**:
- PK: id

### order_items [KEEP]
- **Row Count**: 0
- **Columns**:
- id (uuid)
- order_id (uuid)
- product_id (uuid)
- quantity (integer)
- unit_price (numeric)
- **Foreign Keys**:
- order_id -> orders(id)
- product_id -> products(id)
- **Indexes**:
- PK: id

### system_messages [REMOVE]
- **Row Count**: 0
- **Columns**:
- id (uuid)
- title (text)
- message (text)
- target_role (text)
- created_at (timestamp with time zone)
- **Foreign Keys**:
- None
- **Indexes**:
- PK: id

### messages [REMOVE]
- **Row Count**: 0
- **Columns**:
- id (uuid)
- conversation_id (uuid)
- sender_id (uuid)
- message (text)
- created_at (timestamp with time zone)
- **Foreign Keys**:
- conversation_id -> conversations(id)
- sender_id -> profiles(id)
- **Indexes**:
- PK: id

### notifications [KEEP]
- **Row Count**: 0
- **Columns**:
- id (uuid)
- user_id (uuid)
- title (text)
- body (text)
- is_read (boolean)
- created_at (timestamp with time zone)
- video_url (text)
- video_title (text)
- **Foreign Keys**:
- user_id -> profiles(id)
- **Indexes**:
- PK: id

### conversations [REMOVE]
- **Row Count**: 0
- **Columns**:
- id (uuid)
- shop_id (uuid)
- customer_id (uuid)
- created_at (timestamp with time zone)
- **Foreign Keys**:
- shop_id -> shops(id)
- customer_id -> profiles(id)
- **Indexes**:
- PK: id

### media [REMOVE]
- **Row Count**: 0
- **Columns**:
- id (uuid)
- shop_id (uuid)
- product_id (uuid)
- provider (text)
- url (text)
- external_id (text)
- title (text)
- created_at (timestamp with time zone)
- **Foreign Keys**:
- shop_id -> shops(id)
- product_id -> products(id)
- **Indexes**:
- PK: id

## Missing Tables

- plans [MISSING]
- themes [MISSING]
- shop_themes [MISSING]
- product_categories [MISSING]
- product_variants [MISSING]
- product_images [MISSING]
- customers [MISSING]
- customer_addresses [MISSING]
- inventory_logs [MISSING]
- domains [MISSING]
- analytics_events [MISSING]
- analytics_daily_aggregates [MISSING]
- activity_logs [MISSING]
