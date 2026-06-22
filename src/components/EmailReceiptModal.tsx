import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Check, AlertCircle, Copy, Eye, Code, PlaneTakeoff, Heart, Sparkles, Send } from 'lucide-react';

interface EmailReceiptModalProps {
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

export default function EmailReceiptModal({ isOpen, order, onClose, onDispatchAlert }: EmailReceiptModalProps) {
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setEmailStatus('idle');
      setActiveTab('preview');
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  // Render items rows for HTML email
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #334155;">
        ${item.name}
      </td>
      <td align="center" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-family: 'SF Mono', SFMono-Regular, Consolas, monospace;">
        x${item.quantity}
      </td>
      <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0f172a; font-family: 'SF Mono', SFMono-Regular, Consolas, monospace;">
        $${item.subtotal.toFixed(2)}
      </td>
    </tr>`
    )
    .join('');

  // Render discount section if available
  const discountHtml =
    order.discount > 0
      ? `
    <tr>
      <td style="padding-bottom: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #10b981;">
        Discount (${order.discountCode || 'PROMO'})
      </td>
      <td align="right" style="padding-bottom: 8px; font-weight: bold; color: #10b981; font-family: 'SF Mono', SFMono-Regular, Consolas, monospace;">
        -$${order.discount.toFixed(2)}
      </td>
    </tr>`
      : '';

  // Fully formatted, inline-styled email template
  const formattedHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Nordic Roastery Receipt</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email ContainerCard -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);">
          <!-- Cozy Slate Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;">NORDIC ROASTERY</h1>
              <p style="color: #94a3b8; margin: 6px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;">PREMIUM FIKA CO. • HELSINKI</p>
            </td>
          </tr>
          
          <!-- Main Context Area -->
          <tr>
            <td style="padding: 32px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h2 style="color: #0f172a; margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 700;">Coffee is on the way!</h2>
                    <p style="color: #64748b; margin: 0 0 24px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; line-height: 1.5; color: #475569;">
                      Thank you for dining with Nordic Roastery. We hope you loved your artisan espresso, custom dessert bread, or fresh craft fika roast. Here is your digitized invoice receipt details:
                    </p>
                  </td>
                </tr>
                
                <!-- Ticket specs border grid -->
                <tr>
                  <td style="border-top: 1px dashed #cbd5e1; border-bottom: 1px dashed #cbd5e1; padding: 14px 0;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #64748b;">
                      <tr>
                        <td style="padding-bottom: 5px;"><strong>Invoicing ID:</strong> #${order.orderNo}</td>
                        <td align="right" style="padding-bottom: 5px;"><strong>Register Term:</strong> Lane 1</td>
                      </tr>
                      <tr>
                        <td><strong>Date Purchased:</strong> ${new Date(order.timestamp).toLocaleString()}</td>
                        <td align="right"><strong>Cashier Staff:</strong> ${order.cashier}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Spacer -->
                <tr><td height="20"></td></tr>
                
                <!-- Itemized Cart list -->
                <tr>
                  <td>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px;">
                      <!-- Table row header -->
                      <tr style="color: #94a3b8; font-weight: bold; text-transform: uppercase; font-size: 9px; letter-spacing: 0.05em;">
                        <th align="left" style="padding-bottom: 10px; border-bottom: 2px solid #f1f5f9;">Description</th>
                        <th align="center" style="padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; width: 40px;">Qty</th>
                        <th align="right" style="padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; width: 70px;">Subtotal</th>
                      </tr>
                      ${itemsHtml}
                    </table>
                  </td>
                </tr>
                
                <!-- Spacer -->
                <tr><td height="16"></td></tr>
                
                <!-- Total Section -->
                <tr>
                  <td>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #64748b;">
                      <tr>
                        <td style="padding-bottom: 8px;">Subtotal Breakup</td>
                        <td align="right" style="padding-bottom: 8px; color: #0f172a; font-family: 'SF Mono', SFMono-Regular, Consolas, monospace;">$${order.subtotal.toFixed(2)}</td>
                      </tr>
                      ${discountHtml}
                      <tr>
                        <td style="padding-bottom: 8px;">Sales Tax (8.25%)</td>
                        <td align="right" style="padding-bottom: 8px; color: #0f172a; font-family: 'SF Mono', SFMono-Regular, Consolas, monospace;">$${order.tax.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding-top: 10px; border-top: 1px dashed #e2e8f0; font-size: 14px; font-weight: bold; color: #0f172a;">GRAND TOTAL</td>
                        <td align="right" style="padding-top: 10px; border-top: 1px dashed #e2e8f0; font-size: 15px; font-weight: 800; color: #4f46e5; font-family: 'SF Mono', SFMono-Regular, Consolas, monospace;">$${order.total.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Payment breakdown line -->
                <tr>
                  <td style="margin-top: 16px; background-color: #f8fafc; border-radius: 8px; padding: 12px; border: 1px solid #f1f5f9;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #64748b;">
                      <tr>
                        <td><strong>Tendered Payment via:</strong> ${order.paymentMethod.toUpperCase()}</td>
                        <td align="right" style="color: #0f172a; font-family: 'SF Mono', SFMono-Regular, Consolas, monospace;">$${order.amountReceived.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding-top: 4px;"><strong>Change Refunded:</strong></td>
                        <td align="right" style="padding-top: 4px; color: #0f172a; font-family: 'SF Mono', SFMono-Regular, Consolas, monospace;">$${order.changeDue.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Cozy Bottom footer bar with nordic elements -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; font-weight: 700; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.05em;">NORDIC ROASTERY CO. • HELSINKI</p>
              <p style="color: #cbd5e1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 9px; margin: 0; line-height: 1.4;">
                This receipt was digitized securely for carbon footprint protection. 💚 If you have questions, reach our staff at fika@nordicroastery.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(formattedHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Unable to copy receipt source HTML to clipboard', err);
    }
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setEmailStatus('error');
      return;
    }

    setEmailStatus('sending');

    // Simulate sending dispatch delay
    setTimeout(() => {
      setEmailStatus('success');

      // Dispatch alert to notifications logs if possible!
      if (onDispatchAlert) {
        onDispatchAlert(
          'system',
          '📨 SMART RECEIPT TRANSMITTED',
          `An elegant styled HTML invoice ticket #${order.orderNo} was digitized and securely dispatched to customer: ${email}.`
        );
      }
    }, 1800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
        />

        {/* Modal core container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative max-h-[92vh] w-full max-w-2xl flex flex-col rounded-3xl bg-slate-50 border border-slate-200 shadow-2xl overflow-hidden"
          id="email-receipt-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-slate-900 border-b border-slate-800 px-6 py-4 text-white">
            <div className="flex items-center gap-2.5">
              <div className="bg-indigo-500/20 text-indigo-400 p-1.5 rounded-xl">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight font-sans">Artisan Email Invoice Generator</h3>
                <p className="text-[10px] text-slate-400">Inline HTML styled layout formatted for inbox clients</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              id="close-email-modal-btn"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick email entry form */}
          <div className="bg-white border-b border-slate-150 p-5 px-6">
            <form onSubmit={handleSendEmail} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="Enter customer email (e.g. customer@fika.com)"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailStatus === 'error') setEmailStatus('idle');
                    }}
                    disabled={emailStatus === 'sending' || emailStatus === 'success'}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
                    id="receipt-customer-email-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={emailStatus === 'sending' || emailStatus === 'success'}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs shrink-0 flex items-center justify-center gap-2 cursor-pointer ${
                    emailStatus === 'success'
                      ? 'bg-emerald-600'
                      : 'bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-60'
                  }`}
                  id="simulate-send-email-btn"
                >
                  {emailStatus === 'sending' ? (
                    <>
                      <PlaneTakeoff className="h-4 w-4 animate-bounce" />
                      Invoicing Dispatcher...
                    </>
                  ) : emailStatus === 'success' ? (
                    <>
                      <Check className="h-4 w-4 stroke-[3]" />
                      Digitized Sent!
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Email Receipt
                    </>
                  )}
                </button>
              </div>

              {emailStatus === 'error' && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Please write an applicable, syntactically correct email address.
                </div>
              )}

              {emailStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-xs text-emerald-800 font-semibold space-y-1"
                >
                  <p>✓ Receipt Email transmitted successfully!</p>
                  <p className="text-[10px] text-emerald-600 font-normal">
                    The dispatch was captured securely. Check the <strong>Alert Dispatch Log Terminal</strong> inside the app navigation tabs for full audit tracing specs.
                  </p>
                </motion.div>
              )}
            </form>
          </div>

          {/* Subheader Tabs - Choose Preview or HTML Raw code */}
          <div className="px-6 py-2 border-b border-slate-200 bg-slate-100 flex items-center justify-between">
            <div className="flex gap-1.5">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'preview' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                id="email-tab-preview"
              >
                <Eye className="h-3.5 w-3.5" />
                Live Inbox Frame
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'code' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                id="email-tab-code"
              >
                <Code className="h-3.5 w-3.5" />
                Plain Inline HTML Code
              </button>
            </div>

            {activeTab === 'code' && (
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 rounded-lg py-1 px-2.5 font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all cursor-pointer"
                id="copy-html-btn"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                {copied ? 'HTML Copied!' : 'Copy Code'}
              </button>
            )}
          </div>

          {/* Core Panel Body (Live email frame or HTML code editor) */}
          <div className="flex-1 overflow-hidden p-6 pb-4">
            <div className="h-full border border-slate-200 rounded-2xl bg-white shadow-3xs overflow-hidden flex flex-col">
              {activeTab === 'preview' ? (
                <div className="flex-1 flex flex-col bg-slate-150 overflow-hidden">
                  {/* Email Browser Chrome Mockup top panel */}
                  <div className="bg-slate-200 border-b border-slate-300 py-2 px-4 flex items-center gap-2 shrink-0">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="ml-4 bg-white/60 border border-slate-300 rounded-md text-[10px] text-slate-500 font-mono text-center w-full max-w-sm px-3 py-0.5 truncate select-none">
                      https://mail.google.com/mail/u/0/#inbox
                    </div>
                  </div>

                  {/* Gmail Inbox Header Details */}
                  <div className="bg-white border-b border-slate-200 p-4 shrink-0 font-sans">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      Your Nordic Roastery Order Receipt [Ticket #{order.orderNo}]
                    </p>
                    <div className="mt-2.5 flex items-start gap-2 text-xs">
                      <div className="h-7 w-7 rounded-full bg-slate-900 flex items-center justify-center text-white font-extrabold text-[10px] shrink-0 font-sans border border-slate-800 shadow-sm leading-none">
                        NR
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-800">Nordic Roastery Co.</span>
                          <span className="text-[10px] text-slate-400 font-mono">&lt;fika@nordicroastery.com&gt;</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-sans leading-none">
                          To: <span className="font-bold text-slate-700">{email || '(Enter email above)'}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic HTML Frame viewport */}
                  <div className="flex-1 overflow-y-auto bg-slate-100 p-4">
                    <div className="mx-auto max-w-[480px] bg-white rounded-2xl shadow-sm border border-slate-250 overflow-hidden">
                      <iframe
                        title="Invoicing HTML Email Viewport Preview"
                        srcDoc={formattedHtml}
                        className="w-full min-h-[500px] border-0"
                        sandbox="allow-popups allow-popups-to-escape-sandbox"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="bg-slate-900 shrink-0 text-slate-400 font-mono text-[10px] py-2 px-4 border-b border-slate-800">
                    DIGITAL_RECEIPT_TEMPLATE.html
                  </div>
                  <textarea
                    readOnly
                    value={formattedHtml}
                    className="flex-1 p-4 font-mono text-[11px] text-slate-350 bg-slate-950 focus:outline-none resize-none selection:bg-indigo-300 selection:text-indigo-900 border-0"
                    id="html-raw-textarea"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="px-6 pb-5 pt-1.5 bg-slate-50 border-t border-slate-150 flex items-center justify-between text-[11px] text-slate-500 font-sans">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="h-3.5 w-3.5 text-indigo-505 shrink-0" />
              Real inline responsive client rendering module active.
            </span>
            <button
              onClick={onClose}
              className="text-xs font-extrabold text-slate-600 hover:text-slate-850 px-4 py-1 hover:bg-slate-200 transition-colors rounded-xl cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
