import { Router } from 'express';
import * as variantsController from './variants.controller';

const router = Router();

router.post('/', variantsController.createVariant);
router.get('/:id', variantsController.getVariant);
router.put('/:id', variantsController.updateVariant);
router.delete('/:id', variantsController.deleteVariant);

export default router;
