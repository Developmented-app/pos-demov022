import React, { useState } from 'react';
import { CartItem, DiscountCode, HeldOrder } from '../types';
import { ShoppingCart, Trash2, Tag, Percent, CreditCard, Banknote, Gift, Pause, Play, ArchiveRestore, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CheckoutCartProps {
  cart: CartItem[];
  onUpdateQty: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: (paymentMethod: 'cash' | 'card' | 'giftcard', amountReceived: number, promoCode?: string) => void;
  discountCodes: DiscountCode[];
  heldOrders: HeldOrder[];
  onHoldOrder: (tabName: string) => void;
  onRetrieveOrder: (heldId: string) => void;
}

export default function CheckoutCart({
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onCheckout,
  discountCodes,
  heldOrders,
  onHoldOrder,
  onRetrieveOrder,
}: CheckoutCartProps) {
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<DiscountCode | null>(null);
  const [promoError, setPromoError] = useState('');
  const [tabInput, setTabInput] = useState('');
  const [isHolding, setIsHolding] = useState(false);
  
  // Checkout & tender flows
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'giftcard'>('cash');
  const [cashTendered, setCashTendered] = useState('');
  const [showTenderScreen, setShowTenderScreen] = useState(false);

  // Totals calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      discountAmount = subtotal * (appliedPromo.value / 100);
    } else {
      // flat discount
      discountAmount = Math.min(subtotal, appliedPromo.value);
    }
  }

  const taxRate = 0.0825; // 8.25% Sales tax
  const taxAmount = Math.max(0, (subtotal - discountAmount) * taxRate);
  const totalAmount = Math.max(0, subtotal - discountAmount + taxAmount);

  // Validate and Apply Promo Code
  const handleApplyPromo = (codeToApply?: string) => {
    const code = (codeToApply || promoInput).trim().toUpperCase();
    if (!code) return;

    const promo = discountCodes.find((d) => d.code === code);
    if (!promo) {
      setPromoError('Invalid promo code');
      setAppliedPromo(null);
      return;
    }

    if (promo.minSubtotal && subtotal < promo.minSubtotal) {
      setPromoError(`Requires minimum subtotal of $${promo.minSubtotal}`);
      setAppliedPromo(null);
      return;
    }

    setAppliedPromo(promo);
    setPromoError('');
    if (!codeToApply) setPromoInput('');
  };

  const handleClearPromo = () => {
    setAppliedPromo(null);
    setPromoError('');
  };

  // Held Order Handlers
  const handleTriggerHold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tabInput.trim() || cart.length === 0) return;
    onHoldOrder(tabInput.trim());
    setTabInput('');
    setIsHolding(false);
  };

  // Instant cash helper presets
  const handleQuickCash = (amount: number) => {
    setCashTendered(amount.toString());
  };

  const handleExactCash = () => {
    setCashTendered(totalAmount.toFixed(2));
  };

  const changeDue = Math.max(0, (parseFloat(cashTendered) || 0) - totalAmount);
  const isCashInsufficient = paymentMethod === 'cash' && (parseFloat(cashTendered) || 0) < totalAmount;

  // Process the final transaction checkout validation
  const handleFinalPaymentSubmit = () => {
    const finalTender = paymentMethod === 'cash' ? (parseFloat(cashTendered) || 0) : totalAmount;
    onCheckout(paymentMethod, finalTender, appliedPromo?.code);
    
    // reset local cart checkout flows
    setCashTendered('');
    setShowTenderScreen(false);
    setAppliedPromo(null);
  };

  const triggerCheckoutFlow = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'cash') {
      setShowTenderScreen(true);
    } else {
      // Non-cash checkouts skip cash counting tender drawer
      onCheckout(paymentMethod, totalAmount, appliedPromo?.code);
      setAppliedPromo(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-3xl text-white shadow-xl overflow-hidden border border-slate-800" id="checkout-cart">
      {/* Upper Title Area */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-slate-800 p-2 text-slate-300">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-sans font-bold text-sm">Active Sale Ticket</h2>
            <p className="text-[10px] text-slate-400">Order Registers #01</p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={onClearCart}
            className="flex items-center gap-1 text-[11px] font-medium text-red-400 hover:text-red-300 transition-colors bg-red-900/20 px-2.5 py-1 rounded-lg"
            id="clear-cart-btn"
          >
            <Trash2 className="h-3 w-3" />
            Void Cart
          </button>
        )}
      </div>

      {/* Main Cart Items Scroll */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-[14rem]">
        <AnimatePresence initial={false}>
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12 space-y-3 select-none">
              <div className="text-4xl animate-pulse">🥐</div>
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-400">Your checkout register is empty</p>
                <p className="text-[10px] text-slate-500 mt-1">Select products on the left to start cash ticket</p>
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between gap-3 bg-slate-850 p-3 rounded-2xl border border-slate-800/60"
                id={`cart-item-${item.product.id}`}
              >
                {/* Product spec */}
                <div className="flex-1 min-w-0 flex items-center gap-2.5">
                  <div className="text-xl bg-slate-800 h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0">
                    {item.product.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-sans font-semibold text-xs truncate text-slate-200">
                      {item.product.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      PLU: {item.product.code} | ${item.product.price.toFixed(2)} ea
                    </p>
                  </div>
                </div>

                {/* Micro Quantity adjustment */}
                <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-1.5 py-1">
                  <button
                    onClick={() => onUpdateQty(item.product.id, item.quantity - 1)}
                    className="h-6 w-6 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 font-bold flex items-center justify-center transition-all cursor-pointer text-xs"
                    id={`decrement-qty-${item.product.id}`}
                  >
                    -
                  </button>
                  <span className="font-mono text-xs font-bold text-slate-100 min-w-4 text-center select-none">
                    {item.quantity}
                  </span>
                  <button
                    disabled={item.quantity >= item.product.stock}
                    onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                    className="h-6 w-6 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 font-bold flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer text-xs"
                    id={`increment-qty-${item.product.id}`}
                  >
                    +
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="text-right flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold w-14 block">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-slate-500 hover:text-red-400 p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
                    id={`remove-item-${item.product.id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Held Tabs Overlay/Selector */}
      {heldOrders.length > 0 && !isHolding && (
        <div className="px-5 py-2.5 bg-slate-950/50 border-t border-slate-800/80 flex items-center gap-3 overflow-x-auto min-h-[3.5rem]">
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase text-slate-500 tracking-wide flex-shrink-0">
            <ArchiveRestore className="h-3.5 w-3.5" />
            Tabs Held:
          </span>
          <div className="flex gap-2 flex-grow overflow-x-auto no-scrollbar py-0.5">
            {heldOrders.map((held) => (
              <button
                key={held.id}
                onClick={() => onRetrieveOrder(held.id)}
                className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-indigo-900/30 border border-indigo-800/40 hover:bg-indigo-900/60 hover:border-indigo-700/60 transition-all px-2.5 py-1 text-xs text-indigo-300 font-medium cursor-pointer"
                id={`retrieve-tab-${held.id}`}
              >
                <Play className="h-2.5 w-2.5 inline-block shrink-0" />
                <span className="max-w-[70px] truncate">{held.name}</span>
                <span className="text-[9px] font-mono bg-indigo-500/20 px-1 rounded-md text-indigo-200">
                  {held.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Holds Order Panel */}
      <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-850/40">
        {isHolding ? (
          <form onSubmit={handleTriggerHold} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Enter Tab / Name (e.g., Table 5)"
              value={tabInput}
              onChange={(e) => setTabInput(e.target.value)}
              className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              id="tab-name-input"
            />
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs px-4 py-1.5 font-medium text-white transition-all cursor-pointer"
              id="confirm-hold-btn"
            >
              Hold
            </button>
            <button
              type="button"
              onClick={() => setIsHolding(false)}
              className="rounded-xl border border-slate-700 text-xs px-3 py-1.5 font-medium text-slate-400 hover:bg-slate-800 transition-all cursor-pointer"
              id="cancel-hold-btn"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            disabled={cart.length === 0}
            onClick={() => setIsHolding(true)}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-800 hover:border-slate-700 py-1.5 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-medium"
            id="hold-ticket-btn"
          >
            <Pause className="h-3 w-3" />
            Hold Active Ticket (Save Tab)
          </button>
        )}
      </div>

      {/* Promos & Discounts */}
      <div className="px-5 py-3 border-t border-slate-800/85">
        {appliedPromo ? (
          <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-900/65 px-3 py-2 rounded-xl text-emerald-300 text-xs font-sans">
            <div className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-emerald-400" />
              <span>
                Promo Code <span className="font-mono font-bold">{appliedPromo.code}</span> applied: {appliedPromo.value}
                {appliedPromo.type === 'percent' ? '%' : '$'} off
              </span>
            </div>
            <button
              onClick={handleClearPromo}
              className="text-emerald-500 hover:text-red-400 p-0.5 rounded-sm hover:bg-emerald-900/20 font-sans"
              id="clear-applied-promo"
            >
              remove
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Tag className="h-3.5 w-3.5" />
                </div>
                <input
                  type="text"
                  placeholder="Coupon/Promo Code"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 uppercase tracking-wider focus:outline-hidden focus:border-slate-700"
                  id="promo-code-input"
                />
              </div>
              <button
                type="button"
                onClick={() => handleApplyPromo()}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 text-xs px-4 py-1.5 font-medium text-slate-300 active:scale-95 transition-all cursor-pointer border border-slate-700/50"
                id="apply-promo-btn"
              >
                Apply
              </button>
            </div>
            {promoError && (
              <p className="text-[10px] text-red-400 font-semibold pl-1">⚠ {promoError}</p>
            )}

            {/* Quick Promos shortcuts */}
            <div className="flex gap-1.5 flex-wrap pt-0.5">
              <span className="text-[9px] text-slate-500 uppercase font-semibold self-center pr-1 select-none">Quick:</span>
              <button
                onClick={() => handleApplyPromo('COFFEE10')}
                className="text-[9px] font-bold font-mono bg-slate-800 hover:bg-slate-750 text-slate-300 py-0.5 px-2 rounded-md uppercase border border-slate-700/35"
              >
                Coffee10 (10%)
              </button>
              <button
                onClick={() => handleApplyPromo('STAFF50')}
                className="text-[9px] font-bold font-mono bg-slate-800 hover:bg-slate-750 text-slate-300 py-0.5 px-2 rounded-md uppercase border border-slate-700/35"
              >
                Staff50 (50%)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bill summary details panel */}
      <div className="p-5 bg-slate-950 border-t border-slate-850 space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400 font-medium font-sans">
            <span>Subtotal</span>
            <span className="font-mono text-slate-300">${subtotal.toFixed(2)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-xs text-emerald-550 font-medium font-sans">
              <span>Promo Discounts</span>
              <span className="font-mono">-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-xs text-slate-400 font-medium font-sans">
            <span>Tax (8.25%)</span>
            <span className="font-mono text-slate-300">${taxAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm text-white font-extrabold font-sans pt-1 border-t border-slate-900">
            <span>TOTAL AMOUNT SECURED</span>
            <span className="font-mono text-lg">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Channels switch */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 mt-2">
          <button
            onClick={() => {
              setPaymentMethod('cash');
              setCashTendered('');
            }}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
              paymentMethod === 'cash' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
            id="paymode-cash"
          >
            <Banknote className="h-3.5 w-3.5" />
            Cash
          </button>
          <button
            onClick={() => setPaymentMethod('card')}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
              paymentMethod === 'card' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
            id="paymode-card"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Credit Card
          </button>
          <button
            onClick={() => setPaymentMethod('giftcard')}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
              paymentMethod === 'giftcard' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
            id="paymode-giftcard"
          >
            <Gift className="h-3.5 w-3.5" />
            Gift Card
          </button>
        </div>

        {/* Checkout Button */}
        <button
          disabled={cart.length === 0}
          onClick={triggerCheckoutFlow}
          className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-sans font-bold text-sm py-3.5 rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer mt-1"
          id="checkout-trigger-btn"
        >
          {paymentMethod === 'cash' ? 'Tender Cash Payment' : `Process Card Sale • $${totalAmount.toFixed(2)}`}
        </button>
      </div>

      {/* Tactile Cash Payment Tender Backdrop Overlay */}
      {showTenderScreen && (
        <AnimatePresence>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              onClick={() => setShowTenderScreen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
            />

            {/* Simulated Register Drawer panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-2xl bg-white text-slate-800 p-6 flex flex-col border border-slate-100 shadow-2xl"
              id="tender-drawer"
            >
              {/* Header */}
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-amber-500" />
                  <span className="font-sans font-bold text-slate-800">Cash Register Drawer</span>
                </div>
                <button
                  onClick={() => setShowTenderScreen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 font-sans cursor-pointer text-xs uppercase"
                >
                  Exit
                </button>
              </div>

              {/* Due summary */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 my-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Amount Due</div>
                  <div className="text-xl font-bold font-mono text-slate-900">${totalAmount.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Change Due</div>
                  <div className={`text-xl font-bold font-mono ${changeDue > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    ${changeDue.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Cash Keypad input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Cash Tendered ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 font-mono font-bold text-center text-lg text-slate-800 focus:outline-hidden focus:border-slate-550 focus:bg-white transition-all"
                  />
                </div>

                {/* Bill quick-tenders */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleQuickCash(5)}
                    className="py-2 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-55 flex flex-col items-center justify-center font-mono text-[11px] font-bold text-slate-600 transition-all cursor-pointer"
                  >
                    <span>$5 Bill</span>
                  </button>
                  <button
                    onClick={() => handleQuickCash(10)}
                    className="py-2 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-55 flex flex-col items-center justify-center font-mono text-[11px] font-bold text-slate-600 transition-all cursor-pointer"
                  >
                    <span>$10 Bill</span>
                  </button>
                  <button
                    onClick={() => handleQuickCash(20)}
                    className="py-2 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-55 flex flex-col items-center justify-center font-mono text-[11px] font-bold text-slate-600 transition-all cursor-pointer"
                  >
                    <span>$20 Bill</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleQuickCash(50)}
                    className="py-2 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-55 flex flex-col items-center justify-center font-mono text-[11px] font-bold text-slate-600 transition-all cursor-pointer"
                  >
                    <span>$50 Bill</span>
                  </button>
                  <button
                    onClick={() => handleQuickCash(100)}
                    className="py-2 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-55 flex flex-col items-center justify-center font-mono text-[11px] font-bold text-slate-600 transition-all cursor-pointer"
                  >
                    <span>$100 Bill</span>
                  </button>
                  <button
                    onClick={handleExactCash}
                    className="py-2 rounded-lg bg-slate-100 hover:bg-slate-200 flex flex-col items-center justify-center font-mono text-[10px] font-extrabold text-slate-800 transition-all cursor-pointer border border-transparent"
                  >
                    <span>Exact Cash</span>
                  </button>
                </div>
              </div>

              {/* Action */}
              <div className="mt-6 flex flex-col gap-2">
                <button
                  disabled={isCashInsufficient || !cashTendered}
                  onClick={handleFinalPaymentSubmit}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-sans font-bold text-sm py-3 rounded-xl transition-all cursor-pointer"
                >
                  {isCashInsufficient ? 'Insufficient Cash Tendered' : 'Complete Cash Sale & Open Drawer'}
                </button>
                <button
                  onClick={() => setShowTenderScreen(false)}
                  className="w-full text-center py-2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-semibold cursor-pointer"
                >
                  Go Back to Cart
                </button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
