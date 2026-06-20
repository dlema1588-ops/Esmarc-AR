import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../../middlewares/validate.middleware';
import * as domainsController from './domains.controller';

const router = Router();

router.get('/', domainsController.getDomains);
router.post('/', 
  [
    body('name').isString().notEmpty(),
    body('shop_id').isString().notEmpty()
  ], 
  validate, 
  domainsController.createDomain
);
router.post('/verify', 
  [
    body('domainId').isString().notEmpty()
  ], 
  validate, 
  domainsController.verifyDomain
);
router.delete('/:id', domainsController.deleteDomain);

export default router;
