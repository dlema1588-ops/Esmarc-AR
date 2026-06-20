# Workspace-Centric Platform Architecture Migration Blueprint
**Document Version:** 1.0.0  
**Author:** Senior SaaS Platform Architect, Senior Database Engineer, Senior React Engineer, & Senior Supabase Architect  
**Classification:** Strategic Technical Specification — Confidential  

---

## Executive Summary

This blueprint outlines the complete transformation of the SaaS core platform from a **Shop-Centric tenant model** into a highly extensible, multi-vertical **Workspace-Centric architecture**. 

By dismantling the hard assumption that every tenant is a shop, we re-establish the platform’s root engine around generic **Workspaces**. Vertical-specific capabilities (such as Ecommerce, Restaurants, Clinics, Schools, and media companies) are converted into modular, hot-pluggable **Business Modules** that can be enabled dynamically per workspace.

---

## 1. Current Database Assessment & Audit

### 1.1 Existing Database Constraints and Terminology
Our current schema operates under a strict double-tier hierarchy: `profiles` and `shops`. Core tables contain tight couplings with commerce terminology (e.g., `shop_id` foreign keys, `shop_stats`, and `shop_members`). 

```
[Profile (User)] ─── belongs to ───► [Shop] ─── owns ───► [Products, Orders, Subscriptions]
```

### 1.2 Table-by-Table Redesign Classification

| Current Table Name | Action | Target / Replacement Name | Business Module / Core Domain | Reason for Classification |
| :--- | :--- | :--- | :--- | :--- |
| `shops` | **RENAME** | `workspaces` | Platform Core | The root tenant container representing any type of organization, brand, or tenant. |
| `shop_members` | **RENAME** | `workspace_members` | Platform Core | Governs multi-user membership, invitation states, and role-based access to a workspace. |
| `shop_stats` | **RENAME** | `workspace_stats` | Platform Core | Stores raw system stats (views, module configuration totals, storage utilization). |
| `subscriptions` | **RENAME** | `workspace_subscriptions` | Platform Core | Decouples subscription plans from commerce-only features, binding plans to workspaces. |
| `shop_features` | **RENAME** | `workspace_features` | Platform Core | Custom override ledger for allowing specific features across individual workspaces. |
| `contact_messages` | **KEEP** | `workspace_contact_messages` | Platform Core | Standardized, vertical-agnostic communication line between tenants and external visitors. |
| `profiles` | **KEEP** | `profiles` | Platform Core | Individual authenticated user metadata (linked to Supabase `auth.users`). |
| `notifications` | **KEEP** | `notifications` | Platform Core | Trans-vertical user-facing event dispatch queue. |
| `system_messages` | **KEEP** | `system_messages` | Platform Core | Broadcast notification table for admin announcements. |
| `products` | **MODULARIZE** | `ecommerce_products` | Ecommerce Module | Belongs strictly to the product-selling layout. Extracted from the default workspace core. |
| `product_variants` | **MODULARIZE** | `ecommerce_product_variants` | Ecommerce Module | Size, color, SKU variants are domain-specific to physical/digital commerce catalogs. |
| `product_images` | **MODULARIZE** | `ecommerce_product_images` | Ecommerce Module | Asset references tied directly to the shopping collection. |
| `orders` | **MODULARIZE** | `ecommerce_orders` | Ecommerce Module | Ledger tracking transactions, customer checkout, and commercial details. |
| `order_items` | **MODULARIZE** | `ecommerce_order_items` | Ecommerce Module | Line-item join table for mapping products/variants inside commerce checkouts. |
| `inventory_logs` | **MODULARIZE** | `ecommerce_inventory_logs` | Ecommerce Module | Storage audit log specifically mapping product inventory changes. |
| `customers` | **MODULARIZE** | `ecommerce_customers` | Ecommerce Module | Tracks buyers/commerce clients separate from the global system authenticated `profiles`.|
| `media` | **MODULARIZE** | `workspace_media` | Media / Core Assets | Generic media storage registry (e.g., streaming provider configs). |
| `conversations` | **MODULARIZE** | `workspace_conversations` | Communication Module | Message roots for support and client chats. |
| `messages` | **MODULARIZE** | `workspace_messages` | Communication Module | Individual messages mapped to communications. |

---

## 2. Workspace-Centric Architecture Design

### 2.1 The New Hierarchical Architecture
The new architecture introduces a highly decoupled multi-user, multi-tenant hierarchy. A `User` can belong to multiple `Workspaces` with different permissions tailored for specific operational environments.

```
       [Supabase Auth User] ─────────────── joins ──────────────┐
               │                                                ▼
       ┌───────▼───────┐                              ┌──────────────────┐
       │   PROFILES    │                              │ WORKSPACE_MEMBERS│
       └───────┬───────┘                              └────────┬─────────┘
               │                                               │
               │ belongs to                                    │ maps roles/perms
               ▼                                               ▼
     ┌──────────────────────────────────────────────────────────────────┐
     │                            WORKSPACES                            │
     │                      (The Root Tenant Entity)                     │
     └──────────────────────────────────────────────────────────────────┘
       │                │                   │                  │
       ▼                ▼                   ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ ┌────────────────┐
│  ECOMMERCE   │ │  RESTAURANT  │ │      CLINIC      │ │     SCHOOL     │
│   MODULE     │ │   MODULE     │ │      MODULE      │ │     MODULE     │
│ - Products   │ │ - Menus      │ │ - Appointments   │ │ - Courses      │
│ - Orders     │ │ - Tables     │ │ - Patients       │ │ - Exams        │
│ - Inventory  │ │ - Bookings   │ │ - Records        │ │ - Enrollments  │
└──────────────┘ └──────────────┘ └──────────────────┘ └────────────────┘
```

### 2.2 Workspace Type Support
Under the updated model, the `workspace_type` attribute inside the `workspaces` table determines the default onboarding pathway, layout, and suggested pre-installed modules:
*   **ecommerce:** Online merchants selling physical/digital items.
*   **restaurant:** Food services managing menus, visual QR tables, and food delivery orders.
*   **clinic:** Health practices managing electronic health records (EHR), appointments, and doctor profiles.
*   **school:** Educational hubs managing classes, student cohorts, quizzes, and course material.
*   **portfolio:** Creators exhibiting galleries, media folders, and brief biographical summaries.
*   **agency:** Consultants managing project schedules and service catalogs.
*   **media:** Creators offering podcasts, blogs, video clips, and premium memberships.
*   **ngo:** Non-profits directing donations, public campaigns, and community event listings.
*   **custom:** Custom setups with an open canvas for installing handpicked module stacks.

---

## 3. Core Platform Tables Specification

This section outlines the exact schemas for the highly optimized Core Platform Tables, prepared to be deployed directly on Supabase PostgreSQL.

### 3.1 Table: `workspaces`
```sql
CREATE TABLE public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    subdomain VARCHAR(255) UNIQUE,
    custom_domain VARCHAR(255) UNIQUE,
    workspace_type VARCHAR(50) NOT NULL DEFAULT 'custom',
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'on_hold'
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_workspaces_slug ON public.workspaces(slug);
CREATE INDEX idx_workspaces_subdomain ON public.workspaces(subdomain) WHERE subdomain IS NOT NULL;
CREATE INDEX idx_workspaces_type ON public.workspaces(workspace_type);
```

### 3.2 Table: `workspace_members`
```sql
CREATE TABLE public.workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'manager', 'editor', 'member', 'viewer', 'guest'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'invited', 'suspended'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (workspace_id, user_id)
);

CREATE INDEX idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace ON public.workspace_members(workspace_id);
```

### 3.3 Table: `workspace_domains`
```sql
CREATE TABLE public.workspace_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    domain VARCHAR(255) UNIQUE NOT NULL,
    is_primary BOOLEAN DEFAULT false NOT NULL,
    verification_token VARCHAR(255),
    verification_status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- 'verified', 'pending', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_workspace_domains_workspace ON public.workspace_domains(workspace_id);
```

### 3.4 Table: `workspace_settings`
```sql
CREATE TABLE public.workspace_settings (
    workspace_id UUID PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}'::jsonb NOT NULL,
    enabled_modules VARCHAR(100)[] DEFAULT '{}'::varchar[] NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 3.5 Table: `workspace_subscriptions`
```sql
CREATE TABLE public.workspace_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    plan VARCHAR(100) NOT NULL, -- 'free', 'basic', 'premium', 'enterprise'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'paused', 'canceled', 'past_due'
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    billing_cycle_anchor TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_workspace_subs_workspace ON public.workspace_subscriptions(workspace_id);
```

---

## 4. Business Modules Partitioning

To avoid monolith pollution, database tables are structured cleanly into modular groups. Only relevant tables are initiated or queried depending on which modules are enabled in a workspace's configuration.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 CORE MODULE PLATFORM                                   │
│ - workspaces          - workspace_members        - workspace_domains                   │
│ - workspace_settings  - workspace_subscriptions  - profiles                            │
└─────────────────────────────────────┬──────────────────────────────────────────────────┘
                                      │
  ┌───────────────────────────────────┼──────────────────────────────────┐
  ▼                                   ▼                                  ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌──────────────────────────┐
│    ECOMMERCE MODULE     │ │    RESTAURANT MODULE    │ │      CLINIC MODULE       │
│ - ecommerce_products    │ │ - restaurant_menus      │ │ - medical_appointments   │
│ - ecommerce_variants     │ │ - restaurant_items      │ │ - medical_patients       │
│ - ecommerce_orders      │ │ - restaurant_tables     │ │ - medical_practitioners  │
│ - ecommerce_order_items │ │ - restaurant_bookings   │ │ - medical_records        │
│ - ecommerce_customers   │ │                         │ │                          │
└─────────────────────────┘ └─────────────────────────┘ └──────────────────────────┘
```

### 4.1 Ecommerce Module
*   `ecommerce_products`: Product titles, descriptions, categories.
*   `ecommerce_product_variants`: Stock level per SKU, colors, sizes.
*   `ecommerce_orders`: Invoices, shipping info, payment statuses.
*   `ecommerce_order_items`: Quantities and pricing snapshots of items sold.
*   `ecommerce_customers`: Merchant-specific contact indexes of buyers.

### 4.2 Restaurant Module
*   `restaurant_menus`: Categories of dishes, happy-hour schedules.
*   `restaurant_items`: Price, description, allergens, and dietary tags of food items.
*   `restaurant_tables`: Location-specific, qr-scannable dining tables with physical capacities.
*   `restaurant_bookings`: Time-slotted restaurant reservations.

### 4.3 Clinic Module
*   `medical_practitioners`: Doctors, clinic profiles, credentials, specialties.
*   `medical_patients`: Basic contact information and medical chart tags.
*   `medical_appointments`: Schedules, check-in statuses, virtual video session links.
*   `medical_records`: Secure, encrypted physician notes.

### 4.4 School Module
*   `education_courses`: Course descriptions, syllabus, duration.
*   `education_modules`: Divided weekly lessons, video links, attached PDFs.
*   `education_enrollments`: Student grades, tracking timestamps.
*   `education_quizzes`: Interactive question banks.

### 4.5 Media Module
*   `media_articles`: Blog articles, newsletters, markdown content.
*   `media_shows`: Podcasts, episodes, and serialized content matrices.
*   `media_memberships`: Paywalls, locked access flags, tier requirements.

### 4.6 AI Module
*   `ai_providers`: Integration keys for models.
*   `ai_agents`: Specialized assistant prompts and persona specifications.
*   `ai_conversations`: Conversational history threads bound to a workspace context.

---

## 5. Database Migration Plan (Supabase PostgreSQL)

### 5.1 Step-by-Step SQL Migration Script
This migration script converts the existing `shops` schema to the generic `workspace` pattern while preserving all active records, rows, and relations safely without downtime.

```sql
-- START TRANSACTION
BEGIN;

-- 1. Rename Core Tables
ALTER TABLE public.shops RENAME TO workspaces;
ALTER TABLE public.shop_members RENAME TO workspace_members;
ALTER TABLE public.shop_stats RENAME TO workspace_stats;
ALTER TABLE public.subscriptions RENAME TO workspace_subscriptions;
ALTER TABLE public.shop_features RENAME TO workspace_features;

-- 2. Rename Column Fields in Core Tables
ALTER TABLE public.workspaces RENAME COLUMN business_type TO workspace_type;

-- 3. Adjust Foreign Keys & Columns in Sub-Tables
ALTER TABLE public.workspace_members RENAME COLUMN shop_id TO workspace_id;
ALTER TABLE public.workspace_stats RENAME COLUMN shop_id TO workspace_id;
ALTER TABLE public.workspace_subscriptions RENAME COLUMN shop_id TO workspace_id;
ALTER TABLE public.workspace_features RENAME COLUMN shop_id TO workspace_id;

-- 4. Modularize Ecommerce Tables & Rename their shop_id foreign keys
ALTER TABLE public.products RENAME TO ecommerce_products;
ALTER TABLE public.ecommerce_products RENAME COLUMN shop_id TO workspace_id;

ALTER TABLE public.orders RENAME TO ecommerce_orders;
ALTER TABLE public.ecommerce_orders RENAME COLUMN shop_id TO workspace_id;

ALTER TABLE public.order_items RENAME TO ecommerce_order_items;

-- 5. Rename Foreign Keys in remaining dependent modules
ALTER TABLE public.contact_messages RENAME TO workspace_contact_messages;
ALTER TABLE public.workspace_contact_messages RENAME COLUMN shop_id TO workspace_id;

ALTER TABLE public.conversations RENAME TO workspace_conversations;
ALTER TABLE public.workspace_conversations RENAME COLUMN shop_id TO workspace_id;
ALTER TABLE public.workspace_conversations RENAME COLUMN customer_id TO profile_id;

ALTER TABLE public.media RENAME TO workspace_media;
ALTER TABLE public.workspace_media RENAME COLUMN shop_id TO workspace_id;

ALTER TABLE public.notifications RENAME COLUMN user_id TO profile_id;

-- 6. Re-create Indexes to reflect Workspace nomenclature
DROP INDEX IF EXISTS idx_shops_slug;
CREATE INDEX idx_workspaces_slug ON public.workspaces(slug);
CREATE INDEX idx_workspaces_type ON public.workspaces(workspace_type);

-- 7. Update System Functions & RLS Triggers
CREATE OR REPLACE FUNCTION public.handle_new_workspace_member() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.workspace_members(workspace_id, user_id, role, status)
    VALUES (NEW.id, NEW.owner_id, 'owner', 'active');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-wire trigger for automatic owner registration
DROP TRIGGER IF EXISTS on_workspace_created ON public.workspaces;
CREATE TRIGGER on_workspace_created
    AFTER INSERT ON public.workspaces
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_workspace_member();

COMMIT;
-- END TRANSACTION
```

### 5.2 Supabase Row Level Security (RLS) Policy Adjustments
The policies must be adapted from `shop_id` checks to leverage `workspace_id` and ensure multi-tenant boundary isolation:

```sql
-- Enable RLS on Workspaces and Members
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Workspace Read Policy: Accessible if user is registered as a member of the workspace
CREATE POLICY select_workspace ON public.workspaces
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.workspace_members WHERE workspace_id = id
        )
    );

-- Workspace Write Policy: Limit updates strictly to Owner or Admin roles
CREATE POLICY update_workspace ON public.workspaces
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.workspace_members 
            WHERE workspace_id = id AND role IN ('owner', 'admin')
        )
    );
```

---

## 6. Frontend Refactor Plan

To completely eradicate shop references across our React Vite application, we must map out every key component, hook, routing structure, and context coordinate.

### 6.1 Route Migration Map
```
Current Route Layout                      ►   New Refactored Route Layout
------------------------------------------│---------------------------------------------
/shop/:shopId                             │   /workspace/:workspaceId
/shop/:shopId/dashboard                   │   /workspace/:workspaceId/dashboard
/shop/:shopId/settings                    │   /workspace/:workspaceId/settings
/shop/:shopId/members                     │   /workspace/:workspaceId/members
/shop/:shopId/analytics                   │   /workspace/:workspaceId/analytics
/shop/:shopId/features                    │   /workspace/:workspaceId/features
/admin/shops                              │   /super-admin/workspaces
```

### 6.2 Frontend Code Renaming Map

| Original Visual Label / Component | Target Generic Label / Component | Target Core Module Path | Notes / Behavioral Impact |
| :--- | :--- | :--- | :--- |
| `ShopOwnerFeatureCenter.tsx` | `WorkspaceFeatureCenter.tsx` | `/src/components/` | Core layout dashboard for toggling vertical modules. |
| `SuperAdminFeatureFlagScreen.tsx`| `SuperAdminWorkspaceControl.tsx`| `/src/components/` | Super admin workstation to verify, inspect, and suspend workspaces. |
| `Shop Dashboard` | `Workspace Dashboard` | Header Visual Label | Dynamic overview reflecting the relevant `workspace_type`. |
| `Shop Settings` | `Workspace Settings` | Tab Pane Label | Configures domains, billing profiles, and basic settings. |
| `x-shop-id` Header | `x-workspace-id` Header | API Fetch Client Interceptors | Attached to every outbound request to identify the target tenant. |

### 6.3 State Hook Conversion
We will introduce a highly optimized, state-synchronized context `WorkspaceProvider` and state hooks:

```typescript
// Proposed implementation signature (src/types/workspace.ts)
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  workspaceType: 'ecommerce' | 'restaurant' | 'clinic' | 'school' | 'custom';
  status: 'active' | 'suspended';
  ownerId: string;
}

// React UseWorkspace custom hook
export const useActiveWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useActiveWorkspace must be used inside a WorkspaceProvider');
  }
  return {
    workspace: context.activeWorkspace,
    workspaceId: context.activeWorkspace?.id,
    modules: context.enabledModules
  };
};
```

---

## 7. Backend Refactor Plan

All Node.js/Express controllers, services, database wrappers, and routing middleware must transition to workspace semantics.

### 7.1 Namespace and File Rename Strategy

| Current Filename | New Filename | API Route Prefix | Domain Context |
| :--- | :--- | :--- | :--- |
| `shops.controller.ts` | `workspaces.controller.ts` | `/api/v1/workspaces` | Workspace setup, domain mappings, and general info. |
| `shops.service.ts` | `workspaces.service.ts` | In-process Service | Transaction bindings, initialization, and deletion hooks. |
| `saas.repository.ts` | `workspaces.repository.ts` | Repository Pattern | Handles workspace-associated database accesses. |
| `tenant.middleware.ts` | `workspace.middleware.ts` | Express Middleware | Extracts `x-workspace-id` and queries the active workspace settings. |
| `rbac.middleware.ts` | `rbac.middleware.ts` | RBAC Middleware | Validates claims against the requested `workspace_id`. |

### 7.2 Core Middleware Adaptation
The tenant detection logic is refactored from `shop_id` extraction to a bulletproof workspace validation parser:

```typescript
// Proposed src/middlewares/workspace.middleware.ts
import { Request, Response, NextFunction } from 'express';
export const workspaceContextHandler = async (req: Request, res: Response, next: NextFunction) => {
  const workspaceId = req.headers['x-workspace-id'] as string;
  if (!workspaceId) {
    return res.status(400).json({ success: false, message: 'x-workspace-id header is required.' });
  }
  req.workspaceId = workspaceId;
  next();
};
```

---

## 8. Role-Based Access Control (RBAC) Architecture

Under the new paradigm, generic roles represent structural administrative levels, avoiding vertical constraints.

```
                  ┌──────────────────────────────────────────────┐
                  │                 OWNER / ADMIN                │
                  │ - Full control over Workspace, billing, etc  │
                  └──────────────────────┬───────────────────────┘
                                         │
                  ┌──────────────────────┴──────────────────────┐
                  │                    MANAGER                  │
                  │ - Manages business configurations, settings │
                  └──────────────────────┬───────────────────────┘
                                         │
                  ┌──────────────────────┴──────────────────────┐
                  │                EDITOR / MEMBER              │
                  │ - Operates the day-to-day module inputs     │
                  └─────────────────────────────────────────────┘
```

### 8.1 Detailed Role Hierarchy Table

| Target Role | Access Level | Permitted Actions | Restricted Actions |
| :--- | :--- | :--- | :--- |
| **owner** | Full Root Ownership | Account deletion, domain transfers, billing management, role updates. | None. |
| **admin** | High Administration | Member onboarding, module installations, domain edits, API keys configs. | Workspace deletion, updating owner roles. |
| **manager** | Operational Coordinator| Modules settings configs, general operations, inventory tracking, items updates.| Membership removals, plan upgrades. |
| **editor** | Content Producer | Product insertions, dish pricing modifications, appointment scheduler inputs. | General workspace setting modifications. |
| **member** | Standard Staff | Internal dashboard access, viewing operational metrics, log entries. | Editing price tiers or settings. |
| **viewer** | Read-Only Inspector | Inspection of workspace boards, active analytics views. | Writes of any kind. |
| **guest** | Sandbox Restricted | Viewing specific whitelisted features if explicitly granted. | General workspace dashboard reads. |

---

## 9. Shared Storage Bucket Spec

To scale effectively, the system will use a streamlined multi-tenant resource path structure within a single persistent, global Supabase Storage bucket.

### 9.1 Path Resolution Diagram
```
supabase-storage/
  └── [bucket: workspace-assets]
        ├── [dir: workspace-0192a83b-3129-4e12-b11c-c9012aab741d]
        │     ├── branding/
        │     │     ├── logo.png
        │     │     └── favicon.ico
        │     ├── ecommerce/
        │     │     ├── product_hero_image.png
        │     │     └── thumbnail_variant.jpg
        │     └── restaurant/
        │           ├── menu_pdf.pdf
        │           └── dish_closeup.webp
        │
        └── [dir: workspace-023a859c-8519-218a-a11c-d9012bba741e]
              ├── branding/
              │     └── logo_white.png
              └── clinic/
                    └── doctor_profile.jpg
```

---

## 10. Dashboard Implementations

### 10.1 Super Admin Workspace Control Center
The workspace control center switches from simply tracking shop inventories to managing multi-tenant subscription tiers, storage footprints, and performance metrics across the entire platform.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ SUPER ADMIN WORKSPACE CONTROL CENTER                                             │
├──────────────────────────────────────────────────────────────────────────────────┤
│ METRIC OVERVIEW:                                                                 │
│ Total Workspaces: 1,420 | Active: 1,390 | Suspended: 30                          │
│ API Requests (24h): 12.4M | AI Cost: $214.20 | Storage Footprint: 452 GB         │
├──────────────────────────────────────────────────────────────────────────────────┤
│ WORKSPACES DIRECTORY:                                                            │
│ Search: [ Query... ]          Tiers: [ All Plans ]       Status: [ Active ]      │
├──────────────────────────────────────────────────────────────────────────────────┤
│ Workspace Name    │ Main Subdomain │ vertical-Type │ Active Modules   │ Status   │
├───────────────────┼────────────────┼───────────────┼──────────────────┼──────────┤
│ Green Hills Care  │ greenhills.co  │ clinic        │ EHR, scheduler  │ Active   │
│ Tech Academy      │ techschool.edu │ school        │ LMS, quizzes     │ Active   │
│ Brooklyn Fork     │ bkfork.rest    │ restaurant    │ Menu, orders     │ Active   │
│ Urban Threads     │ urbanthreads.co│ ecommerce     │ Products, order  │ Suspended│
└───────────────────┴────────────────┴───────────────┴──────────────────┴──────────┘
```

### 10.2 Tenant Workspace Dashboard
The modular dashboard displays custom analytics cards matching the installed modules configuration.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  WORKSPACE: GREEN HILLS CARE  [ Plan: Tier 2 Premium ] [ Vertical: CLINIC ]            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ INSTALLED MODULES: [X] EHR & Patients   [X] Appointments   [ ] Ecommerce Checkout      │
├───────────────────────────────────────┬────────────────────────────────────────────────┤
│ METRICS:                              │ GENERAL CONFIGURATION:                         │
│ Active Patient Accounts: 4,120        │ Subdomain: greenhills.platform.sh              │
│ Completed Sessions (Monthly): 1,220   │ Custom DNS: secure.greenhillscare.org          │
│ Upcoming Visits (Today): 42           │ Integrations: Calendly, Stripe Pay             │
└───────────────────────────────────────┴────────────────────────────────────────────────┘
```

---

## 11. Comprehensive List of Affected Files

This index catalogues every file across our current database schema and code files that require updates to complete the Workspace Migration.

### 11.1 Directory: `/database` & `/src/database`
*   `database/schema.sql` — Modify basic tenant structural constraints.
*   `database/schema-saas.sql` — Perform extensive rename operations on SaaS tables.
*   `src/database/schema-phase2.sql` — Rename nested ecommerce relations.
*   `src/database/supabase.client.ts` — Adapt initialization defaults.

### 11.2 Directory: `/src/modules`
*   `src/modules/shops/shops.service.ts` → Rename file to `src/modules/workspaces/workspaces.service.ts`.
*   `src/modules/tenant/tenant.controller.ts` → Rename file to `src/modules/tenant/tenant.controller.ts` (methods mapped to workspaces).
*   `src/modules/tenant/tenant.repository.ts` → Rename file to `src/modules/tenant/tenant.repository.ts` (references mapped to workspaces).
*   `src/modules/tenant/tenant.routes.ts` → Update endpoint names.
*   `src/modules/products/products.repository.ts` — Adjust references from `shop_id` to `workspace_id`.
*   `src/modules/products/products.controller.ts` — Swap out `x-shop-id` for `x-workspace-id`.
*   `src/modules/variants/variants.repository.ts` — Adapt data schema hooks.
*   `src/modules/orders/orders.repository.ts` — Adapt checkout triggers.
*   `src/modules/saas/saas.repository.ts` — Re-adjust in-memory array fallbacks.
*   `src/modules/storage/storage.repository.ts` — Implement `workspace-assets/{workspace_id}/` mapping paths.

### 11.3 Directory: `/src/middlewares`
*   `src/middlewares/auth.middleware.ts` — Update Super Admin permissions validation hook.
*   `src/middlewares/rbac.middleware.ts` — Move from `shop_members` evaluation checks to `workspace_members`.
*   `src/middlewares/tenant.middleware.ts` → Rename to `workspace.middleware.ts` to implement `x-workspace-id` extraction.

### 11.4 Directory: `/src/components` & UI Entrypoints
*   `src/components/ShopOwnerFeatureCenter.tsx` → Rename to `WorkspaceOwnerFeatureCenter.tsx`.
*   `src/components/SuperAdminFeatureFlagScreen.tsx` → Rename to `SuperAdminWorkspaceControl.tsx`.
*   `src/App.tsx` — Transition standard visual labels and navigation parameters.
