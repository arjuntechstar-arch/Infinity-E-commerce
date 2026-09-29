import React from 'react';
import { Order } from '../types';

interface OrderTrackingModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const steps = [
    { label: 'Order Confirmed', time: 'Sep 26, 10:14 AM', done: true },
    { label: 'Hub Quality Check & 2-Yr Shield Tagged', time: 'Sep 26, 11:30 AM', done: true },
    { label: 'Dispatched from Downtown Hub', time: 'Sep 26, 01:45 PM', done: true },
    { label: 'Out for Delivery (Fleet Van #14)', time: 'En Route (8 mins away)', done: true, current: true },
    { label: 'Delivery Completed', time: 'Pending confirmation', done: false },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-primary text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px]">local_shipping</span>
            <div>
              <h3 className="text-sm font-bold leading-none">Order & Live Delivery Tracking</h3>
              <span className="text-[11px] text-on-primary-container">Ref: {order.orderNumber}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-white/80 hover:text-white">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs no-scrollbar">
          {/* Status Alert Banner */}
          <div className="p-3.5 rounded-2xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-secondary text-2xl animate-pulse">
                electric_moped
              </span>
              <div>
                <span className="font-extrabold text-xs block">Out for Delivery</span>
                <span className="text-[11px] font-medium">{order.estimatedDelivery}</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-secondary text-white text-[10px] font-extrabold uppercase">
              Live
            </span>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="font-bold text-outline uppercase tracking-wider text-[11px] mb-3">
              Shipment Journey
            </h4>
            <div className="space-y-4 pl-2 border-l-2 border-primary/30 ml-2">
              {steps.map((st, i) => (
                <div key={i} className="relative pl-4">
                  <div
                    className={`absolute -left-[19px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                      st.current
                        ? 'bg-secondary ring-4 ring-secondary/20 animate-pulse'
                        : st.done
                        ? 'bg-primary'
                        : 'bg-outline-variant'
                    }`}
                  >
                    {st.done && !st.current && (
                      <span className="material-symbols-outlined text-[10px] text-white">check</span>
                    )}
                  </div>
                  <div>
                    <span
                      className={`text-xs block ${
                        st.current
                          ? 'font-extrabold text-secondary'
                          : st.done
                          ? 'font-bold text-on-surface'
                          : 'text-outline'
                      }`}
                    >
                      {st.label}
                    </span>
                    <span className="text-[10px] text-on-surface-variant">{st.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Driver Contact Card */}
          <div className="p-3 bg-surface-container-low rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">
                <span className="material-symbols-outlined text-lg">person</span>
              </div>
              <div>
                <span className="text-xs font-bold text-on-surface block">Driver: Marcus Vance</span>
                <span className="text-[11px] text-outline">VoltMart Express Courier</span>
              </div>
            </div>
            <button
              onClick={() => alert('Calling Marcus Vance (+1 555-019-3382)...')}
              className="px-3 py-1.5 rounded-full bg-surface-container-lowest text-primary text-xs font-bold shadow-sm active:scale-95 transition-transform flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">call</span>
              <span>Call</span>
            </button>
          </div>

          {/* Delivery Address */}
          <div className="p-3 bg-surface-container-low rounded-2xl">
            <span className="text-[10px] font-bold text-outline uppercase block mb-1">
              Destination Address
            </span>
            <p className="text-xs font-medium text-on-surface">{order.shippingAddress}</p>
          </div>

          {/* Items in shipment */}
          <div>
            <span className="text-[10px] font-bold text-outline uppercase block mb-2">Package Contents</span>
            {order.items.map((it, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-surface-container-low">
                <img
                  src={it.product.images[0]}
                  alt={it.product.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-on-surface truncate block">
                    {it.product.title}
                  </span>
                  <span className="text-[10px] text-outline">Qty: {it.quantity} • Plan: {it.plan}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
