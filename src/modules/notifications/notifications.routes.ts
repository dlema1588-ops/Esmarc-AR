import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../../middlewares/validate.middleware';
import * as notificationsController from './notifications.controller';

const router = Router();

router.get('/', notificationsController.getNotifications);
router.post('/', 
  [
    body('title').isString().notEmpty(),
    body('message').isString().notEmpty(),
    body('type').isString().notEmpty()
  ], 
  validate, 
  notificationsController.createNotification
);

export default router;
