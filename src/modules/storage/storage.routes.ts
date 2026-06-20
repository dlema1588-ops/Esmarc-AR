import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import { validate } from '../../middlewares/validate.middleware';
import * as storageController from './storage.controller';
import { requireShopAdmin } from '../../middlewares/rbac.middleware';

const router = Router();
const upload = multer({ 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

router.use(requireShopAdmin);

router.post('/:bucket', upload.single('image'), storageController.uploadFile);
router.post('/:bucket/delete', 
  [
    body('path').isString().notEmpty()
  ], 
  validate, 
  storageController.deleteFile
);

export default router;
