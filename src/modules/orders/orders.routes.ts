import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../../middlewares/validate.middleware';
import * as ordersController from './orders.controller';
import { requireShopAdmin } from '../../middlewares/rbac.middleware';

const router = Router();

router.use(requireShopAdmin);

router.get('/', ordersController.getOrders);
router.get('/:id', ordersController.getOrderById);

router.post('/', 
  [
    body('customer_id').isString().notEmpty(),
    body('total').isNumeric().notEmpty(),
    body('items').isArray().notEmpty()
  ], 
  validate, 
  ordersController.createOrder
);

router.post('/:id/cancel', ordersController.cancelOrder);
router.post('/:id/fulfill', ordersController.fulfillOrder);

export default router;
