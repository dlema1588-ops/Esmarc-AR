import { Request, Response, NextFunction } from 'express';
import * as variantsRepo from './variants.repository';

export const createVariant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.app.locals.shopId;
    if (!shopId) {
      res.status(400).json({ success: false, message: 'x-shop-id header required' });
      return;
    }
    const variant = await variantsRepo.createVariant(shopId, req.body);
    res.json({ success: true, message: 'Variant created', data: variant });
  } catch (error) {
    next(error);
  }
};

export const getVariant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.app.locals.shopId;
    const variant = await variantsRepo.getVariant(req.params.id, shopId);
    if (!variant) {
      res.status(404).json({ success: false, message: 'Variant not found' });
      return;
    }
    res.json({ success: true, message: 'Variant retrieved', data: variant });
  } catch (error) {
    next(error);
  }
};

export const updateVariant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.app.locals.shopId;
    const variant = await variantsRepo.updateVariant(req.params.id, shopId, req.body);
    if (!variant) {
      res.status(404).json({ success: false, message: 'Variant not found' });
      return;
    }
    res.json({ success: true, message: 'Variant updated', data: variant });
  } catch (error) {
    next(error);
  }
};

export const deleteVariant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.app.locals.shopId;
    const success = await variantsRepo.deleteVariant(req.params.id, shopId);
    if (!success) {
      res.status(404).json({ success: false, message: 'Variant not found' });
      return;
    }
    res.json({ success: true, message: 'Variant deleted' });
  } catch (error) {
    next(error);
  }
};
