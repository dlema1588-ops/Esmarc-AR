import { Request, Response, NextFunction } from 'express';
import * as productsRepo from './products.repository';

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.headers['x-shop-id'] as string;
    const products = await productsRepo.getProducts(shopId);
    res.json({ success: true, message: 'Products retrieved', data: products });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.headers['x-shop-id'] as string;
    const product = await productsRepo.getProductById(req.params.id, shopId);
    res.json({ success: true, message: 'Product retrieved', data: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.headers['x-shop-id'] as string;
    const productData = { ...req.body, shop_id: shopId };
    const product = await productsRepo.createProduct(productData);
    res.status(201).json({ success: true, message: 'Product created', data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.headers['x-shop-id'] as string;
    const product = await productsRepo.updateProduct(req.params.id, shopId, req.body);
    res.json({ success: true, message: 'Product updated', data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.headers['x-shop-id'] as string;
    await productsRepo.deleteProduct(req.params.id, shopId);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

export const addVariant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const variantData = { ...req.body, product_id: req.params.id };
    const variant = await productsRepo.addVariant(variantData);
    res.status(201).json({ success: true, message: 'Variant added', data: variant });
  } catch (error) {
    next(error);
  }
};

export const updateVariant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const variant = await productsRepo.updateVariant(req.params.id, req.body);
    res.json({ success: true, message: 'Variant updated', data: variant });
  } catch (error) {
    next(error);
  }
};

export const deleteVariant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await productsRepo.deleteVariant(req.params.id);
    res.json({ success: true, message: 'Variant deleted' });
  } catch (error) {
    next(error);
  }
};
