import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../../middlewares/validate.middleware';
import * as productsController from './products.controller';
import { requireShopAdmin } from '../../middlewares/rbac.middleware';

const router = Router();

router.use(requireShopAdmin);

router.get('/', productsController.getProducts);
router.get('/:id', productsController.getProductById);

router.post('/', 
  [
    body('name').isString().notEmpty(),
    body('price').isNumeric().optional(),
    body('status').isString().optional()
  ], 
  validate, 
  productsController.createProduct
);

router.patch('/:id', 
  [
    body('name').isString().optional(),
    body('price').isNumeric().optional(),
    body('status').isString().optional()
  ], 
  validate, 
  productsController.updateProduct
);

router.delete('/:id', productsController.deleteProduct);

// Variants
router.post('/:id/variants', 
  [
    body('name').isString().notEmpty(),
    body('price').isNumeric().optional(),
    body('sku').isString().optional()
  ], 
  validate, 
  productsController.addVariant
);

router.patch('/variants/:id', 
  [
    body('name').isString().optional(),
    body('price').isNumeric().optional(),
    body('sku').isString().optional()
  ], 
  validate, 
  productsController.updateVariant
);

router.delete('/variants/:id', productsController.deleteVariant);

export default router;
