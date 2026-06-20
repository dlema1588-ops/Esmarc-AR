import { Router } from 'express';
import * as tenantController from './tenant.controller';

const router = Router();

router.get('/shops/current', tenantController.getCurrentShop);
router.get('/products', tenantController.getProducts);
router.post('/products', tenantController.createProduct);
router.get('/customers', tenantController.getCustomers);
router.get('/orders', tenantController.getOrders);
router.post('/orders', tenantController.createOrder);

export default router;
