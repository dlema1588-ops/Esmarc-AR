# ESMARC Database Stabilization & Unified v1 Schema Architecture

This document represents the master blueprint for the **Database Stabilization Phase** of the ESMARC Enterprise Platform. It outlines the current state of the database, classifies every table, defines the reconciled and consolidated **ESMARC Database v1 Schema**, and sets forth a comprehensive migration plan to replace all mock pipelines with real Supabase data flows.

---

## 1. Live Supabase Database Audit

An audit of the active tables currently in the live Supabase database reveals **16 existing tables**, with all presently containing **0 master rows** (as they are freshly initialized for this environment). However, they exhibit structural inconsistencies when compared against the code repositories.

### Table-by-Table Inventory

#### 1.1 `table_name`
*   **Row Count:** 0
*   **Columns:** 
    *   `id` (bigint, PK)
    *   `inserted_at` (timestamptz)
    *   `updated_at` (timestamptz)
    *   `data` (jsonb)
    *   `name` (text)
*   **Foreign Keys:** None
*   **Indexes:** Primary Key on `id`
*   **Classification:** **REMOVE** (Unused placeholder table from default bootstrap).

#### 1.2 `platform_admins`
*   **Row Count:** 0
*   **Columns:**
    *   `id` (uuid, PK)
    *   `user_id` (uuid) -> `profiles(id)`
    *   `role` (text)
    *   `created_at` (timestamptz)
*   **Foreign Keys:** `user_id` REFERENCES `profiles(id)`
*   **Indexes:** Primary Key on `id`
*   **Classification:** **REMOVE** (Replaced by modern consolidated RBAC system using the `system_role` field in the `profiles` table).

#### 1.3 `shops`
*   **Row Count:** 0
*   **Columns:**
    *   `id` (uuid, PK)
    *   `owner_id` (uuid)
    *   `name` (text)
    *   `description` (text)
    *   `category` (text)
    *   `logo_url` (text)
    *   `is_active` (boolean)
    *   `created_at` (timestamptz)
    *   `subdomain` (text)
    *   `theme_color` (text)
    *   `banner_url` (text)
    *   `tagline` (text)
    *   `address` (text)
    *   `phone` (text)
    *   `verification_status` (text)
*   **Foreign Keys:** `owner_id` REFERENCES `profiles(id)`
*   **Indexes:** Primary Key on `id`
*   **Classification:** **MODIFY** (Update columns to align with core multi-tenant commerce settings, including `plan_id` and unique `slug` fields required by the router, while dropping metadata redundant with standard `locations` and `shop_settings`).

#### 1.4 `orders`
*   **Row Count:** 0
*   **Columns:**
    *   `id` (uuid, PK)
    *   `shop_id` (uuid)
    *   `customer_name` (text)
    *   `customer_phone` (text)
    *   `delivery_address` (text)
    *   `total` (numeric)
    *   `status` (text)
    *   `payment_status` (text)
    *   `payment_ref` (text)
    *   `created_at` (timestamptz)
*   **Foreign Keys:** `shop_id` REFERENCES `shops(id)`
*   **Indexes:** Primary Key on `id`
*   **Classification:** **MODIFY** (Update to standard unified `orders` model matching standard Phase 2 DDL. Integrate foreign key link `customer_id` referencing a real `customers` table to support permanent profiles, replacing loose metadata fields like `customer_name` and `customer_phone` with a dedicated customer references module).

#### 1.5 `subscriptions`
*   **Row Count:** 0
*   **Columns:**
    *   `id` (uuid, PK)
    *   `shop_id` (uuid)
    *   `plan` (text)
    *   `status` (text)
    *   `started_at` (timestamptz)
    *   `ends_at` (timestamptz)
*   **Foreign Keys:** `shop_id` REFERENCES `shops(id)`
*   **Indexes:** Primary Key on `id`
*   **Classification:** **KEEP** (Critical link table for billing SaaS limits, linking shops to plans).

#### 1.6 `contact_messages`
*   **Row Count:** 0
*   **Columns:**
    *   `id` (uuid, PK)
    *   `shop_id` (uuid)
    *   `customer_name` (text)
    *   `customer_phone` (text)
    *   `message` (text)
    *   `status` (text)
    *   `created_at` (timestamptz)
*   **Foreign Keys:** `shop_id` REFERENCES `shops(id)`
*   **Indexes:** Primary Key on `id`
*   **Classification:** **REMOVE** (Unused old structure; unified under general features or standard customer conversations).

#### 1.7 `profiles`
*   **Row Count:** 0
*   **Columns:**
    *   `id` (uuid, PK)
    *   `auth_user_id` (uuid)
    *   `full_name` (text)
    *   `avatar_url` (text)
    *   `phone` (text)
    *   `created_at` (timestamptz)
*   **Foreign Keys:** None
*   **Indexes:** Primary Key on `id`
*   **Classification:** **MODIFY** (Align explicitly as 1:1 linked with Supabase Authed users at `auth.users(id)`. Merge missing fields required by the platform management panel like `system_role` to distinguish Super Admins from generic customers/owners).

#### 1.8 `shop_stats`
*   **Row Count:** 0
*   **Columns:**
    *   `id` (uuid, PK)
    *   `shop_id` (uuid)
    *   `total_views` (integer)
    *   `total_products` (integer)
    *   `updated_at` (timestamptz)
*   **Foreign Keys:** `shop_id` REFERENCES `shops(id)`
*   **Indexes:** Primary Key on `id`
*   **Classification:** **REMOVE** (Redundant with modern multi-dimensional `analytics_events` and modular rollup tasks, which are more performant and versatile).

#### 1.9 `products`
*   **Row Count:** 0
*   **Columns:**
    *   `id` (uuid, PK)
    *   `shop_id` (uuid)
    *   `title` (text)
    *   `description` (text)
    *   `price` (numeric)
    *   `currency` (text)
    *   `status` (text)
    *   `created_at` (timestamptz)
    *   `category` (text)
    *   `image_url` (text)
    *   `stock` (integer)
    *   `available` (boolean)
    *   `visible` (boolean)
*   **Foreign Keys:** `shop_id` REFERENCES `shops(id)`
*   **Indexes:** Primary Key on `id`
*   **Classification:** **MODIFY** (Update to standard Phase 2 layout. Extract variant specific pricing and quantities to the proper `product_variants` structure to support variable sizing/color catalogs, extract textual categories to structured `product_categories` reference tables, and extract loose file urls to a flexible `product_images` schema).

#### 1.10 `shop_members`
*   **Row Count:** 0
*   **Columns:**
    *   `id` (uuid, PK)
    *   `shop_id` (uuid)
    *   `user_id` (uuid)
    *   `role` (text)
    *   `created_at` (timestamptz)
*   **Foreign Keys:**
    *   `shop_id` REFERENCES `shops(id)`
    *   `user_id` REFERENCES `profiles(id)`
*   **Indexes:** Primary Key on `id`
*   **Classification:** **KEEP / CONSOLIDATE** (Establish consistent foreign keys referencing `shops(id)` and `auth.users(id)`, applying check constraints on roles `owner`, `admin`, `manager`, `staff` for strict role-based access).

#### 1.11 `order_items`
*   **Row Count:** 0
*   **Columns:**
    *   `id` (uuid, PK)
    *   `order_id` (uuid)
    *   `product_id` (uuid)
    *   `quantity` (integer)
    *   `unit_price` (numeric)
*   **Foreign Keys:**
    *   `order_id` REFERENCES `orders(id)`
    *   `product_id` REFERENCES `products(id)`
*   **Indexes:** Primary Key on `id`
*   **Classification:** **MODIFY** (Align to map directly to `product_variants(id)` rather than products directly to support option-specific tracking, adding dynamic calculated fields like `subtotal` as a numeric column).

#### 1.12 `system_messages`
*   **Row Count:** 0
*   **Columns:**
    *   `id` (uuid, PK)
    *   `title` (text)
    *   `message` (text)
    *   `target_role` (text)
    *   `created_at` (timestamptz)
*   **Foreign Keys:** None
*   **Indexes:** Primary Key on `id`
*   **Classification:** **REMOVE** (Unused old model; notifications and audit events are already comprehensively covered by the audit and job frameworks).

#### 1.13 `messages`
*   **Row Count:** 0
*   **Columns:**
    *   `id` (uuid, PK)
    *   `conversation_id` (uuid)
    *   `sender_id` (uuid)
    *   `message` (text)
    *   `created_at` (timestamptz)
*   **Foreign Keys:**
    *   `conversation_id` REFERENCES `conversations(id)`
    *   `sender_id` REFERENCES `profiles(id)`
*   **Indexes:** Primary Key on `id`
*   **Classification:** **REMOVE** (Unused old chat infrastructure. The interactive AI agent structure uses modern `ai_conversations` and direct task pipelines).

#### 1.14 `notifications`
*   **Row Count:** 0
*   **Columns:**
    *   `id` (uuid, PK)
    *   `user_id` (uuid)
    *   `title` (text)
    *   `body` (text)
    *   `is_read` (boolean)
    *   `created_at` (timestamptz)
    *   `video_url` (text)
    *   `video_title` (text)
*   **Foreign Keys:** `user_id` REFERENCES `profiles(id)`
*   **Indexes:** Primary Key on `id`
*   **Classification:** **MODIFY** (Streamline and structure to hold clear references. Clean up specialized fields like `video_url` into generic metadata fields, and bind them either to a specific tenant `shop_id` or `user_id`).

#### 1.15 `conversations`
*   **Row Count:** 0
*   **Columns:**
    *   `id` (uuid, PK)
    *   `shop_id` (uuid)
    *   `customer_id` (uuid)
    *   `created_at` (timestamptz)
*   **Foreign Keys:**
    *   `shop_id` REFERENCES `shops(id)`
    *   `customer_id` REFERENCES `profiles(id)`
*   **Indexes:** Primary Key on `id`
*   **Classification:** **REMOVE** (Succeeded by the robust `ai_conversations` engine inside the SaaS layer).

#### 1.16 `media`
*   **Row Count:** 0
*   **Columns:**
    *   `id` (uuid, PK)
    *   `shop_id` (uuid)
    *   `product_id` (uuid)
    *   `provider` (text)
    *   `url` (text)
    *   `external_id` (text)
    *   `title` (text)
    *   `created_at` (timestamptz)
*   **Foreign Keys:**
    *   `shop_id` REFERENCES `shops(id)`
    *   `product_id` REFERENCES `products(id)`
*   **Indexes:** Primary Key on `id`
*   **Classification:** **REMOVE** (Unified into the robust `media_folders` and `media_assets` of the modular file extension framework).

---

## 2. ESMARC Database v1 Schema Blueprint

Here is the unified, authoritative schema definition. It merges **Base Core**, **Enterprise SaaS Extensions**, and **Core Commerce Phase-2** into a single cohesive script.

It resolves all conflicting schemas cleanly:
- **Unified Profiles**: One `profiles` table mapped directly to `auth.users(id)` and including `system_role`.
- **Structured E-Commerce**: Clean boundaries between `products`, `product_categories`, `product_variants`, `shop_themes`, and `shop_settings`.
- **Enterprise Features**: Complete definitions for feature flags, AI routing, integrations, audits, media, and location maps.

### SQL DDL For Reconciled ESMARC DB v1

```sql
-- ============================================================================
-- ESMARC UNIFIED DATABASE SCHEMA - VERSION 1.0.0
-- Platform-first, Multi-tenant Enterprise SaaS Architecture
-- ============================================================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TYPE/ENUM DECLARATIONS
CREATE TYPE feature_status_enum AS ENUM ('enabled', 'disabled', 'coming_soon', 'beta');
CREATE TYPE feature_visibility_enum AS ENUM ('public', 'hidden', 'internal');
CREATE TYPE subscription_tier_enum AS ENUM ('free', 'starter', 'pro', 'business', 'enterprise');

-- ============================================================================
-- 1. AUTHENTICATION & GLOBAL PLATFORM SETTINGS
-- ============================================================================

-- Profiles (Linked 1:1 to Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  system_role TEXT NOT NULL DEFAULT 'user', -- 'super_admin', 'user'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Platform-wide Global Configurations
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscription tiers available for shops
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  max_products INT NOT NULL DEFAULT 100,
  max_storage_mb NOT NULL DEFAULT 1024,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Globally published custom store themes
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  base_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  price DECIMAL(10,2) DEFAULT 0.00,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. TENANCY LAYER (SHOPS)
-- ============================================================================

-- Multi-tenant Shops
CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  active_theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'archived'
  logo_url TEXT,
  banner_url TEXT,
  tagline TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions Registry (Explicit link table)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'trailing', 'cancelled', 'expired'
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Whitelisted/uniquely custom domains connected to shop routes
CREATE TABLE IF NOT EXISTS shop_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  domain TEXT UNIQUE NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shop member roles (Multi-tenant authorization)
CREATE TABLE IF NOT EXISTS shop_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff', -- 'owner', 'admin', 'manager', 'staff'
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shop_id, user_id)
);

-- Specific Theme configurations purchased/configured by a shop
CREATE TABLE IF NOT EXISTS shop_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  custom_config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Settings explicitly holding currency and timezone
CREATE TABLE IF NOT EXISTS shop_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL UNIQUE REFERENCES shops(id) ON DELETE CASCADE,
  currency TEXT NOT NULL DEFAULT 'USD',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  settings JSONB DEFAULT '{}'::jsonb, -- dynamic properties e.g., general, tax, shipping formulas
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. PRODUCT, CATEGORIES, INVENTORY, & CUSTOMERS MODULE
-- ============================================================================

-- Product categories within shop
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  UNIQUE(shop_id, slug)
);

-- Product Catalog
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'archived'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Multi-option product variants (E.g. Size/Color stock items)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "Large RED", etc
  sku TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product and variants image links
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT DEFAULT 0
);

-- Track adjustments to physical stock levels
CREATE TABLE IF NOT EXISTS inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  change INT NOT NULL,
  new_stock INT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers Profiles unique per Shop
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers shipping/billing locations
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false
);

-- ============================================================================
-- 4. ORDER & FULFILLMENT MANAGEMENT
-- ============================================================================

-- High-speed orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'fulfilled', 'cancelled'
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_status TEXT NOT NULL DEFAULT 'unpaid', -- 'unpaid', 'paid', 'refunded'
  payment_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Individual items billed in purchase orders
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00
);

-- ============================================================================
-- 5. SAAS CONFIGURATION & FEATURE FLAGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS feature_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES feature_categories(id) ON DELETE SET NULL,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  status feature_status_enum NOT NULL DEFAULT 'disabled',
  visibility feature_visibility_enum NOT NULL DEFAULT 'public',
  required_tier subscription_tier_enum NOT NULL DEFAULT 'free',
  is_beta BOOLEAN NOT NULL DEFAULT false,
  config_schema JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shop_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  status feature_status_enum NOT NULL DEFAULT 'enabled',
  config_values JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shop_id, feature_id)
);

CREATE TABLE IF NOT EXISTS plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(plan_id, feature_id)
);

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  rule_clause JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shop_id, feature_id)
);

-- ============================================================================
-- 6. INTEGRATIONS & AI AGENTS FRAMEWORK
-- ============================================================================

CREATE TABLE IF NOT EXISTS integration_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  config_schema JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES integration_providers(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shop_id, provider_id)
);

CREATE TABLE IF NOT EXISTS integration_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  account_name TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shop_id, external_id)
);

CREATE TABLE IF NOT EXISTS integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL,
  status TEXT NOT NULL,
  payload JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  api_endpoint TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES ai_providers(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  system_instructions TEXT NOT NULL,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_output_tokens INT DEFAULT 2048,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE SET NULL,
  task_id UUID REFERENCES ai_tasks(id) ON DELETE SET NULL,
  prompt_tokens INT NOT NULL DEFAULT 0,
  completion_tokens INT NOT NULL DEFAULT 0,
  cost_estimate DECIMAL(10,6) NOT NULL DEFAULT 0.000000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. LOCATION & AUDITS PLATFORM
-- ============================================================================

CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT,
  country TEXT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  phone_number TEXT,
  hours_of_operation JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  module TEXT NOT NULL,
  previous_state JSONB DEFAULT '{}'::jsonb,
  new_state JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. EXTENDED MEDIA, AR, & BACKGROUND JOBS
-- ============================================================================

CREATE TABLE IF NOT EXISTS media_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES media_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shop_id, parent_id, name)
);

CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES media_folders(id) ON DELETE SET NULL,
  asset_type TEXT NOT NULL,
  name TEXT NOT NULL,
  size_bytes INT NOT NULL,
  mime_type TEXT NOT NULL,
  url TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_pk UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ar_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  format TEXT NOT NULL,
  file_url TEXT NOT NULL,
  scale_multiplier DECIMAL(6,4) DEFAULT 1.0000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ar_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES ar_assets(id) ON DELETE CASCADE,
  poly_count INT DEFAULT 0,
  is_optimized BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ar_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  duration_seconds INT NOT NULL DEFAULT 0,
  device_info TEXT,
  interaction_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS location_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  media_asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
  category TEXT DEFAULT 'interior',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  retry_count INT NOT NULL DEFAULT 0,
  max_retries INT NOT NULL DEFAULT 3,
  queue_name TEXT NOT NULL DEFAULT 'default',
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  log_level TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  cron_expression TEXT NOT NULL,
  job_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 9. PERFORMANCE & TENANCY INDEXES
-- ============================================================================

-- Fast Multi-Tenant queries (Tenant Isolation filters)
CREATE INDEX idx_shops_plan_id ON shops(plan_id);
CREATE INDEX idx_shop_domains_shop_id ON shop_domains(shop_id);
CREATE INDEX idx_shop_members_shop_id ON shop_members(shop_id);
CREATE INDEX idx_shop_members_user_id ON shop_members(user_id);
CREATE INDEX idx_shop_themes_shop_id ON shop_themes(shop_id);
CREATE INDEX idx_product_categories_shop_id ON product_categories(shop_id);
CREATE INDEX idx_products_shop_id ON products(shop_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_inventory_logs_variant_id ON inventory_logs(variant_id);
CREATE INDEX idx_customers_shop_id ON customers(shop_id);
CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX idx_orders_shop_id ON orders(shop_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_variant_id ON order_items(variant_id);

-- System Indexes
CREATE INDEX idx_features_key ON features(key);
CREATE INDEX idx_features_status_visibility ON features(status, visibility);
CREATE INDEX idx_shop_features_shop_id ON shop_features(shop_id);
CREATE INDEX idx_shop_features_feature_id ON shop_features(feature_id);
CREATE INDEX idx_plan_features_plan_id ON plan_features(plan_id);
CREATE INDEX idx_integrations_shop_id ON integrations(shop_id);
CREATE INDEX idx_integration_accounts_shop_id ON integration_accounts(shop_id);
CREATE INDEX idx_integration_logs_shop_id ON integration_logs(shop_id);
CREATE INDEX idx_ai_agents_shop_id ON ai_agents(shop_id);
CREATE INDEX idx_ai_conversations_shop_id ON ai_conversations(shop_id);
CREATE INDEX idx_ai_tasks_shop_id ON ai_tasks(shop_id);
CREATE INDEX idx_ai_usage_logs_shop_id ON ai_usage_logs(shop_id);
CREATE INDEX idx_media_folders_shop_id ON media_folders(shop_id);
CREATE INDEX idx_media_assets_shop_id ON media_assets(shop_id);
CREATE INDEX idx_media_usage_shop_id ON media_usage(shop_id);
CREATE INDEX idx_ar_assets_shop_id ON ar_assets(shop_id);
CREATE INDEX idx_ar_sessions_shop_id ON ar_sessions(shop_id);
CREATE INDEX idx_locations_shop_id ON locations(shop_id);
CREATE INDEX idx_activity_logs_shop_id ON activity_logs(shop_id);
CREATE INDEX idx_audit_logs_shop_id ON audit_logs(shop_id);
CREATE INDEX idx_security_logs_shop_id ON security_logs(shop_id);
CREATE INDEX idx_notifications_shop_id ON notifications(shop_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_feature_settings_shop_id ON feature_settings(shop_id);
CREATE INDEX idx_jobs_shop_id ON jobs(shop_id);
CREATE INDEX idx_jobs_status_scheduled ON jobs(status, scheduled_at);
```

---

## 3. Frontend Mock Data Sources Inventory

To ensure complete, robust operation under real hardware connections, we mapped all UI rendering screens that actively fetch or utilize client-side-only mock state variables or local stores.

| Screen / Component | File Path | Mock Data Source Name | Target Unified Table |
| :--- | :--- | :--- | :--- |
| **All Shop Admin Panels** | `/src/App.tsx` | Fallback Shop Directory arrays config | `shops` |
| **Features Flag Management**| `/src/components/SuperAdminFeatureFlagScreen.tsx` | Hand-coded metrics & logs arrays | `features`, `shop_features`, `audit_logs` |
| **Shop Custom Features** | `/src/components/ShopOwnerFeatureCenter.tsx` | Inline `mock_key` objects | `shop_features` |
| **General Logs View** | `/src/components/AuditLogViewer.tsx` | Unfiltered local list generator | `audit_logs`, `activity_logs`, `security_logs` |

---

## 4. API Endpoints Returning Mock Data

While many Express controllers are configured with Supabase queries, they fall back to in-memory state when those tables are empty or missing. Other endpoints are entirely un-wired.

### 4.1 Fully Mocked/In-Memory Endpoints
These endpoints query `platformStore` in `/src/config/mock-db.ts` or local in-memory variables and must be rebuilt:

*   `GET /api/v1/variants` (`getVariant` / `variants.repository.ts`)
*   `POST /api/v1/variants` (`createVariant` / `variants.repository.ts`)
*   `PATCH /api/v1/variants/:id` (`updateVariant` / `variants.repository.ts`)
*   `DELETE /api/v1/variants/:id` (`deleteVariant` / `variants.repository.ts`)
*   `GET /api/v1/shopify` (`getShopById` / `tenant.repository.ts`)

### 4.2 Hybrid/Auto-Fallback Endpoints
These endpoints in `/src/modules/saas/saas.repository.ts` check if `supabaseAdmin` exists/is configured and automatically switch to in-memory arrays like `featuresMem` or `providersMem` as fallbacks:

*   `GET /api/v1/saas/features` -> Queries in-memory `featuresMem`
*   `POST /api/v1/saas/features` -> Modifies in-memory `featuresMem`
*   `GET /api/v1/saas/integrations` -> Queries in-memory `providersMem` / `integrationsMem`
*   `GET /api/v1/saas/ai/agents` -> Queries in-memory `aiAgentsMem`
*   `GET /api/v1/saas/media` -> Queries in-memory `mediaAssetsMem`
*   `GET /api/v1/saas/ar` -> Queries in-memory `arAssetsMem`
*   `GET /api/v1/saas/locations` -> Queries in-memory `locationsMem`
*   `GET /api/v1/saas/jobs` -> Queries in-memory `systemJobsMem`
*   `GET /api/v1/saas/logs/audit` -> Queries in-memory `auditLogsMem`
*   `GET /api/v1/saas/settings` -> Queries in-memory `platformSettingsMem` / `shopSettingsMem`

---

## 5. Mock-to-Supabase Data Migration Master Plan

To smoothly shift both the app's frontend and custom backend server from local memory to real persistent Supabase REST tables, we deploy a **four-stage migration strategy**.

```text
+-----------------------------+
|  Stage 1: Consolidation     |  --> Run DDL in Supabase Editor
+-----------------------------+
               |
               v
+-----------------------------+
|  Stage 2: Repos Rewrite     |  --> Remove RAM memory fallbacks
+-----------------------------+
               |
               v
+-----------------------------+
|  Stage 3: Frontend Sync     |  --> Wire loading, error, auth pipelines
+-----------------------------+
               |
               v
+-----------------------------+
|  Stage 4: Seed & Launch     |  --> Populate defaults (Features, plans)
+-----------------------------+
```

### Stage 1: Schema Ingestion & Consolidation
1.  **Backup Existing Data** (if any). Since row counts are currently 0, safe to overwrite.
2.  **Run v1 DDL Script**: Copy the *ESMARC Database v1 Schema* SQL script directly into the Supabase SQL Editor and execute it to populate all tables and indexes.
3.  **Deploy Row-Level Security (RLS)**: Enforce security rules using the tenant-isolation policies template.

### Stage 2: Repository Cleanup & Alignment
Remove the `isMock` and `...Mem` fallbacks from `/src/modules/saas/saas.repository.ts` and `/src/modules/variants/variants.repository.ts`. Guide them to throw descriptive database errors instead of quiet RAM defaults:

*Example showing the transition from RAM fallback to true Supabase client query:*
```typescript
// BEFORE:
export const getFeatures = async () => {
  if (isMock) return featuresMem;
  const { data, error } = await supabaseAdmin.from('features').select('*');
  return data;
};

// AFTER (Stable Phase):
export const getFeatures = async () => {
  const { data, error } = await supabase.from('features').select('*, feature_categories(*)');
  if (error) {
     console.error('[DATABASE] failed fetching features:', error.message);
     throw new Error(`Features lookup failed: ${error.message}`);
  }
  return data;
};
```

### Stage 3: Frontend-to-Backend State Alignment
1.  Update the user authentication context `/src/database/supabase.client.ts` to hook directly into the profile lookup stream upon auth changes.
2.  Add loader state indicators across the SuperAdmin, Tenant, and ShopOwner UI dashboards to handle slow database fetching (cold-start requests).
3.  Implement localized React state bounds with fallback empty states (e.g. "No products found in this category") instead of relying on hardcoded arrays.

### Stage 4: Default Content Seeding
Assemble the base data values required to unlock functionality:
1.  **AI Providers**: Seed `gemini` (Google Gemini Core), `openai`, and `claude`.
2.  **Integration Providers**: Seed keys like `youtube`, `tiktok`, `instagram`, and `facebook`.
3.  **Plans & Themes**: Seed default plans ('Free', 'Pro', 'Enterprise') and basic theme options ('Cosmic Slate').
4.  **Core Features**: Seed the 23 standard modular feature keys (e.g., `orders`, `products`, `booking_system`, etc.).
