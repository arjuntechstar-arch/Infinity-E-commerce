import { Router, Request, Response } from 'express';
import { userProfile } from '../data/store';

const router = Router();

// GET /api/profile
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: userProfile,
  });
});

// PUT /api/profile
router.put('/', (req: Request, res: Response) => {
  const { name, email, address, pushAlerts, autoApplyVoucher } = req.body;

  if (name !== undefined) userProfile.name = name;
  if (email !== undefined) userProfile.email = email;
  if (address !== undefined) userProfile.address = address;
  if (pushAlerts !== undefined) userProfile.pushAlerts = pushAlerts;
  if (autoApplyVoucher !== undefined) userProfile.autoApplyVoucher = autoApplyVoucher;

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: userProfile,
  });
});

// POST /api/profile/send-otp
router.post('/send-otp', (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
  }

  res.json({
    success: true,
    message: `Verification code sent to ${phone}`,
    demoCode: '8492',
  });
});

// POST /api/profile/verify-otp
router.post('/verify-otp', (req: Request, res: Response) => {
  const { phone, otp } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
  }

  userProfile.phone = phone;

  res.json({
    success: true,
    message: 'Phone number verified and updated successfully for EMI alerts',
    data: {
      phone: userProfile.phone,
    },
  });
});

export default router;
