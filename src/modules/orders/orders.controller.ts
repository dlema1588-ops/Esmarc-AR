import { Request, Response, NextFunction } from 'express';
import * as ordersRepo from './orders.repository';

export const getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.headers['x-shop-id'] as string;
    const orders = await ordersRepo.getOrders(shopId);
    res.json({ success: true, message: 'Orders retrieved', data: orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.headers['x-shop-id'] as string;
    const order = await ordersRepo.getOrderById(req.params.id, shopId);
    res.json({ success: true, message: 'Order retrieved', data: order });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.headers['x-shop-id'] as string;
    const { items, ...orderInfo } = req.body;
    const orderData = { ...orderInfo, shop_id: shopId, status: 'pending' };
    const order = await ordersRepo.createOrder(orderData, items || []);
    res.status(201).json({ success: true, message: 'Order created', data: order });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.headers['x-shop-id'] as string;
    const order = await ordersRepo.cancelOrder(req.params.id, shopId);
    res.json({ success: true, message: 'Order cancelled', data: order });
  } catch (error) {
    next(error);
  }
};

export const fulfillOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.headers['x-shop-id'] as string;
    const order = await ordersRepo.fulfillOrder(req.params.id, shopId);
    res.json({ success: true, message: 'Order fulfilled', data: order });
  } catch (error) {
    next(error);
  }
};
