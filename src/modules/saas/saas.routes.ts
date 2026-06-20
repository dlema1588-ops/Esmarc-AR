import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../../middlewares/validate.middleware';
import * as saasController from './saas.controller';

const router = Router();

// ============================================================================
// 1. FEATURE MANAGEMENT ENDPOINTS
// ============================================================================
router.get('/features', saasController.getAllFeatures);

router.post('/features',
  [
    body('key').isString().notEmpty().withMessage('key must be unique string'),
    body('name').isString().notEmpty(),
    body('status').isIn(['enabled', 'disabled', 'coming_soon', 'beta']),
    body('visibility').isIn(['public', 'hidden', 'internal']),
    body('required_tier').isIn(['free', 'starter', 'pro', 'business', 'enterprise'])
  ],
  validate,
  saasController.createFeature
);

router.patch('/features/:id',
  [
    param('id').isUUID().withMessage('id must be valid UUID')
  ],
  validate,
  saasController.updateFeature
);

router.get('/shop-features', saasController.getShopFeatures);

router.post('/shop-features/:featureId',
  [
    param('featureId').isUUID(),
    body('status').isIn(['enabled', 'disabled', 'coming_soon', 'beta']),
    body('config_values').isObject().optional()
  ],
  validate,
  saasController.updateShopFeatureOverride
);

// ============================================================================
// 2. INTEGRATION FRAMEWORK ENDPOINTS
// ============================================================================
router.get('/integrations/providers', saasController.getIntegrationProviders);
router.get('/integrations', saasController.getShopIntegrations);
router.post('/integrations/:providerId',
  [
    param('providerId').isUUID(),
    body('is_enabled').isBoolean(),
    body('config').isObject().optional()
  ],
  validate,
  saasController.toggleIntegration
);

// ============================================================================
// 3. AI FOUNDATION ENDPOINTS
// ============================================================================
router.get('/ai/providers', saasController.getAIProviders);
router.get('/ai/agents', saasController.getShopAIAgents);
router.post('/ai/agents',
  [
    body('provider_id').isUUID(),
    body('name').isString().notEmpty(),
    body('agent_type').isIn(['assistant', 'customer_service', 'copilot']),
    body('system_instructions').isString().notEmpty(),
    body('temperature').isFloat({ min: 0.0, max: 2.0 }).optional(),
    body('max_output_tokens').isInt({ min: 1, max: 10000 }).optional()
  ],
  validate,
  saasController.createAIAgent
);

// ============================================================================
// 4. MEDIA VAULT ENDPOINTS
// ============================================================================
router.get('/media', saasController.getMediaAssets);
router.post('/media',
  [
    body('asset_type').isIn(['image', 'video', 'audio', 'document']),
    body('name').isString().notEmpty(),
    body('size_bytes').isInt({ min: 0 }),
    body('mime_type').isString().notEmpty(),
    body('url').isString().notEmpty(),
    body('metadata').isObject().optional()
  ],
  validate,
  saasController.uploadMediaAssetMetadata
);

// ============================================================================
// 5. AR SYSTEM ENDPOINTS
// ============================================================================
router.get('/ar', saasController.getARAssets);
router.post('/ar',
  [
    body('product_id').isUUID(),
    body('name').isString().notEmpty(),
    body('format').isIn(['gltf', 'usdz', 'obj-mtl']),
    body('file_url').isString().isURL(),
    body('scale_multiplier').isFloat({ min: 0.0001, max: 100.0 }).optional()
  ],
  validate,
  saasController.createARAssetMetadata
);

// ============================================================================
// 6. GEOLOCATION MAP ENDPOINTS
// ============================================================================
router.get('/locations', saasController.getLocations);
router.post('/locations',
  [
    body('name').isString().notEmpty(),
    body('address_line_1').isString().notEmpty(),
    body('city').isString().notEmpty(),
    body('country').isString().notEmpty(),
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 })
  ],
  validate,
  saasController.createLocation
);

// ============================================================================
// 7. BACKGROUND JOBS SCHEDULER
// ============================================================================
router.get('/jobs', saasController.getBackgroundJobs);
router.post('/jobs',
  [
    body('job_type').isIn(['email_send', 'ai_process', 'aggregate_analytics', 'social_publish', 'image_optimize']),
    body('payload').isObject().withMessage('Payload must be valid params JSON')
  ],
  validate,
  saasController.createBackgroundJob
);

// ============================================================================
// 8. UNIFIED AUDIT AND LEDGER ENDPOINTS
// ============================================================================
router.get('/audit', saasController.getAuditingLogs);

// ============================================================================
// 9. CONFIGURATIONS AND SETTINGS ENDPOINTS
// ============================================================================
router.get('/settings/platform', saasController.getPlatformSettings);
router.post('/settings/platform',
  [
    body('key').isString().notEmpty(),
    body('value').notEmpty()
  ],
  validate,
  saasController.updatePlatformSetting
);

router.get('/settings/shop', saasController.getShopSettings);
router.post('/settings/shop', saasController.updateShopSettings);

export default router;
