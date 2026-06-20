import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../../middlewares/validate.middleware';
import * as customersController from './customers.controller';
import { requireShopAdmin } from '../../middlewares/rbac.middleware';

const router = Router();

router.use(requireShopAdmin);

router.get('/', customersController.getCustomers);
router.get('/:id', customersController.getCustomerById);

router.post('/', 
  [
    body('name').isString().notEmpty(),
    body('email').isEmail().notEmpty()
  ], 
  validate, 
  customersController.createCustomer
);

router.patch('/:id', 
  [
    body('name').isString().optional(),
    body('email').isEmail().optional()
  ], 
  validate, 
  customersController.updateCustomer
);

router.delete('/:id', customersController.deleteCustomer);

export default router;
