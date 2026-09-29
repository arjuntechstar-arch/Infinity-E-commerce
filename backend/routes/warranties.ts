import { Router, Request, Response } from 'express';
import { warranties } from '../data/store';

const router = Router();

// GET /api/warranties
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    total: warranties.length,
    data: warranties,
  });
});

// GET /api/warranties/:id
router.get('/:id', (req: Request, res: Response) => {
  const warranty = warranties.find((w) => w.id === req.params.id);
  if (!warranty) {
    return res.status(404).json({ success: false, message: 'Warranty record not found' });
  }
  res.json({ success: true, data: warranty });
});

// POST /api/warranties/:id/claim - file repair claim
router.post('/:id/claim', (req: Request, res: Response) => {
  const { issueDescription, pickupAddress } = req.body;
  const warranty = warranties.find((w) => w.id === req.params.id);

  if (!warranty) {
    return res.status(404).json({ success: false, message: 'Warranty record not found' });
  }

  const claimTicket = `CLM-${Math.floor(100000 + Math.random() * 900000)}`;

  res.status(201).json({
    success: true,
    message: 'Official brand warranty repair claim submitted successfully',
    data: {
      claimTicket,
      warrantyId: warranty.id,
      productName: warranty.productName,
      serialNumber: warranty.serialNumber,
      brand: warranty.brand,
      issueDescription: issueDescription || 'General diagnostic inspection & repair',
      pickupAddress: pickupAddress || '428 Lexington Ave, Apt 9B, New York, NY 10017',
      assignedServiceCenter: 'VoltMart OEM Certified Care Hub',
      technicianContact: '+1 (555) 019-8822',
      estimatedInspectionTime: 'Within 2 hours',
    },
  });
});

export default router;
