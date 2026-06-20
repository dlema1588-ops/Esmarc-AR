import { Request, Response, NextFunction } from 'express';
import * as platformRepo from './platform.repository';

export const getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await platformRepo.getPlatformStats();
    res.json({ success: true, message: 'Platform stats retrieved', data: stats });
  } catch (error) {
    next(error);
  }
};

// Shops
export const getShops = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shops = await platformRepo.getAllShops();
    res.json({ success: true, message: 'Shops retrieved', data: shops });
  } catch (error) {
    next(error);
  }
};

export const getShopById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shop = await platformRepo.getShopById(req.params.id);
    res.json({ success: true, message: 'Shop retrieved', data: shop });
  } catch (error) {
    next(error);
  }
};

export const createShop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shop = await platformRepo.createShop(req.body);
    res.status(201).json({ success: true, message: 'Shop created', data: shop });
  } catch (error) {
    next(error);
  }
};

export const updateShop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shop = await platformRepo.updateShop(req.params.id, req.body);
    res.json({ success: true, message: 'Shop updated', data: shop });
  } catch (error) {
    next(error);
  }
};

// Plans
export const getPlans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plans = await platformRepo.getPlans();
    res.json({ success: true, message: 'Plans retrieved', data: plans });
  } catch (error) {
    next(error);
  }
};

export const createPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plan = await platformRepo.createPlan(req.body);
    res.status(201).json({ success: true, message: 'Plan created', data: plan });
  } catch (error) {
    next(error);
  }
};

export const assignPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const subscription = await platformRepo.assignPlan(req.body.shopId, req.body.planId);
    res.json({ success: true, message: 'Plan assigned', data: subscription });
  } catch (error) {
    next(error);
  }
};

// Themes
export const getThemes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const themes = await platformRepo.getThemes();
    res.json({ success: true, message: 'Themes retrieved', data: themes });
  } catch (error) {
    next(error);
  }
};

export const createTheme = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const theme = await platformRepo.createTheme(req.body);
    res.status(201).json({ success: true, message: 'Theme created', data: theme });
  } catch (error) {
    next(error);
  }
};

export const assignTheme = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopTheme = await platformRepo.assignTheme(req.body.shopId, req.body.themeId);
    res.json({ success: true, message: 'Theme assigned', data: shopTheme });
  } catch (error) {
    next(error);
  }
};

export const getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await platformRepo.getSettings();
    res.json({ success: true, message: 'Settings retrieved', data: settings });
  } catch (error) {
    next(error);
  }
};

