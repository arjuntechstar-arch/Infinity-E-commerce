import { Router, Request, Response } from 'express';

const router = Router();

// POST /api/vouchers/validate
router.post('/validate', (req: Request, res: Response) => {
  const { code, cartAmount } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ success: false, message: 'Voucher code is required' });
  }

  const clean = code.trim().toUpperCase();

  if (clean === 'VOLT50') {
    const minSpend = 50;
    const discount = 50;
    const amount = Number(cartAmount) || 0;

    if (amount > 0 && amount < minSpend) {
      return res.status(400).json({
        success: false,
        message: `VOLT50 requires a minimum cart value of $${minSpend}`,
      });
    }

    return res.json({
      success: true,
      message: 'Voucher applied! $50.00 discount granted.',
      data: {
        code: 'VOLT50',
        discount,
        description: '$50 Off Welcome Festive Scheme Voucher',
      },
    });
  }

  return res.status(404).json({
    success: false,
    message: 'Invalid or expired voucher code. Try "VOLT50" for $50 off!',
  });
});

export default router;
