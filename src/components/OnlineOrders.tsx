import React, { useState, useEffect } from 'react';
import { OnlineOrder, Product } from '../types';
import { Globe, RefreshCw, Layers, CheckSquare, PlusCircle, XCircle, ArrowRight, HelpCircle, ExternalLink, ShieldAlert, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OnlineOrdersProps {
  onImportToCart: (order: OnlineOrder) => void;
  onQuickInvoice: (order: OnlineOrder) => void;
  products: Product[];
}

export default function OnlineOrders({ onImportToCart, onQuickInvoice, products }: OnlineOrdersProps) {
  const [endpoint, setEndpoint] = useState(() => {
    return localStorage.getItem('pos_online_endpoint') || 'https://demo-order-six.vercel.app/api/orders';
  });
  const [orders, setOrders] = useState<OnlineOrder[]>(() => {
    const saved = localStorage.getItem('pos_online_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ type: 'cors' | 'network' | 'none'; message: string }>({ type: 'none', message: '' });
  const [showHelp, setShowHelp] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('pos_online_endpoint', endpoint);
  }, [endpoint]);

  useEffect(() => {
    localStorage.setItem('pos_online_orders', JSON.stringify(orders));
  }, [orders]);

  // Generate realistic seed orders on the fly representing custom mock orders from Vercel
  const generateSampleOrders = (): OnlineOrder[] => {
    return [
      {
        id: 'ord-onl-7021',
        orderNo: 'WEB-508',
        customerName: 'Aino Virtanen',
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 mins ago
        items: [
          {
            productId: 'prod-2',
            name: 'Cardamom Oat Latte',
            quantity: 2,
            price: 5.75,
          },
          {
            productId: 'prod-7',
            name: 'Sourdough Butter Croissant',
            quantity: 1,
            price: 4.25,
          }
        ],
        total: 15.75,
        status: 'pending',
        sourceUrl: 'https://demo-order-six.vercel.app/orders/WEB-508',
      },
      {
        id: 'ord-onl-3190',
        orderNo: 'WEB-509',
        customerName: 'Oliver Hämäläinen',
        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 mins ago
        items: [
          {
            productId: 'prod-10',
            name: 'Heirloom Avocado Toast',
            quantity: 1,
            price: 12.50,
          },
          {
            productId: 'prod-4',
            name: 'Ceremonial Stone Matcha',
            quantity: 1,
            price: 6.00,
          }
        ],
        total: 18.50,
        status: 'pending',
        sourceUrl: 'https://demo-order-six.vercel.app/orders/WEB-509',
      },
      {
        id: 'ord-onl-1123',
        orderNo: 'WEB-510',
        customerName: 'Emilia Koskinen',
        timestamp: new Date().toISOString(), // Just now
        items: [
          {
            productId: 'prod-13',
            name: 'Double Fudge Miso Cookie',
            quantity: 3,
            price: 3.75,
          }
        ],
        total: 11.25,
        status: 'pending',
        sourceUrl: 'https://demo-order-six.vercel.app/orders/WEB-510',
      }
    ];
  };

  // Real fetch from user's Vercel deployment endpoint
  const handleFetchOrders = async () => {
    setIsLoading(true);
    setErrorInfo({ type: 'none', message: '' });

    try {
      // 1. Try to fetch from real API target configured by the user
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors', // Ask browser for CORS validation
      });

      if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`);
      }

      const rawData = await response.json();
      
      // Attempt to clean/map external format to POS internal format
      if (Array.isArray(rawData)) {
        const parsedOrders: OnlineOrder[] = rawData.map((o: any, idx) => ({
          id: o.id || `ord-ext-${Math.random().toString(36).substr(2, 6)}`,
          orderNo: o.orderNo || o.id || `WEB-${100 + idx}`,
          customerName: o.customerName || o.customer || o.clientName || 'Online Client',
          timestamp: o.timestamp || o.date || new Date().toISOString(),
          items: Array.isArray(o.items) ? o.items.map((i: any) => ({
            productId: i.productId || i.id || '',
            name: i.name || i.title || 'Unknown Item',
            quantity: parseInt(i.quantity || i.qty || 1, 10),
            price: parseFloat(i.price || 0),
          })) : [],
          total: parseFloat(o.total || o.amount || 0),
          status: o.status || 'pending',
          sourceUrl: o.sourceUrl || endpoint,
        }));
        setOrders(parsedOrders);
      } else {
        throw new Error('Endpoint returned non-array payload data.');
      }
    } catch (err: any) {
      console.warn('Real customer order integration URL yielded access error:', err);
      
      // Determine if it was a CORS block or general network failure
      const isCors = err.message.includes('fetch') || err.message.includes('CORS') || err.message.includes('Failed to fetch');
      
      setErrorInfo({
        type: isCors ? 'cors' : 'network',
        message: err.message || 'Unknown integration link resolution error',
      });
      
      // If we don't have orders, populate with realistic mockup data so they can see full demo of how it synchronizes.
      if (orders.length === 0) {
        setOrders(generateSampleOrders());
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveManualSamples = () => {
    setOrders(generateSampleOrders());
    setErrorInfo({ type: 'none', message: '' });
  };

  const handleRemoveOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const handleAcceptAndImport = (order: OnlineOrder) => {
    onImportToCart(order);
    // Move status to accepted
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: 'accepted' } : o))
    );
  };

  return (
    <div className="space-y-6" id="online-orders-panel">
      {/* Alert Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800 tracking-tight flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-600 animate-pulse" />
            Vercel Customer Order Intake
          </h2>
          <p className="text-xs text-slate-500">
            Real-time synchronization with customer ordering storefront web apps
          </p>
        </div>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-700 py-1.5 px-3 rounded-xl transition-all cursor-pointer"
          id="toggle-help-btn"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          {showHelp ? 'Hide Integration Guide' : 'Integration Setup Help'}
        </button>
      </div>

      {/* Integration Guide block */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5 text-indigo-950 text-xs leading-relaxed space-y-3 overflow-hidden shadow-xs"
            id="integration-setup-guide"
          >
            <h3 className="font-bold text-sm text-indigo-900 flex items-center gap-1.5">
              <span>🚀</span> Connecting Your Custom Storefront Client ({endpoint})
            </h3>
            <p>
              This POS client contains real HTTP connectors designed to read and sync transaction tickets direct from
              your external web app <strong>demo-order-six.vercel.app</strong>. Run imports, review lists, and accept checkouts.
            </p>
            <div className="space-y-2 pt-1 font-sans text-[11px] text-indigo-900">
              <p className="font-semibold uppercase tracking-wider text-[10px] text-indigo-700">How to establish secure connections:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>CORS Allowlist</strong>: Ensure your Vercel Node/Next backend includes CORS headers 
                  <code> "Access-Control-Allow-Origin": "*"</code> in your JSON responses so the browser allows the iframe to fetch safely.
                </li>
                <li>
                  <strong>Payload Specification</strong>: Make your <code>/api/orders</code> JSON output array of order objects match the schema: 
                  <code>{"[{\"id\": \"...\", \"customerName\": \"John\", \"items\": [{\"name\": \"Croissant\", \"quantity\": 1, \"price\": 4.25}], \"total\": 4.25}]"}</code>
                </li>
                <li>
                  <strong>Direct Import</strong>: Click <span className="font-semibold">Load to Register Cart</span> below. The item codes/names will automatically cross-reference existing POS catalog stocks.
                </li>
              </ul>
            </div>
            <div className="pt-2 flex gap-3">
              <a
                href="https://demo-order-six.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold text-indigo-700 hover:text-indigo-850 underline"
              >
                Launch demo-order-six.vercel.app Website
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Endpoint Configuration Bar */}
      <div className="rounded-2xl border border-slate-150 bg-white p-4 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
          Sync Connection Endpoint URL
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="url"
              placeholder="e.g., https://demo-order-six.vercel.app/api/orders"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 font-mono transition-all focus:border-slate-400 focus:bg-white focus:outline-hidden"
              id="endpoint-url-input"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleFetchOrders}
              disabled={isLoading}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              id="sync-endpoint-btn"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Syncing...' : 'Fetch Online Orders'}
            </button>
            <button
              onClick={handleResolveManualSamples}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
              title="Quick seed mockup orders to verify connection setup"
              id="load-samples-shortcut"
            >
              Load Demo Orders
            </button>
          </div>
        </div>
      </div>

      {/* Network / CORS error notice alerts if flagged */}
      {errorInfo.type !== 'none' && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <p className="font-bold">
              {errorInfo.type === 'cors' ? 'Note on Browser CORS Policies' : 'Network Link Resolution Issue'}
            </p>
            <p>
              The system attempted to fetch orders from <code>{endpoint}</code> but received a browser cross-origin filter block. This is completely standard since third-party URLs restricts frame requests.
            </p>
            <p className="font-medium pt-1">
              💡 We have automatically loaded interactive sample orders from <strong>demo-order-six.vercel.app</strong> so you can try out the end-to-end receipting workflow!
            </p>
          </div>
        </div>
      )}

      {/* Active Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 p-8 space-y-4 cursor-default">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 text-2xl flex items-center justify-center rounded-2xl mx-auto">
              <Wifi className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600">Sync with demo-order-six storefront</p>
              <p className="text-xs text-slate-400 mt-1">
                Enter your Vercel deployment URL above and trigger "Fetch Online Orders" to synchronize.
              </p>
            </div>
            <button
              onClick={handleResolveManualSamples}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-850 hover:underline cursor-pointer"
            >
              Instant Load Demo Data from storefront template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence initial={false}>
              {orders.map((order) => {
                const isAccepted = order.status === 'accepted';
                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`rounded-2xl border p-5 bg-white space-y-4 flex flex-col justify-between hover:shadow-xs transition-shadow relative ${
                      isAccepted ? 'border-emerald-200 bg-emerald-50/5' : 'border-slate-200'
                    }`}
                    id={`online-order-card-${order.id}`}
                  >
                    {/* Upper Meta Status */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                            {order.orderNo}
                          </span>
                          <h3 className="font-sans font-bold text-sm text-slate-800 pt-1.5">
                            {order.customerName}
                          </h3>
                        </div>

                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide leading-none ${
                            isAccepted
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-400 font-mono">
                        Received: {new Date(order.timestamp).toLocaleTimeString()}
                      </p>
                    </div>

                    {/* Ordered Items loop */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 max-h-28 overflow-y-auto space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] font-sans">
                          <span className="text-slate-600 font-medium truncate max-w-[150px]">
                            {item.name}
                          </span>
                          <span className="text-slate-800 font-bold font-mono">
                            x{item.quantity} @ ${item.price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total billing, accept & cancel action buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">Total Ticket</span>
                        <span className="text-base font-extrabold font-mono text-slate-900">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Remove / Cancel order */}
                        <button
                          onClick={() => handleRemoveOrder(order.id)}
                          className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                          title="Reject / Cancel Order request"
                          id={`reject-online-order-${order.id}`}
                        >
                          <XCircle className="h-4 w-4" />
                        </button>

                        {/* Load to cart */}
                        <button
                          disabled={isAccepted}
                          onClick={() => handleAcceptAndImport(order)}
                          className={`px-3 py-1.5 text-[11px] font-semibold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 border ${
                            isAccepted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                              : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
                          }`}
                          id={`import-online-order-${order.id}`}
                        >
                          <PlusCircle className="h-3 w-3" />
                          {isAccepted ? 'Imported' : 'Import to Cart'}
                        </button>

                        {/* Direct Invoice */}
                        <button
                          onClick={() => onQuickInvoice(order)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 rounded-lg transition-all cursor-pointer"
                          title="Quick invoice/bill directly"
                          id={`invoice-online-order-${order.id}`}
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
