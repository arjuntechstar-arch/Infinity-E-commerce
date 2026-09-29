import {
  Product,
  Scheme,
  ActiveScheme,
  Order,
  WarrantyItem,
  RefundRecord,
} from '../../src/types';

export interface BankMandate {
  id: string;
  bankName: string;
  accountEnding: string;
  recurringLimit: number;
  status: 'Active' | 'Paused' | 'Cancelled';
  frequency: string;
  debitDay: number;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  tier: string;
  address: string;
  kycVerified: boolean;
  pushAlerts: boolean;
  autoApplyVoucher: boolean;
}

// In-memory data store
export const products: Product[] = [
  {
    id: 'prod-1',
    title: 'Samsung 65" Neo QLED 4K Smart TV (QN90C)',
    brand: 'Samsung',
    price: 1299,
    originalPrice: 1699,
    discountPercent: 24,
    monthlySchemePrice: 99,
    schemeEligible: true,
    category: 'tv-audio',
    rating: 4.9,
    reviewsCount: 384,
    stockCount: 8,
    hub: 'Downtown Flagship Hub #1',
    sku: 'SAM-65-QLED-90C',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD2UNZrugFeboUWO_txhMB8NskD755h6q_jixIFeYaOfJ_WTKtcFvw56mE5TQR4yL4cjfyBEaXzTgH9wZ3Lx5bLR2p1F6xmolqZTrTbudMu2GQQaYwyjqC_7GVbvnZ8bdbhQt8u_4aE7ps5SyGr5CRpEkVPiVurvY0QsykbUtskYOeI7VZdlO7J-jGIVITXal6-3ePUQ6aERgHAhsuVI4IXkc7Ug1V9DXwxSJQtnbq5gJmRI0tVpPXH',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDFH1-rEeg46j9n0f_lXz1bUvd9cZ03sK6-wA-W-U75K5xNrn-w4pC8P7ZzZ9w5L1Z4H8c5r7N7m4q-cZ1kX2j9wE5p8v4c1Z7r2s5k7n8m4q-cZ1kX2j9wE5p8v4c1',
    ],
    specs: [
      { label: 'Display Panel', value: '65" Quantum Mini-LED 4K (3840 x 2160)' },
      { label: 'Refresh Rate', value: '144Hz Native Motion Xcelerator Turbo+' },
      { label: 'Audio Output', value: '60W 4.2.2Ch Dolby Atmos' },
      { label: 'Smart Engine', value: 'Neural Quantum Processor 4K with AI Upscaling' },
      { label: 'Warranty Shield', value: '2-Year Official Brand Shield Included' },
    ],
    features: [
      'Quantum Matrix Technology with Mini LEDs',
      'Neural Quantum Processor with 4K AI Upscaling',
      'Anti-Glare with Ultra Viewing Angle',
      'Dolby Atmos and Object Tracking Sound+',
    ],
  },
  {
    id: 'prod-2',
    title: 'Apple iPhone 15 Pro (128GB, Natural Titanium)',
    brand: 'Apple',
    price: 999,
    originalPrice: 1099,
    discountPercent: 10,
    monthlySchemePrice: 49,
    schemeEligible: true,
    category: 'smartphones',
    rating: 4.9,
    reviewsCount: 1420,
    stockCount: 12,
    hub: 'Downtown Flagship Hub #1',
    sku: 'APL-IPH15P-128-NT',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCqLkv8at_KjJQTepWEZ7KbWKTKO2MXgb-vWofPutooXXHocqV_N3MKrB_f1dqF-Y9-pmxnKSDvYXlYi4RBEl1L18AMP6bTXRBsdcyMmz4TvGJe8pOB8MQe3S6ERsBr2MhiecSbUr5QZBDmRk1RhhDXbceuJx8m7uU1v9wOQWJ3bH7PbxFOgyZDXKc4qXUun1TCGhOBN04MQDGhE_I-twaq_shIZ490w1nAfDQ4d90TeOde3glZwGlR',
    ],
    specs: [
      { label: 'Chipset', value: 'A17 Pro Bionic 3nm Chip' },
      { label: 'Display', value: '6.1" Super Retina XDR OLED (120Hz ProMotion)' },
      { label: 'Camera Array', value: '48MP Main + 12MP Ultra-wide + 12MP 3x Telephoto' },
      { label: 'Chassis', value: 'Grade 5 Aerospace Titanium' },
      { label: 'Port', value: 'USB-C (USB 3.0 up to 10Gb/s)' },
    ],
    features: [
      'Action button customizable shortcut',
      'Dynamic Island interactive alerts',
      'Ceramic Shield front with aerospace titanium',
      'All-day battery life with Qi2 wireless charging',
    ],
  },
  {
    id: 'prod-3',
    title: 'Samsung 28 cu. ft. French Door Smart Refrigerator',
    brand: 'Samsung',
    price: 1899,
    originalPrice: 2299,
    discountPercent: 18,
    monthlySchemePrice: 120,
    schemeEligible: true,
    category: 'appliances',
    rating: 4.8,
    reviewsCount: 194,
    stockCount: 5,
    hub: 'Northside Mega Hub #3',
    sku: 'SAM-REF-28FT-SS',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuACmam7p5Budvrc70amH3KvIXhWwEHHLZtrlRZErHrcSrYp473ryaO76ECyOrc9U9BiJgv7FpIIl3dkNtGfKMGv4tbsQ_sdO5bSfy0QGMdkpQRhcVkm5WbUVcf_W0cd1qnNN-MLfMspYAg4QSORR7FLJ6lVjKloJQ1Eh0mbIJ7S7pUDxBywQRMz5lx1gy3QQIZ7bC-FQ8Q-vlM0FnXh8zbrplUvzcsyA9ZgxhP3OoSZN6cOWoAl3R8V',
    ],
    specs: [
      { label: 'Capacity', value: '28 cu. ft. Mega Storage' },
      { label: 'Cooling Tech', value: 'Twin Cooling Plus Multi-Air Flow' },
      { label: 'Smart Tech', value: 'Wi-Fi SmartThings Energy Management' },
      { label: 'Ice Maker', value: 'Dual Auto Ice Maker (Cubed & Ice Bites)' },
    ],
    features: [
      'Fingerprint resistant stainless steel finish',
      'Internal water dispenser with clean filter',
      'High-efficiency LED interior lighting',
      'ENERGY STAR certified',
    ],
  },
  {
    id: 'prod-4',
    title: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
    brand: 'Sony',
    price: 349,
    originalPrice: 399,
    discountPercent: 13,
    monthlySchemePrice: 28,
    schemeEligible: true,
    category: 'tv-audio',
    rating: 4.9,
    reviewsCount: 812,
    stockCount: 18,
    hub: 'Downtown Flagship Hub #1',
    sku: 'SNY-WH1000XM5-BLK',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD2UNZrugFeboUWO_txhMB8NskD755h6q_jixIFeYaOfJ_WTKtcFvw56mE5TQR4yL4cjfyBEaXzTgH9wZ3Lx5bLR2p1F6xmolqZTrTbudMu2GQQaYwyjqC_7GVbvnZ8bdbhQt8u_4aE7ps5SyGr5CRpEkVPiVurvY0QsykbUtskYOeI7VZdlO7J-jGIVITXal6-3ePUQ6aERgHAhsuVI4IXkc7Ug1V9DXwxSJQtnbq5gJmRI0tVpPXH',
    ],
    specs: [
      { label: 'ANC Processors', value: 'Dual Integrated Processor V1 + HD QN1' },
      { label: 'Microphones', value: '8 Microphones with AI Beamforming' },
      { label: 'Battery Life', value: 'Up to 30 Hours (3-min quick charge = 3 hrs)' },
      { label: 'Codecs', value: 'LDAC, AAC, SBC, Hi-Res Audio Wireless' },
    ],
    features: [
      'Industry-leading active noise cancellation',
      'Ultra-comfortable, lightweight soft fit leather',
      'Speak-to-chat and quick attention mode',
    ],
  },
  {
    id: 'prod-5',
    title: 'Apple MacBook Pro 14" (M3 Pro, 18GB Unified Memory)',
    brand: 'Apple',
    price: 1999,
    originalPrice: 2199,
    discountPercent: 10,
    monthlySchemePrice: 155,
    schemeEligible: true,
    category: 'laptops',
    rating: 4.9,
    reviewsCount: 320,
    stockCount: 6,
    hub: 'Westside Electronics Hub #2',
    sku: 'APL-MBP14-M3PRO-BLK',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCqLkv8at_KjJQTepWEZ7KbWKTKO2MXgb-vWofPutooXXHocqV_N3MKrB_f1dqF-Y9-pmxnKSDvYXlYi4RBEl1L18AMP6bTXRBsdcyMmz4TvGJe8pOB8MQe3S6ERsBr2MhiecSbUr5QZBDmRk1RhhDXbceuJx8m7uU1v9wOQWJ3bH7PbxFOgyZDXKc4qXUun1TCGhOBN04MQDGhE_I-twaq_shIZ490w1nAfDQ4d90TeOde3glZwGlR',
    ],
    specs: [
      { label: 'Processor', value: 'Apple M3 Pro (11-core CPU, 14-core GPU)' },
      { label: 'Memory', value: '18GB Unified Memory' },
      { label: 'Storage', value: '512GB Fast NVMe SSD' },
      { label: 'Display', value: '14.2" Liquid Retina XDR (120Hz ProMotion, 1600 nits peak)' },
    ],
    features: [
      'Up to 18 hours battery life',
      'Studio-quality three-mic array and six-speaker sound system',
      'Three Thunderbolt 4 ports, HDMI port, SDXC card slot, MagSafe 3',
    ],
  },
  {
    id: 'prod-6',
    title: 'LG 5.0 cu. ft. Mega Capacity Smart Front Load Washer',
    brand: 'LG',
    price: 899,
    originalPrice: 1099,
    discountPercent: 18,
    monthlySchemePrice: 65,
    schemeEligible: true,
    category: 'appliances',
    rating: 4.7,
    reviewsCount: 245,
    stockCount: 9,
    hub: 'Northside Mega Hub #3',
    sku: 'LG-WSH-5FT-ST',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuACmam7p5Budvrc70amH3KvIXhWwEHHLZtrlRZErHrcSrYp473ryaO76ECyOrc9U9BiJgv7FpIIl3dkNtGfKMGv4tbsQ_sdO5bSfy0QGMdkpQRhcVkm5WbUVcf_W0cd1qnNN-MLfMspYAg4QSORR7FLJ6lVjKloJQ1Eh0mbIJ7S7pUDxBywQRMz5lx1gy3QQIZ7bC-FQ8Q-vlM0FnXh8zbrplUvzcsyA9ZgxhP3OoSZN6cOWoAl3R8V',
    ],
    specs: [
      { label: 'Capacity', value: '5.0 cu. ft. Ultra Large' },
      { label: 'Motor', value: 'Direct Drive Inverter with AI Fabric Sensing' },
      { label: 'Sanitize', value: 'Steam+ Cycle (Allergiene Certified)' },
      { label: 'Speed', value: 'TurboWash 360 in under 30 minutes' },
    ],
    features: [
      'Built-in AI technology for optimal wash cycles',
      'ThinQ smart control & remote start',
      'ColdWash technology saves energy',
    ],
  },
];

export const schemes: Scheme[] = [
  {
    id: 'scheme-gold-10-plus-1',
    title: 'VoltFlex 10+1 Smart Gold Scheme',
    subtitle: 'Pay 10 months, VoltMart deposits the 11th month FREE!',
    description: 'Build your electronics budget with VoltMart. We deposit the final installment directly into your store wallet on maturity.',
    monthlyMin: 30,
    monthlyMax: 200,
    tenureMonths: 10,
    bonusMonth: 1,
    freeMonthBonus: true,
    aprPercent: 0,
    badge: '100% Free 11th Month',
    perks: [
      'Pay 10 monthly installments, get the 11th month 100% FREE',
      'Guaranteed 10% bonus value on maturity',
      '0% pre-closure penalty after 6 completed installments',
      'Redeemable on Apple, Samsung, Sony, LG, and more',
    ],
    terms: 'Minimum installment $30/month. Bonus applied upon completion of the 10th recurring payment. Full refund of principal available anytime.',
  },
  {
    id: 'scheme-phone-upgrade',
    title: 'Zero-Cost Smartphone Upgrade EMI',
    subtitle: 'Own flagship mobile tech from $49/mo with 0% APR',
    description: 'Upgrade to iPhone 15 Pro or Galaxy S24 Ultra with $0 down payment and zero hidden processing interest.',
    monthlyMin: 49,
    monthlyMax: 150,
    tenureMonths: 6,
    bonusMonth: 0,
    freeMonthBonus: false,
    aprPercent: 0,
    badge: '0% APR No-Cost EMI',
    perks: [
      'Flexible tenures: 3, 6, 9, or 12 months with 0% interest',
      'Zero processing fees and instant paperless KYC approval',
      'Complimentary 1-year front screen replacement warranty included',
    ],
    terms: 'Subject to credit assessment. Instant approval for verified VoltMart Gold tier customers.',
  },
  {
    id: 'scheme-appliance-trade-in',
    title: 'Appliance Exchange Bonanza',
    subtitle: 'Trade in old appliances for up to $350 instant bonus credit',
    description: 'Trade in any old refrigerator, television, or washing machine for guaranteed top valuation credit plus 15% festival exchange bonus.',
    monthlyMin: 60,
    monthlyMax: 300,
    tenureMonths: 12,
    bonusMonth: 0,
    freeMonthBonus: false,
    aprPercent: 0,
    badge: '+15% Bonus Trade-In',
    perks: [
      'Free doorstep evaluation and pickup of old appliance',
      'Instant store wallet credit redeemable immediately',
      'Additional $60 bank cashback on leading credit/debit cards',
    ],
    terms: 'Appliance must power on. Trade-in valuation credited within 24 hours of doorstep pickup.',
  },
];

export const activeSchemes: ActiveScheme[] = [
  {
    id: 'active-sch-1',
    schemeName: 'VoltFlex 10+1 Gold Savings',
    schemeCode: 'VLT-SCH-84920',
    monthlyDeposit: 100,
    paidMonths: 7,
    totalMonths: 10,
    startDate: 'Mar 15, 2026',
    nextDebitDate: 'Oct 15, 2026',
    maturityDate: 'Jan 15, 2027',
    accumulatedSavings: 700,
    bonusEarned: 100,
    status: 'Active',
    mandateBank: 'Chase Premier Checking',
    mandateAccLast4: '4821',
  },
  {
    id: 'active-sch-2',
    schemeName: 'Flagship Phone Upgrade Scheme',
    schemeCode: 'VLT-SCH-19284',
    monthlyDeposit: 65,
    paidMonths: 5,
    totalMonths: 6,
    startDate: 'May 10, 2026',
    nextDebitDate: 'Oct 10, 2026',
    maturityDate: 'Nov 10, 2026',
    accumulatedSavings: 325,
    bonusEarned: 0,
    status: 'Active',
    mandateBank: 'Wells Fargo Preferred',
    mandateAccLast4: '9012',
  },
];

export const orders: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'VM-ORD-92841',
    date: 'Sep 26, 2026',
    items: [
      {
        product: products[0],
        quantity: 1,
        plan: 'scheme',
      },
    ],
    totalAmount: 99.0,
    status: 'Out for Delivery',
    courier: 'VoltMart Fleet Dispatch (Hub #1)',
    trackingNumber: 'VLT-TRK-7749210',
    estimatedDelivery: 'Today by 4:30 PM',
    shippingAddress: '428 Lexington Ave, Apt 9B, New York, NY 10017',
  },
];

export const warranties: WarrantyItem[] = [
  {
    id: 'war-01',
    productName: 'Samsung 65" Neo QLED 4K Smart TV',
    brand: 'Samsung',
    model: 'QN90C-65',
    serialNumber: 'SN-SAM-889104-NX',
    purchaseDate: 'Sep 26, 2026',
    expiryDate: 'Sep 26, 2028',
    coverageYears: 2,
    status: 'Active',
    invoiceNumber: 'INV-2026-92841',
  },
  {
    id: 'war-02',
    productName: 'Sony WH-1000XM5 ANC Headphones',
    brand: 'Sony',
    model: 'WH-1000XM5-B',
    serialNumber: 'SN-SNY-331902-MK',
    purchaseDate: 'Aug 14, 2026',
    expiryDate: 'Aug 14, 2028',
    coverageYears: 2,
    status: 'Active',
    invoiceNumber: 'INV-2026-88120',
  },
];

export const refunds: RefundRecord[] = [
  {
    id: 'ref-01',
    referenceNo: 'REF-2026-4410',
    schemeCode: 'VLT-SCH-44109',
    schemeName: 'Appliance Exchange Scheme',
    grossDeposit: 450.0,
    penaltyFee: 9.0,
    netPayout: 441.0,
    bankName: 'Chase Premier Checking',
    accountEnding: '4821',
    initiatedAt: 'Sep 20, 2026',
    creditedAt: 'Sep 21, 2026',
    status: 'Credited',
    utrNumber: 'UTR-CHAS-9981240182',
  },
];

export const bankMandates: BankMandate[] = [
  {
    id: 'man-1',
    bankName: 'Chase Premier Checking',
    accountEnding: '4821',
    recurringLimit: 500,
    status: 'Active',
    frequency: 'Monthly',
    debitDay: 15,
  },
  {
    id: 'man-2',
    bankName: 'Wells Fargo Preferred',
    accountEnding: '9012',
    recurringLimit: 300,
    status: 'Active',
    frequency: 'Monthly',
    debitDay: 10,
  },
];

export const userProfile: UserProfile = {
  name: 'Alexander Rivera',
  email: 'alexander.rivera@example.com',
  phone: '+1 (555) 019-2834',
  tier: 'Gold Tier',
  address: '428 Lexington Ave, Apt 9B, New York, NY 10017',
  kycVerified: true,
  pushAlerts: true,
  autoApplyVoucher: true,
};

export const storeHubs = [
  'Downtown Flagship Hub #1',
  'Westside Electronics Hub #2',
  'Northside Mega Hub #3',
  'Midtown Tech Center #4',
];
