import { Router, Request, Response } from 'express';
import { orders, warranties, Order, WarrantyItem } from '../data/store';
import { CartItem } from '../../src/types';

const router = Router();

// GET /api/orders
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    total: orders.length,
    data: orders,
  });
});

// GET /api/orders/:id
router.get('/:id', (req: Request, res: Response) => {
  const order = orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Journey milestones
  const trackingTimeline = [
    { label: 'Order Confirmed', time: 'Sep 26, 10:14 AM', status: 'Completed' },
    { label: 'Hub Quality Check & 2-Yr Shield Tagged', time: 'Sep 26, 11:30 AM', status: 'Completed' },
    { label: 'Dispatched from Downtown Hub', time: 'Sep 26, 01:45 PM', status: 'Completed' },
    { label: 'Out for Delivery (Fleet Van #14)', time: 'En Route (8 mins away)', status: 'In Transit', current: true },
    { label: 'Delivery Completed', time: 'Pending confirmation', status: 'Pending' },
  ];

  res.json({
    success: true,
    data: {
      ...order,
      trackingTimeline,
      driver: {
        name: 'Marcus Vance',
        phone: '+1 (555) 019-3382',
        vehicle: 'VoltMart Fleet Van #14',
      },
    },
  });
});

// POST /api/orders - place order
router.post('/', (req: Request, res: Response) => {
  const { items, voucherCode, deliveryType, shippingAddress } = req.body as {
    items: CartItem[];
    voucherCode?: string;
    deliveryType?: 'delivery' | 'pickup';
    shippingAddress?: string;
  };

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Order items are required' });
  }

  const subtotal = items.reduce((sum, item) => {
    const unitPrice = item.plan === 'scheme' ? item.product.monthlySchemePrice : item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const voucherDiscount = voucherCode?.toUpperCase() === 'VOLT50' && subtotal > 50 ? 50 : 0;
  const deliveryFee = 0; // Promo free delivery
  const totalAmount = Math.max(0, subtotal - voucherDiscount + deliveryFee);

  const newOrderId = `ord-${Date.now()}`;
  const orderNumber = `VM-ORD-${Math.floor(10000 + Math.random() * 90000)}`;

  const newOrder: Order = {
    id: newOrderId,
    orderNumber,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    items,
    totalAmount,
    status: 'Confirmed',
    courier: deliveryType === 'pickup' ? 'Store Pickup: Downtown Hub' : 'VoltMart Fleet Dispatch (Hub #1)',
    trackingNumber: `VLT-TRK-${Math.floor(1000000 + Math.random() * 9000000)}`,
    estimatedDelivery: deliveryType === 'pickup' ? 'Ready in 2 Hours' : 'Tomorrow by 2:00 PM',
    shippingAddress: shippingAddress || '428 Lexington Ave, Apt 9B, New York, NY 10017',
  };

  orders.unshift(newOrder);

  // Auto-generate warranty for purchased electronics
  items.forEach((item) => {
    const newWarranty: WarrantyItem = {
      id: `war-${Date.now()}-${item.product.id}`,
      productName: item.product.title,
      brand: item.product.brand,
      model: item.product.sku,
      serialNumber: `SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      purchaseDate: 'Today',
      expiryDate: 'Sep 29, 2028',
      coverageYears: 2,
      status: 'Active',
      invoiceNumber: `INV-2026-${orderNumber.slice(-5)}`,
    };
    warranties.unshift(newWarranty);
  });

  res.status(201).json({
    success: true,
    message: 'Order created successfully and warranty shields activated',
    data: newOrder,
  });
});

export default router;
