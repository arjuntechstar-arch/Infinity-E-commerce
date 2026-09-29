import {
  Product,
  Scheme,
  ActiveScheme,
  Order,
  WarrantyItem,
  RefundRecord,
  CartItem,
} from '../types';

const BASE_URL = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorBody.message || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Products
  async getProducts(params?: {
    search?: string;
    category?: string;
    brand?: string;
    schemeEligible?: boolean;
    sort?: string;
  }): Promise<{ success: boolean; total: number; data: Product[] }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    if (params?.brand) query.set('brand', params.brand);
    if (params?.schemeEligible) query.set('schemeEligible', 'true');
    if (params?.sort) query.set('sort', params.sort);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/products${qs}`);
  },

  async getProductById(id: string): Promise<{ success: boolean; data: Product }> {
    return request(`/products/${id}`);
  },

  // Schemes
  async getSchemes(): Promise<{ success: boolean; data: Scheme[] }> {
    return request('/schemes');
  },

  async calculateScheme(monthlyDeposit: number, schemeId?: string): Promise<{
    success: boolean;
    data: {
      schemeId: string;
      monthlyDeposit: number;
      tenureMonths: number;
      bonusMonths: number;
      totalPaidByCustomer: number;
      bonusContributedByVoltMart: number;
      totalShoppingCredit: number;
      benefitSummary: string;
    };
  }> {
    return request('/schemes/calculate', {
      method: 'POST',
      body: JSON.stringify({ monthlyDeposit, schemeId }),
    });
  },

  async getEnrolledSchemes(): Promise<{
    success: boolean;
    vaultSummary: { totalSavings: number; totalBonus: number; activeCount: number };
    data: ActiveScheme[];
  }> {
    return request('/schemes/enrolled');
  },

  async enrollScheme(payload: {
    schemeTitle: string;
    monthlyDeposit: number;
    mandateBank?: string;
    mandateAccLast4?: string;
  }): Promise<{ success: boolean; message: string; data: ActiveScheme }> {
    return request('/schemes/enroll', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async withdrawScheme(payload: {
    schemeId: string;
    bankName?: string;
    accountEnding?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: { refund: RefundRecord; withdrawnScheme: ActiveScheme };
  }> {
    return request('/schemes/withdraw', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Orders
  async getOrders(): Promise<{ success: boolean; total: number; data: Order[] }> {
    return request('/orders');
  },

  async getOrderById(id: string): Promise<{ success: boolean; data: Order & { trackingTimeline: any[]; driver: any } }> {
    return request(`/orders/${id}`);
  },

  async createOrder(payload: {
    items: CartItem[];
    voucherCode?: string;
    deliveryType?: 'delivery' | 'pickup';
    shippingAddress?: string;
  }): Promise<{ success: boolean; message: string; data: Order }> {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Vouchers
  async validateVoucher(code: string, cartAmount: number): Promise<{
    success: boolean;
    message: string;
    data: { code: string; discount: number; description: string };
  }> {
    return request('/vouchers/validate', {
      method: 'POST',
      body: JSON.stringify({ code, cartAmount }),
    });
  },

  // Warranties
  async getWarranties(): Promise<{ success: boolean; total: number; data: WarrantyItem[] }> {
    return request('/warranties');
  },

  async fileWarrantyClaim(warrantyId: string, payload: { issueDescription?: string; pickupAddress?: string }): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    return request(`/warranties/${warrantyId}/claim`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Payments & Mandates
  async getPaymentSummary(): Promise<{
    success: boolean;
    data: { vaultBalance: number; maturityBonusEarned: number; activeMandatesCount: number; nextScheduledDebit: string };
  }> {
    return request('/payments/summary');
  },

  async getMandates(): Promise<{ success: boolean; total: number; data: any[] }> {
    return request('/payments/mandates');
  },

  async createMandate(payload: {
    bankName: string;
    accountNumber: string;
    recurringLimit: number;
    debitDay: number;
  }): Promise<{ success: boolean; message: string; data: any }> {
    return request('/payments/mandates', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getRefunds(): Promise<{ success: boolean; total: number; data: RefundRecord[] }> {
    return request('/payments/refunds');
  },

  async getReceipt(refNumber: string): Promise<{ success: boolean; data: any }> {
    return request(`/payments/receipt/${refNumber}`);
  },

  // KYC
  async getKycStatus(): Promise<{ success: boolean; data: any }> {
    return request('/kyc/status');
  },

  async submitKyc(payload: {
    documentType: string;
    documentNumber: string;
    dateOfBirth: string;
  }): Promise<{ success: boolean; message: string; data: any }> {
    return request('/kyc/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Profile
  async getProfile(): Promise<{ success: boolean; data: any }> {
    return request('/profile');
  },

  async updateProfile(payload: any): Promise<{ success: boolean; message: string; data: any }> {
    return request('/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async sendOtp(phone: string): Promise<{ success: boolean; message: string; demoCode: string }> {
    return request('/profile/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  async verifyOtp(phone: string, otp: string): Promise<{ success: boolean; message: string; data: any }> {
    return request('/profile/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
  },

  // Concierge Chat
  async sendConciergeMessage(message: string): Promise<{
    success: boolean;
    data: { reply: string; quickReplies?: string[]; timestamp: string };
  }> {
    return request('/concierge/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  // Hubs
  async getHubs(): Promise<{ success: boolean; total: number; data: any[] }> {
    return request('/hubs');
  },
};
