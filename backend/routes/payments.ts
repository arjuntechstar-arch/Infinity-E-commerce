import { Router, Request, Response } from 'express';
import { bankMandates, refunds, activeSchemes, BankMandate } from '../data/store';

const router = Router();

// GET /api/payments/summary - vault balance and overview
router.get('/summary', (_req: Request, res: Response) => {
  const totalSavings = activeSchemes.reduce((sum, s) => sum + s.accumulatedSavings, 0);
  const totalBonus = activeSchemes.reduce((sum, s) => sum + s.bonusEarned, 0);

  res.json({
    success: true,
    data: {
      vaultBalance: totalSavings,
      maturityBonusEarned: totalBonus,
      activeMandatesCount: bankMandates.length,
      nextScheduledDebit: activeSchemes[0]?.nextDebitDate || 'Oct 15, 2026',
    },
  });
});

// GET /api/payments/mandates - list linked e-mandates
router.get('/mandates', (_req: Request, res: Response) => {
  res.json({
    success: true,
    total: bankMandates.length,
    data: bankMandates,
  });
});

// POST /api/payments/mandates - link new mandate
router.post('/mandates', (req: Request, res: Response) => {
  const { bankName, accountNumber, recurringLimit, debitDay } = req.body;

  const last4 = (accountNumber ? String(accountNumber).slice(-4) : '') || '4821';
  const newMandate: BankMandate = {
    id: `man-${Date.now()}`,
    bankName: bankName || 'Chase Premier Checking',
    accountEnding: last4,
    recurringLimit: Number(recurringLimit) || 500,
    status: 'Active',
    frequency: 'Monthly',
    debitDay: Number(debitDay) || 15,
  };

  bankMandates.push(newMandate);

  res.status(201).json({
    success: true,
    message: 'e-Mandate registered and verified with bank gateway',
    data: newMandate,
  });
});

// GET /api/payments/refunds - list settlement ledger
router.get('/refunds', (_req: Request, res: Response) => {
  res.json({
    success: true,
    total: refunds.length,
    data: refunds,
  });
});

// GET /api/payments/receipt/:refNumber - returns structured receipt document
router.get('/receipt/:refNumber', (req: Request, res: Response) => {
  const ref = req.params.refNumber;

  const refund = refunds.find((r) => r.referenceNo === ref || r.id === ref || r.utrNumber === ref);
  const scheme = activeSchemes.find((s) => s.schemeCode === ref || s.id === ref);

  if (!refund && !scheme) {
    return res.status(404).json({ success: false, message: 'Receipt not found' });
  }

  res.json({
    success: true,
    data: {
      type: refund ? 'Refund Settlement Receipt' : 'Scheme Deposit Receipt',
      referenceNumber: refund?.referenceNo || scheme?.schemeCode,
      date: refund?.initiatedAt || scheme?.startDate,
      beneficiary: {
        name: 'Alexander Rivera',
        phone: '+1 (555) 019-2834',
        bankAccount: refund ? `${refund.bankName} (*${refund.accountEnding})` : `${scheme?.mandateBank} (*${scheme?.mandateAccLast4})`,
      },
      amount: refund?.netPayout || scheme?.accumulatedSavings,
      refundDetails: refund || null,
      schemeDetails: scheme || null,
      stamp: 'VOLTMART FISCAL LEDGER - DIGITALLY VERIFIED',
      barcode: `AUTH-SEC-${refund?.referenceNo || scheme?.schemeCode}`,
    },
  });
});

export default router;
