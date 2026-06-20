import { Router } from 'express';
import * as analyticsController from './analytics.controller';

const router = Router();

router.get('/revenue', analyticsController.getRevenueAnalytics);
router.get('/shops', analyticsController.getShopGrowthAnalytics);
router.get('/traffic', analyticsController.getTrafficAnalytics);

export default router;
