import { Router, Request, Response } from 'express';
import { storeHubs } from '../data/store';

const router = Router();

// GET /api/hubs
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    total: storeHubs.length,
    data: storeHubs.map((name, index) => ({
      id: `hub-${index + 1}`,
      name,
      address: index === 0 ? '428 Lexington Ave, New York, NY' : 'Regional Express Logistics Center',
      pickupReadyMinutes: 120,
      openHours: '9:00 AM - 9:00 PM',
      phone: '+1 (555) 019-3300',
    })),
  });
});

export default router;
