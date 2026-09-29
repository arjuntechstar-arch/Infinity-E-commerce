import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ActiveScheme } from '../types';

interface ConciergeChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSchemes: ActiveScheme[];
  onOpenLedger: () => void;
  onOpenSchemes: () => void;
}

export const ConciergeChatModal: React.FC<ConciergeChatModalProps> = ({
  isOpen,
  onClose,
  activeSchemes,
  onOpenLedger,
  onOpenSchemes,
}) => {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'agent',
      text: 'Hello Alexander! 👋 I am your VoltMart 24/7 Scheme Concierge. How can I help power your shopping today?',
      timestamp: 'Just now',
      quickReplies: [
        'How does 10+1 scheme work?',
        'When is my next debit?',
        'Can I withdraw early?',
        'Warranty claim process',
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = "I'm here to help with all VoltMart schemes, installment orders, and warranties!";
      let quick: string[] | undefined = undefined;

      const lower = text.toLowerCase();
      if (lower.includes('10+1') || lower.includes('how does') || lower.includes('work')) {
        reply =
          'In the VoltFlex 10+1 scheme, you deposit monthly installments for 10 months (e.g. $50 or $100/mo). Upon completing the 10th month, VoltMart contributes the 11th installment 100% FREE as shopping credit to buy any smartphone, TV, or appliance!';
        quick = ['Enroll in 10+1 Scheme', 'View Available Schemes'];
      } else if (lower.includes('debit') || lower.includes('when') || lower.includes('mandate')) {
        const nextDate = activeSchemes[0]?.nextDebitDate || 'Oct 15, 2026';
        reply = `Your next automated bank debit is scheduled for ${nextDate} for $${activeSchemes[0]?.monthlyDeposit || 100} from your linked ${activeSchemes[0]?.mandateBank || 'Chase checking'} account.`;
        quick = ['Go to Payments Ledger', 'Manage Bank Mandate'];
      } else if (lower.includes('withdraw') || lower.includes('refund') || lower.includes('cancel')) {
        reply =
          'You can withdraw funds from any active scheme anytime! If completed 6+ installments, there is 0% cancellation penalty. Your principal savings will be credited directly to your bank account within 24 hours.';
        quick = ['Request Withdrawal', 'View Refund Ledger'];
      } else if (lower.includes('warranty') || lower.includes('repair') || lower.includes('claim')) {
        reply =
          'All electronics purchased through VoltMart come with our 2-Year Official Brand Shield! If your device needs inspection or repair, you can file a complimentary claim directly from your Digital Warranty Vault.';
        quick = ['Open Warranty Vault', 'Call Store Expert'];
      } else {
        reply = `Understood! You have ${activeSchemes.length} active schemes with $${activeSchemes.reduce(
          (s, a) => s + a.accumulatedSavings,
          0
        )} saved. What would you like to explore next?`;
        quick = ['Browse Products', 'View Active Schemes', 'Check Delivery'];
      }

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: reply,
          timestamp: 'Just now',
          quickReplies: quick,
        },
      ]);
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-primary to-primary-container text-on-primary flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-full bg-surface-container-lowest/20 backdrop-blur-md flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-tertiary-fixed ring-2 ring-primary"></span>
            </div>
            <div>
              <h3 className="text-sm font-bold leading-none">VoltMart Scheme Concierge</h3>
              <span className="text-[11px] text-tertiary-fixed font-semibold">Online • 24/7 Priority Support</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-white/80 hover:text-white">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-surface-container-low/40 no-scrollbar">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-primary text-on-primary rounded-br-none shadow-sm'
                    : 'bg-surface-container-lowest text-on-surface rounded-bl-none shadow-sm border border-outline-variant/20'
                }`}
              >
                {m.text}
              </div>

              {m.quickReplies && m.quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {m.quickReplies.map((qr, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (qr === 'Go to Payments Ledger' || qr === 'View in Ledger') {
                          onOpenLedger();
                          onClose();
                        } else if (qr === 'Enroll in 10+1 Scheme' || qr === 'View Available Schemes') {
                          onOpenSchemes();
                          onClose();
                        } else {
                          handleSend(qr);
                        }
                      }}
                      className="px-2.5 py-1 rounded-full bg-surface-container-lowest border border-primary/30 text-primary font-semibold text-[11px] hover:bg-primary-fixed/40 transition-colors"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 text-outline w-20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-surface-container-lowest border-t border-outline-variant/20 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about schemes, debits, delivery, refunds..."
              className="flex-1 bg-surface-container-low py-2.5 px-3.5 rounded-full text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center disabled:opacity-40 transition-opacity active:scale-95 shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
