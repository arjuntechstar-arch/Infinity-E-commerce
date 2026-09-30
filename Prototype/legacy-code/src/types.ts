export interface Product {
  id: string;
  title: string;
  brand: string;
  sku: string;
  category: 'smartphones' | 'tv-audio' | 'appliances' | 'laptops' | 'wearables';
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  schemeEligible: boolean;
  monthlySchemePrice: number;
  stockCount: number;
  inStock: boolean;
  hub: string;
  images: string[];
  specs: { label: string; value: string }[];
  description: string;
  schemeOptions?: {
    tenureMonths: number;
    monthlyDeposit: number;
    bonusVoucher: number;
    zeroDownpayment: boolean;
  };
}

export interface Scheme {
  id: string;
  title: string;
  category: string;
  badge: string;
  description: string;
  monthlyMin: number;
  monthlyMax: number;
  tenureMonths: number;
  bonusMultiplier: number; // e.g. 1 month bonus for 10 months (10+1)
  apr: number;
  perks: string[];
  image: string;
}

export interface ActiveScheme {
  id: string;
  schemeName: string;
  schemeCode: string;
  monthlyDeposit: number;
  paidMonths: number;
  totalMonths: number;
  startDate: string;
  nextDebitDate: string;
  maturityDate: string;
  accumulatedSavings: number;
  bonusEarned: number;
  status: 'Active' | 'Maturing Soon' | 'Completed' | 'Withdrawn';
  mandateBank: string;
  mandateAccLast4: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  plan: 'full' | 'scheme';
  selectedMonths?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  status: 'Confirmed' | 'Processing' | 'Dispatched' | 'Out for Delivery' | 'Delivered';
  courier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  shippingAddress: string;
}

export interface WarrantyItem {
  id: string;
  productName: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  expiryDate: string;
  coverageYears: number;
  status: 'Active' | 'Expiring Soon' | 'Claimed';
  invoiceNumber: string;
}

export interface RefundRecord {
  id: string;
  referenceNo: string;
  schemeCode: string;
  schemeName: string;
  grossDeposit: number;
  penaltyFee: number;
  netPayout: number;
  bankName: string;
  accountEnding: string;
  initiatedAt: string;
  creditedAt?: string;
  status: 'Pending Verification' | 'Processing' | 'Credited';
  utrNumber?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  quickReplies?: string[];
}
