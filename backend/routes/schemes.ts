import { Router, Request, Response } from 'express';
import { schemes, activeSchemes, refunds, ActiveScheme, RefundRecord } from '../data/store';

const router = Router();

// GET /api/schemes - list available schemes
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: schemes,
  });
});

// POST /api/schemes/calculate - calculate 10+1 or custom installment breakdown
router.post('/calculate', (req: Request, res: Response) => {
  const { monthlyDeposit, schemeId } = req.body;

  const deposit = Number(monthlyDeposit) || 50;
  const youPay = deposit * 10;
  const voltMartBonus = deposit * 1;
  const totalCredit = deposit * 11;

  res.json({
    success: true,
    data: {
      schemeId: schemeId || 'scheme-gold-10-plus-1',
      monthlyDeposit: deposit,
      tenureMonths: 10,
      bonusMonths: 1,
      totalPaidByCustomer: youPay,
      bonusContributedByVoltMart: voltMartBonus,
      totalShoppingCredit: totalCredit,
      benefitSummary: `Deposit $${deposit}/mo for 10 months ($${youPay}). VoltMart deposits $${voltMartBonus} for free, giving you $${totalCredit} to shop!`,
    },
  });
});

// GET /api/schemes/enrolled - list user's active enrolled schemes
router.get('/enrolled', (_req: Request, res: Response) => {
  const totalSavings = activeSchemes.reduce((sum, s) => sum + s.accumulatedSavings, 0);
  const totalBonus = activeSchemes.reduce((sum, s) => sum + s.bonusEarned, 0);

  res.json({
    success: true,
    vaultSummary: {
      totalSavings,
      totalBonus,
      activeCount: activeSchemes.length,
    },
    data: activeSchemes,
  });
});

// POST /api/schemes/enroll - enroll in new scheme
router.post('/enroll', (req: Request, res: Response) => {
  const { schemeTitle, monthlyDeposit, mandateBank, mandateAccLast4 } = req.body;

  const deposit = Number(monthlyDeposit) || 100;
  const title = schemeTitle || 'VoltFlex 10+1 Gold Savings';
  const randomCode = `VLT-SCH-${Math.floor(10000 + Math.random() * 90000)}`;

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);
  const maturityDate = new Date(now.getFullYear(), now.getMonth() + 11, 15);

  const newScheme: ActiveScheme = {
    id: `sch-${Date.now()}`,
    schemeName: title,
    schemeCode: randomCode,
    monthlyDeposit: deposit,
    paidMonths: 1,
    totalMonths: 10,
    startDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    nextDebitDate: nextMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    maturityDate: maturityDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    accumulatedSavings: deposit,
    bonusEarned: deposit,
    status: 'Active',
    mandateBank: mandateBank || 'Chase Premier Checking',
    mandateAccLast4: mandateAccLast4 || '4821',
  };

  activeSchemes.unshift(newScheme);

  res.status(201).json({
    success: true,
    message: 'Scheme enrolled successfully',
    data: newScheme,
  });
});

// POST /api/schemes/withdraw - premature scheme withdrawal
router.post('/withdraw', (req: Request, res: Response) => {
  const { schemeId, bankName, accountEnding } = req.body;

  const index = activeSchemes.findIndex((s) => s.id === schemeId);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Active scheme not found' });
  }

  const scheme = activeSchemes[index];
  const gross = scheme.accumulatedSavings;
  // If paid >= 6 months, 0 penalty! Otherwise 2% administrative fee
  const penalty = scheme.paidMonths >= 6 ? 0 : Math.round(gross * 0.02 * 100) / 100;
  const net = gross - penalty;

  // Remove from active schemes
  activeSchemes.splice(index, 1);

  // Add to refunds
  const newRefund: RefundRecord = {
    id: `ref-${Date.now()}`,
    referenceNo: `REF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    schemeCode: scheme.schemeCode,
    schemeName: scheme.schemeName,
    grossDeposit: gross,
    penaltyFee: penalty,
    netPayout: net,
    bankName: bankName || scheme.mandateBank,
    accountEnding: accountEnding || scheme.mandateAccLast4,
    initiatedAt: 'Just now',
    creditedAt: 'Processing (within 24 hrs)',
    status: 'Processing',
    utrNumber: `UTR-${(bankName || 'CHAS').slice(0, 4).toUpperCase()}-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
  };

  refunds.unshift(newRefund);

  res.json({
    success: true,
    message: `Premature withdrawal processed. $${net.toFixed(2)} will be credited to bank within 24 hours.`,
    data: {
      refund: newRefund,
      withdrawnScheme: scheme,
    },
  });
});

export default router;
