import { Request, Response, NextFunction } from 'express';
import * as tenantRepo from './tenant.repository';

export const getCurrentShop = (req: Request, res: Response): void => {
  const shopId = req.app.locals.shopId;
  const shop = tenantRepo.getShopById(shopId);
  if (!shop) {
    res.status(404).json({ success: false, message: 'Shop not found' });
    return;
  }
  res.json({ success: true, message: 'Shop retrieved', data: shop });
};

export const getProducts = (req: Request, res: Response): void => {
  if (!req.app.locals.shopId) {
    res.status(400).json({ success: false, message: 'x-shop-id header required' });
    return;
  }
  res.json({ success: true, message: 'Products retrieved', data: tenantRepo.getProducts(req.app.locals.shopId) });
};

export const createProduct = (req: Request, res: Response): void => {
  if (!req.app.locals.shopId) {
    res.status(400).json({ success: false, message: 'x-shop-id header required' });
    return;
  }
  const product = tenantRepo.createProduct(req.app.locals.shopId, req.body);
  res.json({ success: true, message: 'Product created', data: product });
};

export const getCustomers = (req: Request, res: Response): void => {
  if (!req.app.locals.shopId) {
    res.status(400).json({ success: false, message: 'x-shop-id header required' });
    return;
  }
  res.json({ success: true, message: 'Customers retrieved', data: tenantRepo.getCustomers(req.app.locals.shopId) });
};

export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.app.locals.shopId;
    if (!shopId) {
      res.status(400).json({ success: false, message: 'x-shop-id header required' });
      return;
    }
    
    // items should be { variantId, quantity, unitPrice }
    const order = await tenantRepo.createOrderWithItemsAndStockReduction(shopId, req.body);
    if (!order) {
       res.status(400).json({ success: false, message: 'Could not create order due to insufficient stock or invalid items' });
       return;
    }

    res.json({ success: true, message: 'Order created', data: order });
  } catch (error) {
    next(error);
  }
};

export const getOrders = (req: Request, res: Response): void => {
  if (!req.app.locals.shopId) {
    res.status(400).json({ success: false, message: 'x-shop-id header required' });
    return;
  }
  res.json({ success: true, message: 'Orders retrieved', data: tenantRepo.getOrders(req.app.locals.shopId) });
};
