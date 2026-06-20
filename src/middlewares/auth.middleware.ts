import { Request, Response, NextFunction } from 'express';
import { supabase } from '../database/supabase.client';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      res.status(401).json({ success: false, message: 'Unauthorized: Invalid token', error });
      return;
    }

    // In a real scenario, roles might be in user metadata or a separate profile fetch
    req.app.locals.userId = user.id;
    req.app.locals.email = user.email;
    req.app.locals.systemRole = user.user_metadata?.role || 'user';
    next();
  } catch (error) {
    next(error);
  }
};

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.app.locals.systemRole !== 'super_admin') {
    res.status(403).json({ success: false, message: 'Forbidden: Super Admin access required' });
    return;
  }
  next();
};

export const requireShopOwner = (req: Request, res: Response, next: NextFunction): void => {
  const role = req.app.locals.shopRole; // Would be set by a shop role middleware
  if (req.app.locals.systemRole === 'super_admin' || role === 'shop_owner') {
    return next();
  }
  res.status(403).json({ success: false, message: 'Forbidden: Shop Owner access required' });
};

export const requireShopAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const role = req.app.locals.shopRole;
  if (req.app.locals.systemRole === 'super_admin' || role === 'shop_owner' || role === 'shop_admin') {
    return next();
  }
  res.status(403).json({ success: false, message: 'Forbidden: Shop Admin access required' });
};

