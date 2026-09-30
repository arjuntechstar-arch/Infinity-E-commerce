import React, { useState } from 'react';
import {
  MOCK_PRODUCTS,
  MOCK_SCHEMES,
  INITIAL_ACTIVE_SCHEMES,
  INITIAL_ORDERS,
  INITIAL_WARRANTIES,
  INITIAL_REFUNDS,
  STORE_HUBS,
} from './data/mockData';
import {
  Product,
  Scheme,
  ActiveScheme,
  CartItem,
  Order,
  WarrantyItem,
  RefundRecord,
} from './types';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { SchemesView } from './components/SchemesView';
import { SearchView } from './components/SearchView';
import { PaymentsView } from './components/PaymentsView';
import { AccountView } from './components/AccountView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartModal } from './components/CartModal';
import { KycModal } from './components/KycModal';
import { AutopayMandateModal } from './components/AutopayMandateModal';
import { SchemeSuccessModal } from './components/SchemeSuccessModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { WarrantiesModal } from './components/WarrantiesModal';
import { RefundWithdrawalModal } from './components/RefundWithdrawalModal';
import { ReceiptViewerModal } from './components/ReceiptViewerModal';
import { ConciergeChatModal } from './components/ConciergeChatModal';
import { ChangePhoneModal } from './components/ChangePhoneModal';
import { PrototypeInspectorModal } from './components/PrototypeInspectorModal';
import { api } from './api/client';

export const App: React.FC = () => {
  // Navigation & Hub
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [currentHub, setCurrentHub] = useState(STORE_HUBS[0]);
  const [searchCategory, setSearchCategory] = useState<string | undefined>();

  // Data States
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [schemes, setSchemes] = useState<Scheme[]>(MOCK_SCHEMES);
  const [activeSchemes, setActiveSchemes] = useState<ActiveScheme[]>(INITIAL_ACTIVE_SCHEMES);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { product: MOCK_PRODUCTS[1], quantity: 1, plan: 'scheme' },
  ]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [warranties, setWarranties] = useState<WarrantyItem[]>(INITIAL_WARRANTIES);
  const [refunds, setRefunds] = useState<RefundRecord[]>(INITIAL_REFUNDS);
  const [kycVerified, setKycVerified] = useState(true);

  // Load live data from Backend API on mount
  React.useEffect(() => {
    api.getProducts().then((res) => {
      if (res.data?.length) setProducts(res.data);
    }).catch(() => {});

    api.getSchemes().then((res) => {
      if (res.data?.length) setSchemes(res.data);
    }).catch(() => {});

    api.getEnrolledSchemes().then((res) => {
      if (res.data?.length) setActiveSchemes(res.data);
    }).catch(() => {});

    api.getOrders().then((res) => {
      if (res.data?.length) setOrders(res.data);
    }).catch(() => {});

    api.getWarranties().then((res) => {
      if (res.data?.length) setWarranties(res.data);
    }).catch(() => {});

    api.getRefunds().then((res) => {
      if (res.data?.length) setRefunds(res.data);
    }).catch(() => {});

    api.getKycStatus().then((res) => {
      if (res.data?.kycVerified !== undefined) setKycVerified(res.data.kycVerified);
    }).catch(() => {});
  }, []);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isKycOpen, setIsKycOpen] = useState(false);
  const [isMandateOpen, setIsMandateOpen] = useState(false);
  const [mandateContext, setMandateContext] = useState<{
    monthlyDeposit: number;
    schemeTitle: string;
    schemeId?: string;
  } | null>(null);
  const [successScheme, setSuccessScheme] = useState<ActiveScheme | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isWarrantiesOpen, setIsWarrantiesOpen] = useState(false);
  const [withdrawalScheme, setWithdrawalScheme] = useState<ActiveScheme | null>(null);
  const [receiptModalData, setReceiptModalData] = useState<{
    scheme?: ActiveScheme;
    refund?: RefundRecord;
  } | null>(null);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [isChangePhoneOpen, setIsChangePhoneOpen] = useState(false);
  const [isPrototypesOpen, setIsPrototypesOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handlePrototypeNavigate = (actionKey: string) => {
    switch (actionKey) {
      case 'open-home':
        setCurrentTab('home');
        break;
      case 'open-search':
        setCurrentTab('search');
        break;
      case 'open-product-detail':
        setSelectedProduct(products[0]);
        break;
      case 'open-cart':
        setIsCartOpen(true);
        break;
      case 'open-schemes':
        setCurrentTab('schemes');
        break;
      case 'open-mandate':
        setMandateContext({ monthlyDeposit: 100, schemeTitle: 'VoltFlex 10+1 Gold Savings' });
        setIsMandateOpen(true);
        break;
      case 'open-kyc':
        setIsKycOpen(true);
        break;
      case 'open-scheme-success':
        setSuccessScheme(activeSchemes[0] || null);
        break;
      case 'open-order-tracking':
        if (orders[0]) setSelectedOrder(orders[0]);
        break;
      case 'open-warranties':
        setIsWarrantiesOpen(true);
        break;
      case 'open-payments':
        setCurrentTab('payments');
        break;
      case 'open-withdrawal':
        if (activeSchemes[0]) setWithdrawalScheme(activeSchemes[0]);
        break;
      case 'open-receipt':
        if (activeSchemes[0]) setReceiptModalData({ scheme: activeSchemes[0] });
        break;
      case 'open-concierge':
        setIsConciergeOpen(true);
        break;
      case 'open-change-phone':
        setIsChangePhoneOpen(true);
        break;
      case 'open-account':
        setCurrentTab('account');
        break;
      default:
        break;
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Cart operations
  const handleAddToCart = (product: Product, plan: 'full' | 'scheme') => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.plan === plan);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.plan === plan
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, plan }];
    });
    showToast(`Added ${product.title.slice(0, 24)}... to Cart!`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((it) => (it.product.id === productId ? { ...it, quantity } : it))
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((it) => it.product.id !== productId));
  };

  // Direct scheme enrollment
  const handleStartSchemeEnrollment = (schemeTitle: string, monthlyDeposit: number) => {
    if (!kycVerified) {
      showToast('Please complete quick KYC first');
      setIsKycOpen(true);
      return;
    }

    setMandateContext({
      monthlyDeposit,
      schemeTitle,
    });
    setIsMandateOpen(true);
  };

  const handleMandateSuccess = (bankName: string, accountLast4: string) => {
    const deposit = mandateContext?.monthlyDeposit || 100;
    const title = mandateContext?.schemeTitle || 'VoltFlex 10+1 Gold Savings';

    // Call Backend API
    api.enrollScheme({
      schemeTitle: title,
      monthlyDeposit: deposit,
      mandateBank: bankName,
      mandateAccLast4: accountLast4,
    }).then((res) => {
      if (res.data) {
        setActiveSchemes((prev) => [res.data, ...prev.filter((s) => s.id !== res.data.id)]);
        setSuccessScheme(res.data);
      }
    }).catch(() => {
      // Fallback in-memory
      const randomCode = `VLT-SCH-${Math.floor(10000 + Math.random() * 90000)}`;
      const newScheme: ActiveScheme = {
        id: `sch-${Date.now()}`,
        schemeName: title,
        schemeCode: randomCode,
        monthlyDeposit: deposit,
        paidMonths: 1,
        totalMonths: 10,
        startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        nextDebitDate: 'Nov 15, 2026',
        maturityDate: 'Sep 15, 2027',
        accumulatedSavings: deposit,
        bonusEarned: deposit,
        status: 'Active',
        mandateBank: bankName,
        mandateAccLast4: accountLast4,
      };
      setActiveSchemes((prev) => [newScheme, ...prev]);
      setSuccessScheme(newScheme);
    });

    showToast('Scheme mandate established successfully!');
  };

  // Order Placement
  const handleProceedCheckout = (voucherApplied: boolean, voucherDiscount: number) => {
    // Call Backend API
    api.createOrder({
      items: [...cartItems],
      voucherCode: voucherApplied ? 'VOLT50' : undefined,
      deliveryType: 'delivery',
      shippingAddress: '428 Lexington Ave, Apt 9B, New York, NY 10017',
    }).then((res) => {
      if (res.data) {
        setOrders((prev) => [res.data, ...prev.filter((o) => o.id !== res.data.id)]);
        setSelectedOrder(res.data);
        // refresh warranties from backend
        api.getWarranties().then((wRes) => {
          if (wRes.data) setWarranties(wRes.data);
        });
      }
    }).catch(() => {
      const newOrderId = `ord-${Date.now()}`;
      const orderNumber = `VM-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      const totalAmount = cartItems.reduce((sum, item) => {
        const price = item.plan === 'scheme' ? item.product.monthlySchemePrice : item.product.price;
        return sum + price * item.quantity;
      }, 0) - (voucherApplied ? voucherDiscount : 0);

      const newOrder: Order = {
        id: newOrderId,
        orderNumber,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        items: [...cartItems],
        totalAmount: Math.max(0, totalAmount),
        status: 'Confirmed',
        courier: 'VoltMart Fleet Dispatch (Hub #1)',
        trackingNumber: `VLT-TRK-${Math.floor(1000000 + Math.random() * 9000000)}`,
        estimatedDelivery: 'Tomorrow by 2:00 PM',
        shippingAddress: '428 Lexington Ave, Apt 9B, New York, NY 10017',
      };
      setOrders((prev) => [newOrder, ...prev]);
      setSelectedOrder(newOrder);
    });

    setCartItems([]);
    setIsCartOpen(false);
    showToast('Order placed successfully! Delivery tracking active.');
  };

  // Withdrawal
  const handleConfirmWithdrawal = (
    scheme: ActiveScheme,
    gross: number,
    penalty: number,
    net: number,
    bankName: string,
    accountEnding: string
  ) => {
    // Call Backend API
    api.withdrawScheme({
      schemeId: scheme.id,
      bankName,
      accountEnding,
    }).then((res) => {
      if (res.data?.refund) {
        setActiveSchemes((prev) => prev.filter((s) => s.id !== scheme.id));
        setRefunds((prev) => [res.data.refund, ...prev]);
        setReceiptModalData({ refund: res.data.refund });
      }
    }).catch(() => {
      setActiveSchemes((prev) => prev.filter((s) => s.id !== scheme.id));
      const newRefund: RefundRecord = {
        id: `ref-${Date.now()}`,
        referenceNo: `REF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        schemeCode: scheme.schemeCode,
        schemeName: scheme.schemeName,
        grossDeposit: gross,
        penaltyFee: penalty,
        netPayout: net,
        bankName,
        accountEnding,
        initiatedAt: 'Just now',
        creditedAt: 'Processing (within 24 hrs)',
        status: 'Processing',
        utrNumber: `UTR-${bankName.slice(0, 4).toUpperCase()}-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      };
      setRefunds((prev) => [newRefund, ...prev]);
      setReceiptModalData({ refund: newRefund });
    });

    showToast(`Withdrawal of $${net.toFixed(2)} initiated successfully!`);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentHub={currentHub}
        onSelectHub={setCurrentHub}
        cartCount={cartItems.reduce((c, i) => c + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAccount={() => setCurrentTab('account')}
        onOpenSearch={() => {
          setSearchCategory(undefined);
          setCurrentTab('search');
        }}
        onOpenNotifications={() => {
          showToast('You have 1 live order out for delivery!');
          if (orders[0]) setSelectedOrder(orders[0]);
        }}
        onOpenPrototypes={() => setIsPrototypesOpen(true)}
        unreadNotifications={1}
      />

      {/* Main Body Content by Tab */}
      <main className="flex-1 w-full max-w-4xl mx-auto pt-16">
        {currentTab === 'home' && (
          <HomeView
            products={products}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onAddToCart={handleAddToCart}
            onOpenSchemes={() => setCurrentTab('schemes')}
            onOpenSearch={(cat) => {
              setSearchCategory(cat);
              setCurrentTab('search');
            }}
            onEnrollSchemeDirect={(deposit) =>
              handleStartSchemeEnrollment('VoltFlex 10+1 Gold Savings', deposit)
            }
          />
        )}

        {currentTab === 'schemes' && (
          <SchemesView
            schemes={schemes}
            activeSchemes={activeSchemes}
            onEnrollScheme={(sch, deposit) =>
              handleStartSchemeEnrollment(sch.title, deposit)
            }
            onRequestWithdrawal={(sch) => setWithdrawalScheme(sch)}
            onViewReceipt={(sch) => setReceiptModalData({ scheme: sch })}
          />
        )}

        {currentTab === 'search' && (
          <SearchView
            products={products}
            initialCategory={searchCategory}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onAddToCart={handleAddToCart}
            onClose={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'payments' && (
          <PaymentsView
            activeSchemes={activeSchemes}
            refunds={refunds}
            onOpenWithdrawal={(sch) => setWithdrawalScheme(sch)}
            onOpenMandateSetup={() => {
              setMandateContext({
                monthlyDeposit: 100,
                schemeTitle: 'VoltFlex Scheme Mandate',
              });
              setIsMandateOpen(true);
            }}
            onViewReceipt={(sch, ref) => setReceiptModalData({ scheme: sch, refund: ref })}
            onOpenSchemes={() => setCurrentTab('schemes')}
          />
        )}

        {currentTab === 'account' && (
          <AccountView
            warranties={warranties}
            orders={orders}
            onOpenWarranties={() => setIsWarrantiesOpen(true)}
            onOpenOrders={() => {
              if (orders[0]) setSelectedOrder(orders[0]);
            }}
            onOpenKyc={() => setIsKycOpen(true)}
            onChangePhone={() => setIsChangePhoneOpen(true)}
            kycVerified={kycVerified}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAssistant={() => setIsConciergeOpen(true)}
      />

      {/* Modals & Dialogs */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onDirectSchemeEnroll={(p, dep) =>
          handleStartSchemeEnrollment(`VoltFlex: ${p.title}`, dep)
        }
      />

      <CartModal
        isOpen={isCartOpen}
        items={cartItems}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedCheckout={handleProceedCheckout}
      />

      <KycModal
        isOpen={isKycOpen}
        onClose={() => setIsKycOpen(false)}
        onSuccess={() => {
          setKycVerified(true);
          showToast('KYC Verified Successfully!');
        }}
      />

      <AutopayMandateModal
        isOpen={isMandateOpen}
        onClose={() => setIsMandateOpen(false)}
        monthlyDeposit={mandateContext?.monthlyDeposit}
        schemeTitle={mandateContext?.schemeTitle}
        onSuccess={handleMandateSuccess}
      />

      <SchemeSuccessModal
        scheme={successScheme}
        onClose={() => setSuccessScheme(null)}
        onGoToLedger={() => {
          setSuccessScheme(null);
          setCurrentTab('payments');
        }}
      />

      <OrderTrackingModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      <WarrantiesModal
        isOpen={isWarrantiesOpen}
        onClose={() => setIsWarrantiesOpen(false)}
        warranties={warranties}
        onFileClaim={(war) => {
          showToast(`Repair claim filed for ${war.productName}! Technician will call in 2h.`);
        }}
      />

      <RefundWithdrawalModal
        scheme={withdrawalScheme}
        onClose={() => setWithdrawalScheme(null)}
        onConfirmWithdrawal={handleConfirmWithdrawal}
      />

      <ReceiptViewerModal
        scheme={receiptModalData?.scheme}
        refund={receiptModalData?.refund}
        onClose={() => setReceiptModalData(null)}
      />

      <ConciergeChatModal
        isOpen={isConciergeOpen}
        onClose={() => setIsConciergeOpen(false)}
        activeSchemes={activeSchemes}
        onOpenLedger={() => setCurrentTab('payments')}
        onOpenSchemes={() => setCurrentTab('schemes')}
      />

      <ChangePhoneModal
        isOpen={isChangePhoneOpen}
        onClose={() => setIsChangePhoneOpen(false)}
        onSuccess={(newPhone) => {
          showToast(`Phone number updated to ${newPhone}!`);
        }}
      />

      <PrototypeInspectorModal
        isOpen={isPrototypesOpen}
        onClose={() => setIsPrototypesOpen(false)}
        onNavigate={handlePrototypeNavigate}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-24 left-4 right-4 max-w-sm mx-auto z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary-fixed text-lg">check_circle</span>
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-outline">VoltMart</span>
        </div>
      )}
    </div>
  );
};
export default App;
