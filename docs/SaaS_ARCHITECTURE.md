# ESMARC Enterprise SaaS Platform Architecture
This document details the complete backend & frontend architecture for the multi-tenant SaaS transformation of ESMARC. The system is designed to scale to **100,000+ shops**, **millions of active users**, high-concurrency AI operations, spatial AR delivery, and multi-mode business configurations (Retail, Restaurant, Clinic, School, Media, Future AI Agents).

---

## 1. Entity Relationship (ERD) Map & Database Architecture

The system utilizes PostgreSQL (via Supabase) with complete relational integrity, primary keys, foreign keys, explicit indexes, and strict multi-tenant isolation. All tables belong directly to standard relational chains:

```
[profiles] (Global User Accounts)
    │
    ├───► [platform_settings] (Global Configurations)
    │
    └───► [shop_members] (Multitenant RBAC Assignment) ◄─────────┐
             │                                                    │
             ▼                                                    │
[plans] ◄─── [shops] (Tenant Core) ◄─── [themes]                 │
  │            │ │ │                                              │
  │            │ │ ├───► [shop_domains] (Custom CNAME Routing)   │
  │            │ │ └───► [shop_settings] (Modular JSON Parameters)│
  │            │ │                                                │
  │            │ ├───► [features] (SaaS Capabilities Core)         │
  │            │ │         ▲                                      │
  │            │ │         │                                      │
  │            │ │         ├───► [plan_features]                  │
  │            │ │         └───► [shop_features] (Overrides)      │
  │            │ │                                                │
  │            │ ├───► [integration_providers]                    │
  │            │ │         │                                      │
  │            │ │         ▼                                      │
  │            │ ├────── [integrations] ──► [integration_accounts]│
  │            │ │                                                │
  │            │ ├───► [ai_agents] ──► [ai_conversations]         │
  │            │ │                                                │
  │            │ ├───► [media_folders] ──► [media_assets]         │
  │            │ │                                                │
  │            │ ├───► [locations] ──► [location_assets]          │
  │            │ │                                                │
  │            │ ├───► [jobs] ──► [job_logs]                      │
  │            │ │                                                │
  │            │ └───► [activity/audit/security_logs]             │
  │            │                                                  │
  └────────────┴──────────────────────────────────────────────────┘
```

### Critical Keys & Cascading Strategy:
1. **Tenant Isolation (`shop_id`)**: Every tenant-owned table incorporates `shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE`. No database transaction may span across different tenants without explicit Super Admin role permissions.
2. **Cascaded Deletions**: 
   - Deleting a `shop` automatically wipes domains, custom theme overrides, registered product variants, integrations, and ongoing background jobs.
   - Deleting a `profile` cascades to delete associated `shop_members` roles but reserves order historical transactions (linked via `customer_id SET NULL`).
3. **Optimized Indexes**:
   - `idx_shop_features_shop_id` + `idx_shop_features_feature_id` for fast capability lookups during tenant requests.
   - `idx_jobs_status_scheduled` for efficient broker task polling.
   - `idx_integrations_shop_id` + `idx_media_assets_shop_id` for modular UI listings.

---

## 2. Dynamic SaaS Feature Flag Architecture

The Feature Flag System determines merchant access dynamically based on their subscription tier, with manual Super Admin override configurations.

### Evaluation Workflow:
```
Request Received (with x-shop-id)
   │
   ▼
1. Fetch Global Feature definition (Required Tier, Visibility, Beta flag)
   │
   ▼
2. Compare Current Shop Plan Tier with Feature minimum required Tier
   │
   ├─► Required Tier > Current Plan  ──► Lock Badge (Upgrade Required)
   │
   ▼
3. Query [shop_features] table for customized Tenant Overrides
   │
   ├─► Override found: 'enabled'     ──► Bypasses Tier limits (Force On)
   ├─► Override found: 'disabled'    ──► Bypasses Tier limits (Force Off)
   │
   ▼
4. Check visibility metrics
   │
   ├─► 'internal' Visibility         ──► Restricts access to Super Admins only
   │
   ▼
5. Inject Custom JSON [feature_settings] parameters directly into the context
```

---

## 3. API Endpoint Inventory & Middleware Protection

All communication uses standard REST APIs exposed on port `3000`. Endpoint security is enforced via layered express middlewares:

```
[CLIENT REQUEST]
       │
       ▼
   [authMiddleware] (Validates Supabase JWT, binds req.app.locals.userId)
       │
       ▼
   [tenantMiddleware] (Asserts req.headers['x-shop-id'], sets req.app.locals.shopId)
       │
       ├─────────────────────────────────┐ (Scope: System Admin)
       ▼                                 ▼ (Scope: Standard Tenant)
[requireSuperAdmin]             [requireShopAdmin]
       │                                 │
  /api/v1/admin/*                  /api/v1/saas/*
```

### Registered Endpoint Map:

| API Method | Route Path | Authorized Roles | Functionality / Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/saas/features` | Public / Tenants | Lists all global services inside the system |
| **POST** | `/api/v1/saas/features` | `super_admin` | Creates/registers a platform-wide capability flag |
| **PATCH** | `/api/v1/saas/features/:id` | `super_admin` | Modifies feature tier structures, statuses or visibilities |
| **GET** | `/api/v1/saas/shop-features` | `shop_admin`, `staff` | Fetches active feature maps scoped to the calling merchant |
| **POST** | `/api/v1/saas/shop-features/:id` | `super_admin` | Applies custom override status/JSON config to a shop |
| **GET** | `/api/v1/saas/integrations/providers` | Public / Tenants | Lists all third-party systems in the marketplace |
| **GET** | `/api/v1/saas/integrations` | `shop_owner` | Lists status of custom api bindings for a merchant |
| **POST** | `/api/v1/saas/integrations/:id` | `shop_owner` | Toggles or edits credentials for API pipelines |
| **POST** | `/api/v1/saas/ai/agents` | `shop_owner` | Registers custom fine-tuning system instructions and metrics |
| **GET** | `/api/v1/saas/media` | `staff`, `manager` | Explores direct files and shoppable streaming URL folders |
| **POST** | `/api/v1/saas/media` | `staff`, `manager` | Catalogues direct media asset reference metadata |
| **GET** | `/api/v1/saas/locations` | `manager`, `staff` | Returns coordinate pins mapping physical storefronts |
| **GET** | `/api/v1/saas/jobs` | `super_admin`, `merchant` | Monitors status details on background asynchronous events |
| **POST** | `/api/v1/saas/jobs` | `shop_owner` | Queues immediate optimization, sync or email tasks |
| **GET** | `/api/v1/saas/audit` | `super_admin`, `shop_owner` | Audits system actions, database mutations, and security events |

---

## 4. Scalability, Performance & Multi-Tenant Isolation Analysis

To maintain sub-50ms query speeds with 100,000+ shops and millions of requests, ESMARC establishes the following design pattern:

### A. Horizontal Partitioning & Database Sharding
- **Row Level Security (RLS)** is enabled on all tables:
  ```sql
  CREATE POLICY tenant_isolation_policy ON shop_features 
  FOR ALL USING (shop_id = current_setting('app.current_tenant_id')::UUID);
  ```
- As database size exceeds 2TB, tables are horizontally partitioned using Postgres list partitioning, mapping `shop_id` blocks to dedicated tenant tablespace volumes.

### B. Scalable Caching Strategy
- To prevent heavy relational joins during active requests, **Redis caching** is layered at the middleware.
- **Cache Format**: Features, plan configurations, and custom settings maps are compiled into compressed JSON hashes:
  ```
  Hash Key: esmarc:features:shop:<shop_id>
  Expiry Time: TTL 3600 seconds (invalidated immediately on /api/v1/saas/shop-features modification)
  ```

### C. Rate-Limiting & Fair Use
- Heavy features (AI prompt completions, AR render metadata uploads, geolocation map geosearch lookups) are bound by the platform settings quotas.
- Limits are determined by the contract plan:
  - **Free Tier**: 50 API requests per minute.
  - **Enterprise Plan**: 10,000 API requests per minute with failover ingress gates.

---

## 5. Implementation Achievements

### Backend (Express + Supabase):
1. **Dynamic SaaS Repository**: Set up standard, robust API queries using the Supabase Service Role client in `/src/modules/saas/saas.repository.ts`.
2. **Fallback Memory Broker**: Integrates zero-dependency resilient caches that automatically capture actions if local database bindings are initializing or mocked.
3. **Structured Controllers**: Structured controllers handle user auth bindings (`req.app.locals`) and express-validation chains.
4. **Endpoint Mount**: Successfully mounted the routers inside `/server.ts` alongside existing ecommerce routes.

### Frontend (React v18 + Vite):
1. **Perspective Switcher Panel**: Added an interactive Select console at the top of the main drawer allowing programmers to dynamically swing between global system Super Admin mode and local Merchant Shop Owner mode.
2. **Super Admin Flag Management Screen**: Displays features lists, registers new keys, edits minimum subscription plans and schedules manually customized overrides per shop ID.
3. **SaaS Dashboard Hub**: Houses high-fidelity tab workspaces enabling merchants to test connected integrations (YouTube reels, OpenAI pipelines), manage AI system instructions, upload media, register operating coords, queue asynchronous workers, and inspect security audits.
4. **Green Test Compiles**: Successfully verified TypeScript syntax, modules, and import structures using `lint_applet` and `compile_applet`.

---

## 6. Phased Migration Strategy: Blue/Green Enterprise Rollout

To transition existing merchants from the monothilic MVP architecture to the multi-tenant ESMARC Saas system with zero downtime, the following rolling rollout strategy is implemented:

### Phase I: Schema Extension & Background Sync (Days 1–3)
- Execute `/database/schema-saas.sql` scripts on active Supabase instances to generate SaaS tables, RLS structures, and index lists. Existing tables remain entirely untouched.
- Boot up background jobs to generate a `shop_settings` and `shop_features` baseline registry for existing tenants.

### Phase II: Dual-Write Setup (Days 4–7)
- Deploy backend server container updates containing the SaaS repositories.
- Code controllers to operate in "dual-write" mode: writing coordinates, media assets, and integration secrets of old structures to the new table models simultaneously, using background worker tasks.

### Phase III: Target Verification & Read Swing (Days 8–10)
- Super Admin audits and compares record counts between old tables and the new SaaS extended tablespaces.
- Run canary releases (routing 5% of merchants to read settings and maps directly from the SaaS schema layers). Once logs report no permission failures, scale canary release incrementally up to 100%.

### Phase IV: Cleanup & RLS Locking (Days 11–12)
- Deprecate old relational maps columns.
- Lock all tables behind the tenant RLS policies, enforcing strict horizontal tenancy barriers globally.
