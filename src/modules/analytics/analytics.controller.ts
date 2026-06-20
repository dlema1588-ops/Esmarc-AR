import { Request, Response, NextFunction } from 'express';
import * as analyticsRepo from './analytics.repository';

export const getRevenueAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await analyticsRepo.getRevenueAnalytics();
    res.json({ success: true, message: 'Revenue analytics retrieved', data });
  } catch (error) {
    next(error);
  }
};

export const getShopGrowthAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await analyticsRepo.getShopGrowthAnalytics();
    res.json({ success: true, message: 'Shop growth analytics retrieved', data });
  } catch (error) {
    next(error);
  }
};

export const getTrafficAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await analyticsRepo.getTrafficAnalytics();
    res.json({ success: true, message: 'Traffic analytics retrieved', data });
  } catch (error) {
    next(error);
  }
};
