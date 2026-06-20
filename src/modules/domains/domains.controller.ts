import { Request, Response, NextFunction } from 'express';
import * as domainsRepo from './domains.repository';

export const getDomains = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const domains = await domainsRepo.getDomains();
    res.json({ success: true, message: 'Domains retrieved', data: domains });
  } catch (error) {
    next(error);
  }
};

export const createDomain = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const domain = await domainsRepo.createDomain(req.body);
    res.json({ success: true, message: 'Domain created', data: domain });
  } catch (error) {
    next(error);
  }
};

export const verifyDomain = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { domainId } = req.body;
    const domain = await domainsRepo.verifyDomain(domainId);
    if (!domain) {
      res.status(404).json({ success: false, message: 'Domain not found' });
      return;
    }
    res.json({ success: true, message: 'Domain verified', data: domain });
  } catch (error) {
    next(error);
  }
};

export const deleteDomain = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const success = await domainsRepo.deleteDomain(req.params.id);
    if (!success) {
      res.status(404).json({ success: false, message: 'Domain not found' });
      return;
    }
    res.json({ success: true, message: 'Domain deleted' });
  } catch (error) {
    next(error);
  }
};
