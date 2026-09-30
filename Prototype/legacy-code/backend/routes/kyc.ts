import { Router, Request, Response } from 'express';
import { userProfile } from '../data/store';

const router = Router();

// GET /api/kyc/status
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      kycVerified: userProfile.kycVerified,
      documentType: 'Driver License',
      documentNumber: 'DL-9081247-NY',
      verifiedAt: '2026-03-10',
      creditTier: 'Tier 1 Approved (Up to $3,000 Scheme Limit)',
    },
  });
});

// POST /api/kyc/verify - submit verification
router.post('/verify', (req: Request, res: Response) => {
  const { documentType, documentNumber, dateOfBirth } = req.body;

  userProfile.kycVerified = true;

  res.json({
    success: true,
    message: 'Identity and credit bureau KYC verified successfully',
    data: {
      kycVerified: true,
      documentType: documentType || 'Driver License',
      documentNumber: documentNumber || 'DL-9081247-NY',
      dateOfBirth: dateOfBirth || '1994-06-18',
      status: 'Verified Approved',
      creditAssessment: {
        score: 'Excellent',
        maxSchemeLimit: 3000,
        zeroDownpaymentEligible: true,
      },
    },
  });
});

export default router;
