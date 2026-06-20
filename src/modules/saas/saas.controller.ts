import { Request, Response, NextFunction } from 'express';
import * as saasRepository from './saas.repository';

// Standardized error wrapping helper for controller safety
const handleAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'An unexpected SaaS modules error occurred',
        error
      });
    }
  };
};

// ============================================================================
// FEATURE CHANNELS CONTROLLERS
// ============================================================================

export const getAllFeatures = handleAsync(async (req: Request, res: Response) => {
  const d = await saasRepository.getFeatures();
  res.json({ success: true, message: 'All features loaded', data: d });
});

export const createFeature = handleAsync(async (req: Request, res: Response) => {
  const d = await saasRepository.createFeature(req.body);
  // Log the audit event for Super Admin action
  await saasRepository.createAuditLog({
    shop_id: req.body.shop_id || null,
    actor_id: req.app.locals.userId || null,
    module: 'features',
    new_state: d
  });
  res.status(201).json({ success: true, message: 'Feature created successfully', data: d });
});

export const updateFeature = handleAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const d = await saasRepository.updateFeature(id, req.body);
  await saasRepository.createAuditLog({
    actor_id: req.app.locals.userId || null,
    module: 'features',
    new_state: { id, updates: req.body }
  });
  res.json({ success: true, message: 'Feature updated successfully', data: d });
});

export const getShopFeatures = handleAsync(async (req: Request, res: Response) => {
  const shopId = req.headers['x-shop-id'] as string || req.app.locals.shopId;
  if (!shopId) {
    res.status(400).json({ success: false, message: 'x-shop-id header is required for shop scope' });
    return;
  }
  const d = await saasRepository.getShopFeatures(shopId);
  res.json({ success: true, message: 'Shop features loaded', data: d });
});

export const updateShopFeatureOverride = handleAsync(async (req: Request, res: Response) => {
  const shopId = req.headers['x-shop-id'] as string || req.app.locals.shopId;
  const { featureId } = req.params;
  const { status, config_values } = req.body;
  if (!shopId) {
    res.status(400).json({ success: false, message: 'x-shop-id header is required' });
    return;
  }
  const d = await saasRepository.assignFeatureToShop(shopId, featureId, status, config_values);
  
  // Auditing
  await saasRepository.createActivityLog({
    shop_id: shopId,
    actor_id: req.app.locals.userId || null,
    action: 'feature_override_updated',
    entity_type: 'feature',
    entity_id: featureId,
    details: { status, config_values }
  });

  res.json({ success: true, message: 'Shop feature override configured', data: d });
});

// ============================================================================
// INTEGRATION MATRIX CONTROLLERS
// ============================================================================

export const getIntegrationProviders = handleAsync(async (req: Request, res: Response) => {
  const d = await saasRepository.getIntegrationProviders();
  res.json({ success: true, message: 'Integration providers loaded', data: d });
});

export const getShopIntegrations = handleAsync(async (req: Request, res: Response) => {
  const shopId = req.headers['x-shop-id'] as string || req.app.locals.shopId;
  if (!shopId) {
    res.status(400).json({ success: false, message: 'x-shop-id header is required' });
    return;
  }
  const d = await saasRepository.getShopIntegrations(shopId);
  res.json({ success: true, message: 'Shop integrations loaded', data: d });
});

export const toggleIntegration = handleAsync(async (req: Request, res: Response) => {
  const shopId = req.headers['x-shop-id'] as string || req.app.locals.shopId;
  const { providerId } = req.params;
  const { is_enabled, config } = req.body;
  if (!shopId) {
    res.status(400).json({ success: false, message: 'x-shop-id header is required' });
    return;
  }
  const d = await saasRepository.toggleIntegration(shopId, providerId, is_enabled, config);
  
  await saasRepository.createActivityLog({
    shop_id: shopId,
    actor_id: req.app.locals.userId || null,
    action: is_enabled ? 'integration_enabled' : 'integration_disabled',
    entity_type: 'integration_provider',
    entity_id: providerId,
    details: { is_enabled }
  });

  res.json({ success: true, message: 'Integration settings toggled successfully', data: d });
});

// ============================================================================
// AI AGENTS CONTROLLERS
// ============================================================================

export const getAIProviders = handleAsync(async (req: Request, res: Response) => {
  const d = await saasRepository.getAIProviders();
  res.json({ success: true, message: 'AI providers loaded', data: d });
});

export const getShopAIAgents = handleAsync(async (req: Request, res: Response) => {
  const shopId = req.headers['x-shop-id'] as string || req.app.locals.shopId;
  if (!shopId) {
    res.status(400).json({ success: false, message: 'x-shop-id header is required' });
    return;
  }
  const d = await saasRepository.getShopAIAgents(shopId);
  res.json({ success: true, message: 'AI Agents loaded', data: d });
});

export const createAIAgent = handleAsync(async (req: Request, res: Response) => {
  const shopId = req.headers['x-shop-id'] as string || req.app.locals.shopId;
  if (!shopId) {
    res.status(400).json({ success: false, message: 'x-shop-id header is required' });
    return;
  }
  const agentData = { ...req.body, shop_id: shopId };
  const d = await saasRepository.createAIAgent(agentData);
  
  await saasRepository.createActivityLog({
    shop_id: shopId,
    actor_id: req.app.locals.userId || null,
    action: 'ai_agent_created',
    entity_type: 'ai_agent',
    entity_id: d.id,
    details: { name: d.name, agent_type: d.agent_type }
  });

  res.status(201).json({ success: true, message: 'AI Agent created successfully', data: d });
});

// ============================================================================
// MEDIA & STORAGE VAULT
// ============================================================================

export const getMediaAssets = handleAsync(async (req: Request, res: Response) => {
  const shopId = req.headers['x-shop-id'] as string || req.app.locals.shopId;
  if (!shopId) {
    res.status(400).json({ success: false, message: 'x-shop-id header is required' });
    return;
  }
  const d = await saasRepository.getMediaAssets(shopId);
  res.json({ success: true, message: 'Media assets loaded', data: d });
});

export const uploadMediaAssetMetadata = handleAsync(async (req: Request, res: Response) => {
  const shopId = req.headers['x-shop-id'] as string || req.app.locals.shopId;
  if (!shopId) {
    res.status(400).json({ success: false, message: 'x-shop-id header is required' });
    return;
  }
  const assetData = { ...req.body, shop_id: shopId };
  const d = await saasRepository.createMediaAsset(assetData);
  
  await saasRepository.createActivityLog({
    shop_id: shopId,
    actor_id: req.app.locals.userId || null,
    action: 'media_asset_registered',
    entity_type: 'media_asset',
    entity_id: d.id,
    details: { name: d.name, type: d.asset_type }
  });

  res.status(201).json({ success: true, message: 'Media asset metadata registered', data: d });
});

// ============================================================================
// AR CONTROLLERS
// ============================================================================

export const getARAssets = handleAsync(async (req: Request, res: Response) => {
  const shopId = req.headers['x-shop-id'] as string || req.app.locals.shopId;
  if (!shopId) {
    res.status(400).json({ success: false, message: 'x-shop-id header is required' });
    return;
  }
  const d = await saasRepository.getARAssets(shopId);
  res.json({ success: true, message: 'AR assets loaded', data: d });
});

export const createARAssetMetadata = handleAsync(async (req: Request, res: Response) => {
  const shopId = req.headers['x-shop-id'] as string || req.app.locals.shopId;
  if (!shopId) {
    res.status(400).json({ success: false, message: 'x-shop-id header is required' });
    return;
  }
  const assetData = { ...req.body, shop_id: shopId };
  const d = await saasRepository.createARAsset(assetData);
  
  await saasRepository.createActivityLog({
    shop_id: shopId,
    actor_id: req.app.locals.userId || null,
    action: 'ar_asset_registered',
    entity_type: 'ar_asset',
    entity_id: d.id,
    details: { name: d.name, format: d.format }
  });

  res.status(201).json({ success: true, message: 'AR spatial metadata generated', data: d });
});

// ============================================================================
// GEOLOCATION MAP CONTROLLERS
// ============================================================================

export const getLocations = handleAsync(async (req: Request, res: Response) => {
  const shopId = req.headers['x-shop-id'] as string || req.app.locals.shopId;
  if (!shopId) {
    res.status(400).json({ success: false, message: 'x-shop-id header is required' });
    return;
  }
  const d = await saasRepository.getLocations(shopId);
  res.json({ success: true, message: 'Shop branch locations loaded', data: d });
});

export const createLocation = handleAsync(async (req: Request, res: Response) => {
  const shopId = req.headers['x-shop-id'] as string || req.app.locals.shopId;
  if (!shopId) {
    res.status(400).json({ success: false, message: 'x-shop-id header is required' });
    return;
  }
  const locData = { ...req.body, shop_id: shopId };
  const d = await saasRepository.createLocation(locData);
  
  await saasRepository.createActivityLog({
    shop_id: shopId,
    actor_id: req.app.locals.userId || null,
    action: 'location_created',
    entity_type: 'location',
    entity_id: d.id,
    details: { name: d.name, city: d.city }
  });

  res.status(201).json({ success: true, message: 'Physical coordinates stored successfully', data: d });
});

// ============================================================================
// SYSTEM RUNTIME JOBS CONTROLLERS
// ============================================================================

export const getBackgroundJobs = handleAsync(async (req: Request, res: Response) => {
  const shopId = req.headers['x-shop-id'] as string || req.app.locals.shopId;
  // If request is from Super Admin dashboard, pass undefined to get all jobs. Otherwise, scope to merchant
  const d = await saasRepository.getJobs(req.app.locals.systemRole === 'super_admin' ? undefined : shopId);
  res.json({ success: true, message: 'Background scheduler jobs loaded', data: d });
});

export const createBackgroundJob = handleAsync(async (req: Request, res: Response) => {
  const shopId = req.headers['x-shop-id'] as string || req.app.locals.shopId;
  const jobData = { ...req.body, shop_id: shopId || null };
  const d = await saasRepository.createJob(jobData);
  res.status(201).json({ success: true, message: 'Asynchronous job queued inside background broker pool', data: d });
});

// ============================================================================
// AUDITING & SECURITY ANALYTICS
// ============================================================================

export const getAuditingLogs = handleAsync(async (req: Request, res: Response) => {
  const shopId = req.headers['x-shop-id'] as string || req.app.locals.shopId;
  const d = await saasRepository.getUnifiedActivityLogs(req.app.locals.systemRole === 'super_admin' ? undefined : shopId);
  res.json({ success: true, message: 'SaaS ledger logs loaded successfully', data: d });
});

// ============================================================================
// CONFIGURATION AND SETTINGS CONTROLLERS
// ============================================================================

export const getPlatformSettings = handleAsync(async (req: Request, res: Response) => {
  const d = await saasRepository.getPlatformSettings();
  res.json({ success: true, message: 'Platform config terms parsed', data: d });
});

export const updatePlatformSetting = handleAsync(async (req: Request, res: Response) => {
  const { key, value } = req.body;
  if (!key) {
    res.status(400).json({ success: false, message: 'Setting key is required' });
    return;
  }
  await saasRepository.updatePlatformSetting(key, value);
  await saasRepository.createAuditLog({
    actor_id: req.app.locals.userId || null,
    module: 'settings',
    new_state: { key, value }
  });
  res.json({ success: true, message: 'Global platform settings updated' });
});

export const getShopSettings = handleAsync(async (req: Request, res: Response) => {
  const shopId = req.headers['x-shop-id'] as string || req.app.locals.shopId;
  if (!shopId) {
    res.status(400).json({ success: false, message: 'x-shop-id header is required' });
    return;
  }
  const d = await saasRepository.getShopSettings(shopId);
  res.json({ success: true, message: 'Merchant parameters parsed successfully', data: d });
});

export const updateShopSettings = handleAsync(async (req: Request, res: Response) => {
  const shopId = req.headers['x-shop-id'] as string || req.app.locals.shopId;
  if (!shopId) {
    res.status(400).json({ success: false, message: 'x-shop-id header is required' });
    return;
  }
  const d = await saasRepository.updateShopSettings(shopId, req.body);
  
  await saasRepository.createActivityLog({
    shop_id: shopId,
    actor_id: req.app.locals.userId || null,
    action: 'shop_settings_updated',
    entity_type: 'shop_settings',
    details: req.body
  });

  res.json({ success: true, message: 'Merchant parameters set', data: d });
});
