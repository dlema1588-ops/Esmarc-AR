-- ESMARC Enterprise SaaS Database Schema extension
-- This schema establishes the base architecture for a scalable multi-tenant SaaS platform supporting e-commerce, restaurants, clinics, schools, and media businesses.

-- ============================================================================
-- 1. FEATURE FLAG & MANAGEMENT SYSTEM
-- ============================================================================

CREATE TYPE feature_status_enum AS ENUM ('enabled', 'disabled', 'coming_soon', 'beta');
CREATE TYPE feature_visibility_enum AS ENUM ('public', 'hidden', 'internal');
CREATE TYPE subscription_tier_enum AS ENUM ('free', 'starter', 'pro', 'business', 'enterprise');

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
  config_schema JSONB DEFAULT '{}'::jsonb, -- JSON Schema for any custom parameters
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shop_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  status feature_status_enum NOT NULL DEFAULT 'enabled', -- override general status per shop
  config_values JSONB DEFAULT '{}'::jsonb, -- custom parameters configured for this shop
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

-- For standalone flag metrics or quick check overrides
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE, -- if null, it's global
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  rule_clause JSONB DEFAULT '{}'::jsonb, -- conditional rules (e.g. geolocation, test audience)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shop_features_shop_id ON shop_features(shop_id);
CREATE INDEX idx_shop_features_feature_id ON shop_features(feature_id);
CREATE INDEX idx_plan_features_plan_id ON plan_features(plan_id);
CREATE INDEX idx_features_key ON features(key);
CREATE INDEX idx_features_status_visibility ON features(status, visibility);

-- ============================================================================
-- 2. INTEGRATION FRAMEWORK
-- ============================================================================

CREATE TABLE IF NOT EXISTS integration_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_key TEXT NOT NULL UNIQUE, -- 'youtube', 'tiktok', 'instagram', 'facebook', 'telegram', 'whatsapp', 'openai', 'gemini', 'claude', 'esmarc_ai'
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'social', 'messaging', 'ai', 'marketing'
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
  config JSONB DEFAULT '{}'::jsonb, -- encrypted/masked credentials in real life
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shop_id, provider_id)
);

-- Individual accounts connected under specific provider types
CREATE TABLE IF NOT EXISTS integration_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL, -- account id in third-party services
  account_name TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shop_id, external_id)
);

CREATE TABLE IF NOT EXISTS integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL, -- 'inbound', 'outbound'
  status TEXT NOT NULL, -- 'success', 'failure'
  payload JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_integrations_shop_id ON integrations(shop_id);
CREATE INDEX idx_integration_accounts_shop_id ON integration_accounts(shop_id);
CREATE INDEX idx_integration_logs_shop_id ON integration_logs(shop_id);

-- ============================================================================
-- 3. AI FOUNDATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_key TEXT NOT NULL UNIQUE, -- 'gemini', 'openai', 'claude', 'esmarc_llm'
  name TEXT NOT NULL,
  api_endpoint TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE, -- NULL means global/system default
  provider_id UUID NOT NULL REFERENCES ai_providers(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  agent_type TEXT NOT NULL, -- 'assistant', 'customer_service', 'copilot'
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
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL, -- optional links
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'closed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL, -- 'summarize', 'generate_product_desc', 'translate', 'seo_audit'
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
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

CREATE INDEX idx_ai_agents_shop_id ON ai_agents(shop_id);
CREATE INDEX idx_ai_conversations_shop_id ON ai_conversations(shop_id);
CREATE INDEX idx_ai_tasks_shop_id ON ai_tasks(shop_id);
CREATE INDEX idx_ai_usage_logs_shop_id ON ai_usage_logs(shop_id);

-- ============================================================================
-- 4. MEDIA FRAMEWORK
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
  asset_type TEXT NOT NULL, -- 'image', 'video', 'audio', 'document'
  name TEXT NOT NULL,
  size_bytes INT NOT NULL,
  mime_type TEXT NOT NULL,
  url TEXT NOT NULL, -- Can be external/S3 or raw YouTube/TikTok/External video URL
  metadata JSONB DEFAULT '{}'::jsonb, -- Resolution, length, duration etc
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'product', 'category', 'theme', 'blog_post'
  entity_pk UUID NOT NULL, -- generalized foreign key reference
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_folders_shop_id ON media_folders(shop_id);
CREATE INDEX idx_media_assets_shop_id ON media_assets(shop_id);
CREATE INDEX idx_media_usage_shop_id ON media_usage(shop_id);

-- ============================================================================
-- 5. AR FOUNDATION (AUGMENTED REALITY)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ar_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  format TEXT NOT NULL, -- 'gltf', 'usdz', 'obj-mtl'
  file_url TEXT NOT NULL, -- asset path in bucket
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
  interaction_type TEXT, -- 'view', 'snap', 'place'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ar_assets_shop_id ON ar_assets(shop_id);
CREATE INDEX idx_ar_sessions_shop_id ON ar_sessions(shop_id);

-- ============================================================================
-- 6. MAP FOUNDATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS map_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_key TEXT NOT NULL UNIQUE, -- 'google_maps', 'mapbox', 'esmarc_maps'
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS location_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  media_asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
  category TEXT DEFAULT 'interior', -- 'exterior', 'interior', 'menu', 'clinical'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_locations_shop_id ON locations(shop_id);

-- ============================================================================
-- 7. AUDIT & LOGGING SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE, -- Null check if system-wide
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- e.g., 'product_created', 'order_fulfilled', 'feature_toggled'
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
  module TEXT NOT NULL, -- 'billing', 'domain', 'staff', 'integrations'
  previous_state JSONB DEFAULT '{}'::jsonb,
  new_state JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'login_success', 'login_failed', 'permission_denied', 'api_key_rotated'
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  context JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_shop_id ON activity_logs(shop_id);
CREATE INDEX idx_audit_logs_shop_id ON audit_logs(shop_id);
CREATE INDEX idx_security_logs_shop_id ON security_logs(shop_id);

-- ============================================================================
-- 8. EXTENDED SETTINGS SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS shop_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE UNIQUE,
  settings JSONB DEFAULT '{}'::jsonb, -- unified modular settings mapping e.g., general, tax, shipping
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb, -- individual parameters tied specifically to the feature
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shop_id, feature_id)
);

CREATE INDEX idx_feature_settings_shop_id ON feature_settings(shop_id);

-- ============================================================
-- 9. BACKGROUND JOB SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE, -- Null means global/system
  job_type TEXT NOT NULL, -- 'email_send', 'ai_process', 'aggregate_analytics', 'social_publish', 'image_optimize'
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued', -- 'queued', 'running', 'completed', 'failed', 'retrying'
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
  log_level TEXT NOT NULL, -- 'info', 'warning', 'error'
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  cron_expression TEXT NOT NULL, -- e.g., '0 * * * *' (hourly)
  job_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_shop_id ON jobs(shop_id);
CREATE INDEX idx_jobs_status_scheduled ON jobs(status, scheduled_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES & ENFORCEMENT
-- ============================================================================

ALTER TABLE feature_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;

-- EXAMPLE GENERAL RLS POLICIES FOR TENANCY ISOLATION:
-- Since shops are divided among members, we query members to verify if the profile has access.

-- CREATE POLICY select_features ON features FOR SELECT USING (true); -- Global features readable by anyone
-- CREATE POLICY manage_features ON features FOR ALL USING (
--   EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.system_role = 'super_admin')
-- );

-- CREATE POLICY select_shop_features ON shop_features FOR SELECT USING (
--   EXISTS (SELECT 1 FROM shop_members WHERE shop_members.shop_id = shop_features.shop_id AND shop_members.profile_id = auth.uid())
--   OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.system_role = 'super_admin')
-- );
