import { Request, Response, NextFunction } from 'express';
import * as customersRepo from './customers.repository';

export const getCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.headers['x-shop-id'] as string;
    const customers = await customersRepo.getCustomers(shopId);
    res.json({ success: true, message: 'Customers retrieved', data: customers });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.headers['x-shop-id'] as string;
    const customer = await customersRepo.getCustomerById(req.params.id, shopId);
    res.json({ success: true, message: 'Customer retrieved', data: customer });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.headers['x-shop-id'] as string;
    const customerData = { ...req.body, shop_id: shopId };
    const customer = await customersRepo.createCustomer(customerData);
    res.status(201).json({ success: true, message: 'Customer created', data: customer });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.headers['x-shop-id'] as string;
    const customer = await customersRepo.updateCustomer(req.params.id, shopId, req.body);
    res.json({ success: true, message: 'Customer updated', data: customer });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.headers['x-shop-id'] as string;
    await customersRepo.deleteCustomer(req.params.id, shopId);
    res.json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    next(error);
  }
};
