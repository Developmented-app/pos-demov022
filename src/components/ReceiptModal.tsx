import React, { useRef, useState } from 'react';
import { Order } from '../types';
import { Printer, Download, X, Check, Heart, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import EmailReceiptModal from './EmailReceiptModal';

interface ReceiptModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onDispatchAlert?: (
    type: 'checkout' | 'cancel' | 'system',
    title: string,
    message: string,
    orderDetails?: { orderId?: string; orderNo?: number | string; total?: number }
  ) => void;
}

export default function ReceiptModal({ isOpen, order, onClose, onDispatchAlert }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  if (!isOpen || !order) return null;

  // Function to serialize receipt to .txt
  const handleDownloadTxt = () => {
    if (!order) return;
    
    const divider = '==========================================\n';
    const subdivider = '------------------------------------------\n';
    
    let txt = '';
    txt += '            NORDIC ROASTERY CO.           \n';
    txt += '          128 FIKA BLVD, SUITE A          \n';
    txt += '             HELSINKI METRO               \n';
    txt += `Order No: #${order.orderNo} | Term: Register 01\n`;
    txt += `Timestamp: ${new Date(order.timestamp).toLocaleString()}\n`;
    txt += `Cashier: ${order.cashier}\n`;
    txt += divider;
    txt += 'Item                     Qty     Price    Total\n';
    txt += subdivider;
    
    order.items.forEach(item => {
      const nameCol = item.name.padEnd(23, ' ').substring(0, 23);
      const qtyCol = item.quantity.toString().padStart(4, ' ');
      const priceCol = item.price.toFixed(2).padStart(8, ' ');
      const totalCol = item.subtotal.toFixed(2).padStart(8, ' ');
      txt += `${nameCol}${qtyCol}${priceCol}${totalCol}\n`;
    });
    
    txt += subdivider;
    txt += `Subtotal:`.padEnd(34, ' ') + `$${order.subtotal.toFixed(2).padStart(7, ' ')}\n`;
    
    if (order.discount > 0) {
      const discountLabel = `Discount (${order.discountCode || 'PROMO'}):`;
      txt += discountLabel.padEnd(34, ' ') + `-$${order.discount.toFixed(2).padStart(7, ' ')}\n`;
    }
    
    txt += `Sales Tax (8.25%):`.padEnd(34, ' ') + `$${order.tax.toFixed(2).padStart(7, ' ')}\n`;
    txt += divider;
    txt += `TOTAL:`.padEnd(34, ' ') + `$${order.total.toFixed(2).padStart(7, ' ')}\n`;
    txt += divider;
    txt += `Payment: ${order.paymentMethod.toUpperCase()}`.padEnd(34, ' ') + `$${order.amountReceived.toFixed(2).padStart(7, ' ')}\n`;
    txt += `Change Due:`.padEnd(34, ' ') + `$${order.changeDue.toFixed(2).padStart(7, ' ')}\n`;
    txt += divider;
    txt += '          T H A N K   Y O U !             \n';
    txt += '        HAVE A LOVELY, INSPIRED DAY       \n';
    
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Receipt-Order-${order.orderNo}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Trigger standard page printing flow with high-fidelity thermal stylesheets
  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Modal wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative max-h-[92vh] w-full max-w-sm flex flex-col rounded-2xl bg-slate-100 shadow-2xl overflow-hidden border border-slate-200"
          id="receipt-modal"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between bg-slate-900 px-5 py-3.5 text-white">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 p-0.5 text-emerald-400">
                <Check className="h-4 w-4 stroke-[3]" />
              </span>
              <span className="font-sans text-sm font-semibold tracking-wide">Checkout Successful</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              id="close-receipt-modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Receipt Scroller */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex items-start justify-center">
            {/* The physical-looking Paper Slip */}
            <div
              ref={receiptRef}
              className="w-full bg-white px-5 py-6 shadow-md border-x border-slate-200 relative select-none"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
              }}
              id="thermal-receipt"
            >
              {/* Thermal receipt zig-zag top edge pattern */}
              <div className="absolute top-0 inset-x-0 h-1.5 flex overflow-hidden">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-slate-100 rotate-45 transform -translate-y-1.5"
                  />
                ))}
              </div>

              {/* Store details */}
              <div className="text-center space-y-1 text-[11px] text-slate-400 font-medium pt-2">
                <div className="font-sans font-extrabold text-base text-slate-800 tracking-tight leading-none uppercase pt-2">
                  NORDIC ROASTERY
                </div>
                <div>128 FIKA BLVD, SUITE A</div>
                <div>+358 09 1234567</div>
              </div>

              {/* Order specifications */}
              <div className="mt-5 border-t border-dashed border-slate-300 pt-3 text-[10px] text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>ORDER : #{order.orderNo}</span>
                  <span>REG : #01</span>
                </div>
                <div className="flex justify-between">
                  <span>CASHIER: {order.cashier}</span>
                  <span className="uppercase">{order.paymentMethod}</span>
                </div>
                <div className="text-[9px] text-slate-400">
                  DATE: {new Date(order.timestamp).toLocaleString()}
                </div>
              </div>

              {/* Itemized list */}
              <div className="mt-4 border-t border-dashed border-slate-300 pt-3 text-xs text-slate-700 font-medium">
                <div className="text-[10px] text-slate-400 flex justify-between pb-1.5 font-sans uppercase">
                  <span>Item</span>
                  <div className="flex gap-4">
                    <span className="w-8 text-right">Qty</span>
                    <span className="w-12 text-right">Total</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex justify-between items-start text-[11px]">
                      <span className="truncate pr-2 font-sans text-slate-800 leading-tight">
                        {item.name}
                      </span>
                      <div className="flex gap-4 flex-shrink-0 text-slate-900 font-mono">
                        <span className="w-8 text-right text-slate-400">x{item.quantity}</span>
                        <span className="w-12 text-right">${item.subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Section */}
              <div className="mt-4 border-t border-dashed border-slate-300 pt-3 text-xs space-y-1.5 font-medium">
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 text-[11px]">
                    <span className="font-sans">Discount {order.discountCode && `(${order.discountCode})`}</span>
                    <span>-${order.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Sales Tax (8.25%)</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-950 font-bold text-sm border-t border-dashed border-slate-300 pt-2 pb-1 font-mono">
                  <span>TOTAL</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="mt-2 border-t border-dotted border-slate-200 pt-2 text-[10px] text-slate-500 space-y-1 font-medium">
                <div className="flex justify-between">
                  <span>Tendered ({order.paymentMethod})</span>
                  <span>${order.amountReceived.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-semibold">
                  <span>Change Given</span>
                  <span>${order.changeDue.toFixed(2)}</span>
                </div>
              </div>

              {/* Footer heart / message */}
              <div className="mt-6 text-center space-y-2 border-t border-dashed border-slate-300 pt-4">
                <div className="inline-flex items-center justify-center rounded-full bg-slate-50 p-1">
                  <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
                </div>
                <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase leading-tight font-sans">
                  Kiitos! Thank You!
                </div>
                <div className="text-[9px] text-slate-400 italic">
                  Have a beautiful day in Helsinki.
                </div>
              </div>

              {/* Barcode representation */}
              <div className="mt-5 flex flex-col items-center gap-1">
                <div className="h-6 w-4/5 bg-slate-900" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #0f172a, #0f172a 1px, #fff 1px, #fff 4px, #0f172a 4px, #0f172a 5px)' }} />
                <span className="text-[9px] text-slate-400 select-none">*{order.id.slice(0, 8).toUpperCase()}*</span>
              </div>

              {/* QR Code Scan To View Segment */}
              <div className="mt-5 border-t border-dashed border-slate-300 pt-4 flex flex-col items-center justify-center space-y-2 pb-1.5" id="receipt-qr-code-section">
                <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest font-sans">
                  Scan for Digital Ticket
                </span>
                <div className="p-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-3xs hover:scale-105 transition-transform duration-200">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&margin=4&color=0f172a&data=${encodeURIComponent(
                      `${window.location.origin}/?receiptId=${order.id}&amount=${order.total.toFixed(2)}`
                    )}`}
                    alt="Digital Receipt Scan QR Code Link"
                    className="h-28 w-28 object-contain shrink-0 mix-blend-multiply"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-center space-y-0.5">
                  <div className="font-mono text-[8px] text-slate-400">
                    ID: {order.id.slice(0, 16).toUpperCase()}...
                  </div>
                  <div className="font-bold text-[9px] text-indigo-650 font-sans">
                    Digital Ticket amount: ${order.total.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Thermal bottom jagged edge */}
              <div className="absolute bottom-0 inset-x-0 h-1.5 flex overflow-hidden">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-slate-100 rotate-45 transform translate-y-0.75"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Checkout Modal Controls */}
          <div className="bg-slate-50 p-4 border-t border-slate-200 space-y-2.5">
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
              id="open-email-receipt-btn"
            >
              <Mail className="h-4 w-4" />
              Email Receipt Preview
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-all cursor-pointer"
                id="print-receipt-btn"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Ticket
              </button>
              <button
                onClick={handleDownloadTxt}
                className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-all cursor-pointer"
                id="download-receipt-txt-btn"
              >
                <Download className="h-3.5 w-3.5" />
                Download TXT
              </button>
            </div>
          </div>
        </motion.div>

        {/* Modular inline Email preview system */}
        <EmailReceiptModal
          isOpen={isEmailModalOpen}
          order={order}
          onClose={() => setIsEmailModalOpen(false)}
          onDispatchAlert={onDispatchAlert}
        />
      </div>
    </AnimatePresence>
  );
}
