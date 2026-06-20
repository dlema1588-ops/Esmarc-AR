import { Request, Response, NextFunction } from 'express';
import * as notificationsRepo from './notifications.repository';

export const getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notifications = await notificationsRepo.getNotifications();
    res.json({ success: true, message: 'Notifications retrieved', data: notifications });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notification = await notificationsRepo.createNotification(req.body);
    res.json({ success: true, message: 'Notification created', data: notification });
  } catch (error) {
    next(error);
  }
};
