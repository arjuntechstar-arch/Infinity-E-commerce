import { Router, Request, Response } from 'express';
import { activeSchemes, orders, warranties } from '../data/store';

const router = Router();

// POST /api/concierge/chat
router.post('/chat', (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, message: 'Message string is required' });
  }

  const lower = message.toLowerCase();
  let reply = "I'm here to help with all VoltMart schemes, installment orders, and warranties!";
  let quickReplies: string[] = ['Browse Catalog', 'View Active Schemes', 'Check Delivery'];

  if (lower.includes('10+1') || lower.includes('how does') || lower.includes('work') || lower.includes('scheme')) {
    reply =
      'In the VoltFlex 10+1 scheme, you deposit monthly installments for 10 months (e.g. $50 or $100/mo). Upon completing the 10th month, VoltMart contributes the 11th installment 100% FREE as shopping credit to buy any smartphone, TV, or appliance!';
    quickReplies = ['Enroll in 10+1 Scheme', 'Calculate Savings', 'View Available Schemes'];
  } else if (lower.includes('debit') || lower.includes('when') || lower.includes('mandate') || lower.includes('autopay')) {
    const nextDate = activeSchemes[0]?.nextDebitDate || 'Oct 15, 2026';
    const bank = activeSchemes[0]?.mandateBank || 'Chase Premier Checking';
    const amount = activeSchemes[0]?.monthlyDeposit || 100;
    reply = `Your next automated bank debit is scheduled for ${nextDate} for $${amount}.00 from your linked ${bank} account.`;
    quickReplies = ['Go to Payments Ledger', 'Manage Bank Mandates'];
  } else if (lower.includes('withdraw') || lower.includes('refund') || lower.includes('cancel')) {
    reply =
      'You can withdraw funds from any active scheme anytime! If you have completed 6+ installments, there is 0% cancellation penalty. Your principal savings will be credited directly to your bank account within 24 hours.';
    quickReplies = ['Request Withdrawal', 'View Refund Ledger'];
  } else if (lower.includes('warranty') || lower.includes('repair') || lower.includes('claim')) {
    reply = `All electronics purchased through VoltMart come with our 2-Year Official Brand Shield! You currently have ${warranties.length} active warranties. If your device needs inspection or repair, you can file a complimentary claim directly.`;
    quickReplies = ['Open Warranty Vault', 'File Repair Claim'];
  } else if (lower.includes('delivery') || lower.includes('order') || lower.includes('tracking')) {
    const activeOrder = orders[0];
    if (activeOrder) {
      reply = `Order ${activeOrder.orderNumber} is currently ${activeOrder.status} (${activeOrder.estimatedDelivery}) via ${activeOrder.courier}.`;
      quickReplies = ['Track Order on Map', 'Contact Courier Driver'];
    } else {
      reply = 'You currently have no active orders in transit.';
      quickReplies = ['Browse Catalog', 'View Past Orders'];
    }
  }

  res.json({
    success: true,
    data: {
      reply,
      quickReplies,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  });
});

export default router;
