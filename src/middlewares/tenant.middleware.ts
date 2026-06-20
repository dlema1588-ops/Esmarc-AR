import { Request, Response, NextFunction } from 'express';

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const shopId = req.headers['x-shop-id'] as string;
  if (req.path.startsWith('/api/v1/admin')) {
    next();
    return;
  }
  if (shopId) {
    req.app.locals.shopId = shopId;
  }
  next();
};
