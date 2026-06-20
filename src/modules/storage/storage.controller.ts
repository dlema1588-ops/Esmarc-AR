import { Request, Response, NextFunction } from 'express';
import * as storageRepo from './storage.repository';

const ALLOWED_BUCKETS = ['product-images', 'shop-assets', 'theme-assets'];

export const uploadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.headers['x-shop-id'] as string;
    const bucket = req.params.bucket;

    if (!ALLOWED_BUCKETS.includes(bucket)) {
      res.status(400).json({ success: false, message: 'Invalid bucket' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file provided' });
      return;
    }

    const result = await storageRepo.uploadImage(bucket, req.file, shopId);
    
    res.status(201).json({ success: true, message: 'Image uploaded', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bucket = req.params.bucket;
    const path = req.body.path;

    if (!ALLOWED_BUCKETS.includes(bucket)) {
      res.status(400).json({ success: false, message: 'Invalid bucket' });
      return;
    }

    await storageRepo.deleteImage(bucket, path);
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    next(error);
  }
};
