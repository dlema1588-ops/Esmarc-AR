import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../database/supabase.client';

export const requireShopOwner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.params.shopId || req.body.shopId || req.query.shopId || req.headers['x-shop-id'];
    const userId = req.app.locals.userId;

    if (req.app.locals.systemRole === 'super_admin') {
      return next();
    }

    if (!shopId || !userId) {
      res.status(403).json({ success: false, message: 'Forbidden: Missing shop or user info' });
      return;
    }

    const { data: member, error } = await supabaseAdmin
      .from('shop_members')
      .select('role')
      .eq('shop_id', shopId)
      .eq('user_id', userId)
      .single();

    if (error || !member || member.role !== 'owner') {
      res.status(403).json({ success: false, message: 'Forbidden: Requires shop owner role' });
      return;
    }
    
    next();
  } catch (err) {
    next(err);
  }
};

export const requireShopAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.params.shopId || req.body.shopId || req.query.shopId || req.headers['x-shop-id'];
    const userId = req.app.locals.userId;

    if (req.app.locals.systemRole === 'super_admin') {
      return next();
    }

    if (!shopId || !userId) {
      res.status(403).json({ success: false, message: 'Forbidden: Missing shop or user info' });
      return;
    }

    const { data: member, error } = await supabaseAdmin
      .from('shop_members')
      .select('role')
      .eq('shop_id', shopId)
      .eq('user_id', userId)
      .single();

    if (error || !member || !['owner', 'admin'].includes(member.role)) {
      res.status(403).json({ success: false, message: 'Forbidden: Requires shop admin role' });
      return;
    }
    
    next();
  } catch (err) {
    next(err);
  }
};

export const requirePermission = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const shopId = req.params.shopId || req.body.shopId || req.query.shopId || req.headers['x-shop-id'];
      const userId = req.app.locals.userId;

      if (req.app.locals.systemRole === 'super_admin') {
        return next();
      }

      if (!shopId || !userId) {
        res.status(403).json({ success: false, message: 'Forbidden: Missing shop or user info' });
        return;
      }

      const { data: member, error } = await supabaseAdmin
        .from('shop_members')
        .select('role')
        .eq('shop_id', shopId)
        .eq('user_id', userId)
        .single();

      if (error || !member || !allowedRoles.includes(member.role)) {
        res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
        return;
      }
      
      next();
    } catch (err) {
      next(err);
    }
  };
};
