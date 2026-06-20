// ESMARC Multi-tenant SaaS Core Type Definitions

// 1. Role-Based Access Control (RBAC) System
export type PlatformRole = 'super_admin' | 'user';

export type ShopRole = 'shop_owner' | 'shop_admin' | 'staff' | 'manager' | 'viewer';

export type ShopPermission =
  | 'manage_products'
  | 'manage_orders'
  | 'manage_staff'
  | 'manage_domains'
  | 'manage_billing'
  | 'manage_integrations'
  | 'manage_ai'
  | 'manage_marketing'
  | 'view_analytics';

// Role Permissions Inheritance Map
export const ROLE_PERMISSIONS: Record<ShopRole, ShopPermission[]> = {
  shop_owner: [
    'manage_products',
    'manage_orders',
    'manage_staff',
    'manage_domains',
    'manage_billing',
    'manage_integrations',
    'manage_ai',
    'manage_marketing',
    'view_analytics'
  ],
  shop_admin: [
    'manage_products',
    'manage_orders',
    'manage_staff',
    'manage_domains',
    'manage_integrations',
    'manage_ai',
    'manage_marketing',
    'view_analytics'
  ],
  manager: [
    'manage_products',
    'manage_orders',
    'manage_integrations',
    'manage_marketing',
    'view_analytics'
  ],
  staff: [
    'manage_products',
    'manage_orders',
    'view_analytics'
  ],
  viewer: [
    'view_analytics'
  ]
};

// 2. SaaS Feature Flag System
export type FeatureStatus = 'enabled' | 'disabled' | 'coming_soon' | 'beta';
export type FeatureVisibility = 'public' | 'hidden' | 'internal';
export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';

export interface FeatureCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Feature {
  id: string;
  category_id?: string;
  key: string;
  name: string;
  description?: string;
  status: FeatureStatus;
  visibility: FeatureVisibility;
  required_tier: SubscriptionTier;
  is_beta: boolean;
  config_schema?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ShopFeature {
  id: string;
  shop_id: string;
  feature_id: string;
  status: FeatureStatus;
  config_values?: Record<string, any>;
  created_at: string;
  updated_at: string;
  feature?: Feature;
}

export interface FeatureFlag {
  id: string;
  feature_id: string;
  shop_id?: string;
  is_enabled: boolean;
  rule_clause?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// 3. Integration Framework System
export type IntegrationCategory = 'social' | 'messaging' | 'ai' | 'marketing';

export interface IntegrationProvider {
  id: string;
  provider_key: string;
  name: string;
  category: IntegrationCategory;
  is_active: boolean;
  config_schema?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Integration {
  id: string;
  shop_id: string;
  provider_id: string;
  is_enabled: boolean;
  config?: Record<string, any>;
  created_at: string;
  updated_at: string;
  provider?: IntegrationProvider;
}

export interface IntegrationAccount {
  id: string;
  integration_id: string;
  shop_id: string;
  external_id: string;
  account_name: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IntegrationLog {
  id: string;
  shop_id: string;
  integration_id: string;
  direction: 'inbound' | 'outbound';
  status: 'success' | 'failure';
  payload?: any;
  error_message?: string;
  created_at: string;
}

// 4. AI Foundation Framework
export interface AIProvider {
  id: string;
  provider_key: string;
  name: string;
  api_endpoint?: string;
  is_active: boolean;
  created_at: string;
}

export interface AIAgent {
  id: string;
  shop_id?: string;
  provider_id: string;
  name: string;
  agent_type: 'assistant' | 'customer_service' | 'copilot';
  system_instructions: string;
  temperature: number;
  max_output_tokens: number;
  created_at: string;
  updated_at: string;
}

export interface AIConversation {
  id: string;
  shop_id: string;
  agent_id: string;
  customer_id?: string;
  status: 'active' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface AITask {
  id: string;
  shop_id: string;
  agent_id: string;
  task_type: 'summarize' | 'generate_product_desc' | 'translate' | 'seo_audit';
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface AIUsageLog {
  id: string;
  shop_id: string;
  agent_id: string;
  conversation_id?: string;
  task_id?: string;
  prompt_tokens: number;
  completion_tokens: number;
  cost_estimate: number;
  created_at: string;
}

// 5. Media Asset Framework
export type MediaType = 'image' | 'video' | 'audio' | 'document';

export interface MediaFolder {
  id: string;
  shop_id: string;
  parent_id?: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  shop_id: string;
  folder_id?: string;
  asset_type: MediaType;
  name: string;
  size_bytes: number;
  mime_type: string;
  url: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// 6. AR Foundation
export interface ARAsset {
  id: string;
  shop_id: string;
  product_id: string;
  name: string;
  format: 'gltf' | 'usdz' | 'obj-mtl';
  file_url: string;
  scale_multiplier: number;
  created_at: string;
}

export interface ARModel {
  id: string;
  shop_id: string;
  asset_id: string;
  poly_count: number;
  is_optimized: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ARSession {
  id: string;
  shop_id: string;
  customer_id?: string;
  product_id?: string;
  duration_seconds: number;
  device_info?: string;
  interaction_type?: string;
  created_at: string;
}

// 7. Map Foundation
export interface Location {
  id: string;
  shop_id: string;
  name: string;
  address_line_1: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  hours_of_operation?: Record<string, any>;
  created_at: string;
}

// 8. Background Job System
export interface Job {
  id: string;
  shop_id?: string;
  job_type: 'email_send' | 'ai_process' | 'aggregate_analytics' | 'social_publish' | 'image_optimize';
  payload: any;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'retrying';
  retry_count: number;
  max_retries: number;
  scheduled_at: string;
  created_at: string;
}

// 9. Audit Logging System
export interface AuditLog {
  id: string;
  shop_id: string;
  actor_id?: string;
  module: 'billing' | 'domain' | 'staff' | 'integrations';
  previous_state?: any;
  new_state?: any;
  created_at: string;
}
