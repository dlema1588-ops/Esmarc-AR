-- ============================================================================
-- ESMARC Enterprise OS: Workspace Foundation Platform Schema (v2.0)
-- REBUILD: Rebuilding the entire database around Workspace ➔ Website ➔ Modules.
-- DESCRIPTION: Enforces workspace level isolation using workspace_id on every table.
-- ============================================================================

-- Clean namespaces
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS website_modules CASCADE;
DROP TABLE IF EXISTS websites CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;

-- 1. BASE SYSTEM & WORKSPACES
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) NOT NULL UNIQUE,
  workspace_type VARCHAR(50) NOT NULL, -- e.g., 'restaurant', 'clinic', 'school', 'blog', 'ecommerce'
  owner_id UUID NOT NULL, -- references auth.users(id)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workspaces_subdomain ON workspaces(subdomain);
CREATE INDEX idx_workspaces_type ON workspaces(workspace_type);

-- 2. DYNAMIC WEBSITES ATTACHED TO WORKSPACE
CREATE TABLE websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  theme_primary VARCHAR(50) NOT NULL DEFAULT 'indigo',
  theme_dark BOOLEAN NOT NULL DEFAULT false,
  hero_title VARCHAR(255),
  hero_subtitle TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_websites_workspace_id ON websites(workspace_id);

-- 3. ENABLABLE FEATURE MODULES MATRIX OR REPOSITORY
CREATE TABLE website_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  module_key VARCHAR(100) NOT NULL, -- e.g., 'catalog', 'ordering', 'scheduling', 'blogging', 'ar_viewer'
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, module_key)
);

CREATE INDEX idx_website_modules_composite ON website_modules(workspace_id, is_enabled);

-- 4. PRODUCTS INDEX (ECOMMERCE & RESTAURANT ORDERING)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  image_url TEXT,
  category VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_tenant_category ON products(workspace_id, category);

-- 5. ORDERS (ECOMMERCE & RESTAURANTS checkout ledger)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(150) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'canceled'
  items JSONB NOT NULL, -- details of items purchased
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_tenant_status ON orders(workspace_id, status);

-- 6. APPOINTMENTS (CLINICAL WORKSPACES / SCHEDULING CALENDARS)
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  patient_name VARCHAR(100) NOT NULL,
  doctor_name VARCHAR(100) NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'canceled'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_tenant_schedule ON appointments(workspace_id, scheduled_at);

-- 7. SCHOOL MODULES & ENROLLMENT CURRICULUMS
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_weeks INT DEFAULT 4,
  instructor VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_tenant ON courses(workspace_id);

-- 8. EDITORIAL ARTICLES (BLOGS & NEWS OUTLETS)
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  author VARCHAR(100),
  image_url TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_tenant_published ON blog_posts(workspace_id, published_at);

-- 9. LISTINGS (DIRECTORIES, MARKETPLACES, REAL ESTATE COs)
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  location VARCHAR(200),
  category VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listings_composite ON listings(workspace_id, category, price);

-- 10. SOCIAL CHATS & COMMUNITY THREADS
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  author VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_community_posts_tenant ON community_posts(workspace_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) FOR MULTI-TENANT ISOLATION
-- EXPLANATION: Uses custom claims / HTTP headers (x-workspace-id) passed on PostgREST
-- ============================================================================

-- Helper variable extraction function
CREATE OR REPLACE FUNCTION get_current_workspace_id() 
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('request.headers', true)::jsonb->>'x-workspace-id', '')::uuid;
EXCEPTION 
  WHEN OTHERS THEN 
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tenant-owned tables
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Apply Tenant Isolation Policies (Strict filtering)
CREATE POLICY tenant_isolation_websites ON websites 
  FOR ALL USING (workspace_id = get_current_workspace_id());

CREATE POLICY tenant_isolation_website_modules ON website_modules 
  FOR ALL USING (workspace_id = get_current_workspace_id());

CREATE POLICY tenant_isolation_products ON products 
  FOR ALL USING (workspace_id = get_current_workspace_id());

CREATE POLICY tenant_isolation_orders ON orders 
  FOR ALL USING (workspace_id = get_current_workspace_id());

CREATE POLICY tenant_isolation_appointments ON appointments 
  FOR ALL USING (workspace_id = get_current_workspace_id());

CREATE POLICY tenant_isolation_courses ON courses 
  FOR ALL USING (workspace_id = get_current_workspace_id());

CREATE POLICY tenant_isolation_blog_posts ON blog_posts 
  FOR ALL USING (workspace_id = get_current_workspace_id());

CREATE POLICY tenant_isolation_listings ON listings 
  FOR ALL USING (workspace_id = get_current_workspace_id());

CREATE POLICY tenant_isolation_community_posts ON community_posts 
  FOR ALL USING (workspace_id = get_current_workspace_id());
