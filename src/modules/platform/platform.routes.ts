import { Router } from 'express';
import { body } from 'express-validator';
import { requireSuperAdmin } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import * as platformController from './platform.controller';

const router = Router();

// Stats
router.get('/stats', platformController.getStats);

// Shops
router.get('/shops', platformController.getShops);
router.get('/shops/:id', platformController.getShopById);
router.post('/shops', 
  [
    body('name').isString().notEmpty(),
    body('domain').isString().optional()
  ], 
  validate, 
  platformController.createShop
);
router.patch('/shops/:id', 
  [
    body('name').isString().optional(),
    body('status').isString().optional(),
    body('domain').isString().optional()
  ], 
  validate, 
  platformController.updateShop
);

// Plans
router.get('/plans', platformController.getPlans);
router.post('/plans', 
  [
    body('name').isString().notEmpty(),
    body('price').isNumeric().notEmpty()
  ], 
  validate, 
  platformController.createPlan
);
router.post('/plans/assign', 
  [
    body('shopId').isString().notEmpty(),
    body('planId').isString().notEmpty()
  ], 
  validate, 
  platformController.assignPlan
);

// Themes
router.get('/themes', platformController.getThemes);
router.post('/themes', 
  [
    body('name').isString().notEmpty()
  ], 
  validate, 
  platformController.createTheme
);
router.post('/themes/assign', 
  [
    body('shopId').isString().notEmpty(),
    body('themeId').isString().notEmpty()
  ], 
  validate, 
  platformController.assignTheme
);

// Settings
router.get('/settings', platformController.getSettings);

export default router;
