import React, { useState, useEffect } from 'react';
import { Product, Category, CartItem, Order, HeldOrder, OnlineOrder, NotificationPayload, UserRole } from './types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, DISCOUNT_CODES, TAX_RATE, DEFAULT_CASHIER } from './data';
import ProductList from './components/ProductList';
import CheckoutCart from './components/CheckoutCart';
import ProductFormModal from './components/ProductFormModal';
import ReceiptModal from './components/ReceiptModal';
import AnalyticsPanel from './components/AnalyticsPanel';
import OnlineOrders from './components/OnlineOrders';
import NotificationCenter from './components/NotificationCenter';
import { Store, BarChart3, Clock, Coffee, Shield, RefreshCcw, Globe, Bell } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  // --- Persistent Storage State Initializers ---
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pos_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('pos_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('pos_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>(() => {
    const saved = localStorage.getItem('pos_held');
    return saved ? JSON.parse(saved) : [];
  });

  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>(() => {
    const saved = localStorage.getItem('pos_online_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<NotificationPayload[]>(() => {
    const saved = localStorage.getItem('pos_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('pos_active_role');
    return (saved as UserRole) || 'Cashier';
  });

  const [notificationConfig, setNotificationConfig] = useState(() => {
    const saved = localStorage.getItem('pos_notification_config');
    return saved ? JSON.parse(saved) : {
      slackEnabled: true,
      smsEnabled: false,
      emailEnabled: true,
      soundEnabled: true,
    };
  });

  const [notifiedLowStockIds, setNotifiedLowStockIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('pos_notified_low_stock_ids');
    return saved ? JSON.parse(saved) : [];
  });

  // --- UI Layout Navigation States ---
  const [activeTab, setActiveTab] = useState<'register' | 'online' | 'notifications' | 'analytics'>('register');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- Modals Toggle states ---
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Order | null>(null);

  // Sync state with LocalStorage on any change
  useEffect(() => {
    localStorage.setItem('pos_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pos_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('pos_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('pos_held', JSON.stringify(heldOrders));
  }, [heldOrders]);

  useEffect(() => {
    localStorage.setItem('pos_online_orders', JSON.stringify(onlineOrders));
  }, [onlineOrders]);

  useEffect(() => {
    localStorage.setItem('pos_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('pos_active_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('pos_notification_config', JSON.stringify(notificationConfig));
  }, [notificationConfig]);

  // Tick clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Dispatch Notification Engine ---
  const dispatchNotification = (
    type: 'checkout' | 'cancel' | 'system',
    title: string,
    message: string,
    orderDetails?: { orderId?: string; orderNo?: number | string; total?: number }
  ) => {
    if (activeRole === 'Admin') {
      console.log('Notification suppressed: Active cashier role is Admin.');
      return;
    }

    const newNotif: NotificationPayload = {
      id: `notif-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      role: activeRole,
      orderId: orderDetails?.orderId,
      orderNo: typeof orderDetails?.orderNo === 'number' ? orderDetails.orderNo : undefined,
      total: orderDetails?.total,
      channels: {
        slackSimulated: notificationConfig.slackEnabled,
        smsSimulated: notificationConfig.smsEnabled,
        emailSimulated: notificationConfig.emailEnabled,
        audioPing: notificationConfig.soundEnabled,
      },
    };

    setNotifications((prev) => [newNotif, ...prev]);

    if (notificationConfig.soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (type === 'checkout') {
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
          gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.1);

          setTimeout(() => {
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
            gain2.gain.setValueAtTime(0.06, audioCtx.currentTime);
            osc2.start();
            osc2.stop(audioCtx.currentTime + 0.18);
          }, 100);
        } else {
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(293.66, audioCtx.currentTime); // D4
          gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.12);

          setTimeout(() => {
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(196, audioCtx.currentTime); // G3
            gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
            osc2.start();
            osc2.stop(audioCtx.currentTime + 0.15);
          }, 120);
        }
      } catch (err) {
        console.warn('Responsive notifications audio pitch blocked or unsupported.', err);
      }
    }
  };

  const handleManualTriggerSim = (type: 'checkout' | 'cancel') => {
    if (type === 'checkout') {
      const mockOrderNo = Math.floor(Math.random() * 900) + 100;
      const mockTotal = parseFloat((Math.random() * 45 + 5).toFixed(2));
      dispatchNotification(
        'checkout',
        `Invoice Checked Out [Simulated]`,
        `Staff completed sale ticket #${mockOrderNo} totaling $${mockTotal.toFixed(2)} under Active dispatch role: ${activeRole}.`,
        { orderNo: mockOrderNo, total: mockTotal }
      );
    } else {
      const mockOrderNo = Math.floor(Math.random() * 900) + 100;
      const mockTotal = parseFloat((Math.random() * 40 + 5).toFixed(2));
      dispatchNotification(
        'cancel',
        `Invoice Refunded / Cancelled [Simulated]`,
        `Staff marked order transaction #${mockOrderNo} ($${mockTotal.toFixed(2)}) as Void/Refunded under dispatch role: ${activeRole}.`,
        { orderNo: mockOrderNo, total: mockTotal }
      );
    }
  };

  // --- Automated Low Stock Alert Engine ---
  const productsStockKey = products.map((p) => `${p.id}:${p.stock}:${p.name}`).join(',');

  useEffect(() => {
    localStorage.setItem('pos_notified_low_stock_ids', JSON.stringify(notifiedLowStockIds));
  }, [notifiedLowStockIds]);

  useEffect(() => {
    const newlyLowStock: string[] = [];
    const restocked: string[] = [];

    products.forEach((p) => {
      if (p.stock < 2) {
        if (!notifiedLowStockIds.includes(p.id)) {
          newlyLowStock.push(p.id);
          dispatchNotification(
            'system',
            '⚠️ CRITICAL INVENTORY ALERT',
            `Product "${p.name}" has fallen below critical safety margins: ${p.stock} units left in stock!`
          );
        }
      } else {
        if (notifiedLowStockIds.includes(p.id)) {
          restocked.push(p.id);
        }
      }
    });

    if (newlyLowStock.length > 0 || restocked.length > 0) {
      setNotifiedLowStockIds((prev) => {
        let updated = [...prev, ...newlyLowStock];
        if (restocked.length > 0) {
          updated = updated.filter((id) => !restocked.includes(id));
        }
        return updated;
      });
    }
  }, [productsStockKey, notifiedLowStockIds]);

  // --- Checkout Operations ---
  const handleCheckout = (
    paymentMethod: 'cash' | 'card' | 'giftcard',
    amountReceived: number,
    promoCode?: string
  ) => {
    if (cart.length === 0) return;

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    
    let discount = 0;
    if (promoCode) {
      const code = DISCOUNT_CODES.find((d) => d.code === promoCode);
      if (code) {
        discount = code.type === 'percent' ? subtotal * (code.value / 100) : code.value;
      }
    }

    const tax = Math.max(0, (subtotal - discount) * TAX_RATE);
    const total = Math.max(0, subtotal - discount + tax);
    const changeDue = Math.max(0, amountReceived - total);

    // Create high-fidelity order transaction record
    const newOrder: Order = {
      id: `order-${Math.random().toString(36).substr(2, 9)}`,
      orderNo: orders.length + 101, // Starts order index counts at #101
      timestamp: new Date().toISOString(),
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        subtotal: item.product.price * item.quantity,
      })),
      subtotal,
      discount,
      discountCode: promoCode,
      tax,
      total,
      paymentMethod,
      amountReceived,
      changeDue,
      status: 'completed',
      cashier: DEFAULT_CASHIER,
    };

    // Permanently locks stock decrement from active products grid
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const itemInCart = cart.find((item) => item.product.id === p.id);
        if (itemInCart) {
          return {
            ...p,
            stock: Math.max(0, p.stock), // Stock is already decremented during cart changes
          };
        }
        return p;
      })
    );

    // Append to transactions database
    setOrders((prev) => [newOrder, ...prev]);

    // Dispatch real-time audit notifications if not Admin
    dispatchNotification(
      'checkout',
      'Invoice Checked Out',
      `Sale transaction #${newOrder.orderNo} totaling $${newOrder.total.toFixed(2)} completed successfully using payment: ${paymentMethod.toUpperCase()}.`,
      { orderId: newOrder.id, orderNo: newOrder.orderNo, total: newOrder.total }
    );

    // Open receipt thermal mockup
    setActiveReceipt(newOrder);
    setIsReceiptModalOpen(true);

    // Clear register cart
    setCart([]);
  };

  // --- Inventory Quantities Management ---
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        // Prevent adding exceeding available store shelf units
        if (existing.quantity >= product.stock) return prevCart;
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });

    // Instantly subtract item from the shelf display
    setProducts((prevProds) =>
      prevProds.map((p) => (p.id === product.id ? { ...p, stock: p.stock - 1 } : p))
    );
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    const cartItem = cart.find((item) => item.product.id === productId);
    if (!cartItem) return;

    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    const difference = quantity - cartItem.quantity;

    // Check inventory ceiling limits
    const currentInventory = products.find((p) => p.id === productId);
    if (currentInventory && difference > currentInventory.stock) {
      return; // Not enough physical count in inventory
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );

    // Sync shelf display
    setProducts((prevProds) =>
      prevProds.map((p) =>
        p.id === productId ? { ...p, stock: p.stock - difference } : p
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    const cartItem = cart.find((item) => item.product.id === productId);
    if (!cartItem) return;

    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));

    // Return the items back to store stock
    setProducts((prevProds) =>
      prevProds.map((p) =>
        p.id === productId ? { ...p, stock: p.stock + cartItem.quantity } : p
      )
    );
  };

  const handleClearCart = () => {
    // Return all cart stocks back to the product list
    setProducts((prevProds) =>
      prevProds.map((p) => {
        const cartItem = cart.find((item) => item.product.id === p.id);
        if (cartItem) {
          return { ...p, stock: p.stock + cartItem.quantity };
        }
        return p;
      })
    );
    setCart([]);
  };

  // --- Hold & Retrieve Tabs ---
  const handleHoldOrder = (tabName: string) => {
    if (cart.length === 0) return;

    const newHold: HeldOrder = {
      id: `hold-${Math.random().toString(36).substr(2, 9)}`,
      name: tabName,
      items: [...cart],
      timestamp: new Date().toISOString(),
    };

    setHeldOrders((prev) => [newHold, ...prev]);
    // Clear active cart but keep shelf stock decremented (since they possess the physical food/drinks already at wait-tables)
    setCart([]);
  };

  const handleRetrieveOrder = (heldId: string) => {
    const toRetrieve = heldOrders.find((h) => h.id === heldId);
    if (!toRetrieve) return;

    // Void/clear whatever's currently in active cart back to stock first
    handleClearCart();

    // Load held items into cart
    setCart(toRetrieve.items);

    // Remove from held listings
    setHeldOrders((prev) => prev.filter((h) => h.id !== heldId));
  };

  // --- Refunds and Ledger audits ---
  const handleRefundOrder = (orderId: string) => {
    const orderToRefund = orders.find((o) => o.id === orderId);
    if (!orderToRefund || orderToRefund.status !== 'completed') return;

    // Mark as refunded
    setOrders((prevOrders) =>
      prevOrders.map((o) => (o.id === orderId ? { ...o, status: 'refunded' } : o))
    );

    // Restores inventory values back to the core products grid
    setProducts((prevProds) =>
      prevProds.map((p) => {
        const refundedItem = orderToRefund.items.find((item) => item.productId === p.id);
        if (refundedItem) {
          return {
            ...p,
            stock: Math.min(p.maxStock, p.stock + refundedItem.quantity),
          };
        }
        return p;
      })
    );

    // Dispatch real-time audit notifications if not Admin
    dispatchNotification(
      'cancel',
      'Invoice Refunded / Cancelled',
      `Staff cancelled and refunded Invoice #${orderToRefund.orderNo} totaling $${orderToRefund.total.toFixed(2)}. Restored catalog stock units.`,
      { orderId: orderToRefund.id, orderNo: orderToRefund.orderNo, total: orderToRefund.total }
    );
  };

  // --- View old receipts ---
  const handleViewPastReceipt = (order: Order) => {
    setActiveReceipt(order);
    setIsReceiptModalOpen(true);
  };

  // --- Online Order Handlers ---
  const handleImportOnlineOrderToCart = (onlineOrder: OnlineOrder) => {
    onlineOrder.items.forEach((item) => {
      let prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        prod = products.find((p) => p.name.toLowerCase() === item.name.toLowerCase());
      }

      if (prod) {
        const inCart = cart.find((ci) => ci.product.id === prod!.id);
        const currentCartQty = inCart ? inCart.quantity : 0;
        const quantityToAdd = Math.min(item.quantity, prod.stock);

        if (quantityToAdd > 0) {
          setCart((prevCart) => {
            const existing = prevCart.find((ci) => ci.product.id === prod!.id);
            if (existing) {
              return prevCart.map((ci) =>
                ci.product.id === prod!.id ? { ...ci, quantity: ci.quantity + quantityToAdd } : ci
              );
            }
            return [...prevCart, { product: prod!, quantity: quantityToAdd }];
          });

          setProducts((prevProds) =>
            prevProds.map((p) =>
              p.id === prod!.id ? { ...p, stock: Math.max(0, p.stock - quantityToAdd) } : p
            )
          );
        }
      }
    });

    setOnlineOrders((prev) =>
      prev.map((o) => (o.id === onlineOrder.id ? { ...o, status: 'accepted' } : o))
    );

    setActiveTab('register');
  };

  const handleQuickInvoiceOnlineOrder = (onlineOrder: OnlineOrder) => {
    const subtotal = onlineOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.max(0, subtotal * TAX_RATE);
    const total = Math.max(0, subtotal + tax);

    onlineOrder.items.forEach((item) => {
      let prod = products.find((p) => p.id === item.productId || p.name.toLowerCase() === item.name.toLowerCase());
      if (prod) {
        setProducts((prevProds) =>
          prevProds.map((p) =>
            p.id === prod!.id ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p
          )
        );
      }
    });

    const newOrder: Order = {
      id: `order-online-${Math.random().toString(36).substr(2, 9)}`,
      orderNo: orders.length + 101,
      timestamp: new Date().toISOString(),
      items: onlineOrder.items.map((item) => ({
        productId: item.productId || 'custom',
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      })),
      subtotal,
      discount: 0,
      tax,
      total,
      paymentMethod: 'card',
      amountReceived: total,
      changeDue: 0,
      status: 'completed',
      cashier: `Online Order ${onlineOrder.orderNo}`,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Dispatch real-time audit notifications if not Admin
    dispatchNotification(
      'checkout',
      'Online Customer Invoice Billed',
      `Direct checkout completed for Order ${onlineOrder.orderNo} (${onlineOrder.customerName}) totaling $${total.toFixed(2)}.`,
      { orderId: newOrder.id, orderNo: newOrder.orderNo, total: total }
    );

    setActiveReceipt(newOrder);
    setIsReceiptModalOpen(true);

    setOnlineOrders((prev) =>
      prev.map((o) => (o.id === onlineOrder.id ? { ...o, status: 'accepted' } : o))
    );
  };

  // --- Product Form Creator/Edit Saves ---
  const handleOpenNewProductForm = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProductForm = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (formData: Omit<Product, 'id'> & { id?: string }) => {
    if (formData.id) {
      // Editing existing
      setProducts((prev) =>
        prev.map((p) => (p.id === formData.id ? (formData as Product) : p))
      );
    } else {
      // Create new
      const nextProduct: Product = {
        ...formData,
        id: `prod-${Math.random().toString(36).substr(2, 9)}`,
      };
      setProducts((prev) => [nextProduct, ...prev]);
    }
  };

  // Reset entire catalog to initial seeds
  const handleRestoreDefaults = () => {
    if (confirm('Are you sure you want to reset the entire POS database to original factory configurations? All sales ledgers and custom products will be cleared.')) {
      setProducts(INITIAL_PRODUCTS);
      setCart([]);
      setOrders([]);
      setHeldOrders([]);
      setActiveTab('register');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased">
      {/* Top Header Navigation panel */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 select-none">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          
          {/* Logo Brand / Status */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-serif font-black text-sm">
              N
            </div>
            <div>
              <h1 className="font-sans font-bold text-sm tracking-tight text-slate-900 uppercase">
                Nordic Roastery Pos
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 font-mono">STATION #01 • LIVE</span>
              </div>
            </div>
          </div>

          {/* Mode Tabs Toggles */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('register')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeTab === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-850'
              }`}
              id="header-nav-register"
            >
              <Store className="h-3.5 w-3.5" />
              Sales Register
            </button>
            <button
              onClick={() => setActiveTab('online')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all relative ${
                activeTab === 'online' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-850'
              }`}
              id="header-nav-online"
            >
              <Globe className="h-3.5 w-3.5" />
              Customer Orders
              {onlineOrders.filter((o) => o.status === 'pending').length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] px-1 rounded-full bg-indigo-600 text-[9px] font-black text-white flex items-center justify-center border border-white animate-bounce">
                  {onlineOrders.filter((o) => o.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all relative ${
                activeTab === 'notifications' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-850'
              }`}
              id="header-nav-notifications"
            >
              <Bell className="h-3.5 w-3.5" />
              Alert Dispatch
              {notifications.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] px-1 rounded-full bg-purple-600 text-[9px] font-black text-white flex items-center justify-center border border-white">
                  {notifications.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-850'
              }`}
              id="header-nav-analytics"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Office Reports
            </button>
          </div>

          {/* Clock & Action row */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 font-mono font-bold hidden sm:inline">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            <div className="hidden md:flex items-center gap-2 bg-slate-100/50 border border-slate-150 rounded-xl px-3 py-1">
              <span className={`p-1 rounded-lg shrink-0 ${activeRole === 'Admin' ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-250 text-slate-600'}`}>
                <Shield className="h-3 w-3" />
              </span>
              <div className="text-left">
                <p className="text-[10px] font-black font-sans text-slate-850 leading-none">{DEFAULT_CASHIER}</p>
                <p className="text-[9px] font-bold text-indigo-600 uppercase font-mono mt-0.5 tracking-wider">{activeRole}</p>
              </div>
            </div>

            <button
              onClick={handleRestoreDefaults}
              className="text-slate-400 hover:text-red-500 transition-colors p-1"
              title="Factory reset database"
              id="factory-reset-btn"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main body area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
          
          {/* LEFT CONTAINER (Registers or Analytics) (8 Columns on Large View) */}
          <div className="lg:col-span-8 space-y-4">
            {activeTab === 'register' ? (
              <ProductList
                products={products}
                categories={INITIAL_CATEGORIES}
                onProductClick={handleAddToCart}
                onEditProduct={handleOpenEditProductForm}
                onAddNewProduct={handleOpenNewProductForm}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            ) : activeTab === 'online' ? (
              <OnlineOrders
                onImportToCart={handleImportOnlineOrderToCart}
                onQuickInvoice={handleQuickInvoiceOnlineOrder}
                products={products}
              />
            ) : activeTab === 'notifications' ? (
              <NotificationCenter
                notifications={notifications}
                activeRole={activeRole}
                onRoleChange={setActiveRole}
                config={notificationConfig}
                onConfigChange={setNotificationConfig}
                onClearNotifications={() => setNotifications([])}
                onManualTriggerSim={handleManualTriggerSim}
                products={products}
                onUpdateProductStock={(productId, newStock) => {
                  setProducts((prev) =>
                    prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
                  );
                }}
              />
            ) : (
              <AnalyticsPanel
                orders={orders}
                onRefund={handleRefundOrder}
                onViewReceipt={handleViewPastReceipt}
                products={products}
              />
            )}
          </div>

          {/* RIGHT CONTAINER (Checkout cart panel) (4 Columns) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <CheckoutCart
              cart={cart}
              onUpdateQty={handleUpdateCartQty}
              onRemoveItem={handleRemoveFromCart}
              onClearCart={handleClearCart}
              onCheckout={handleCheckout}
              discountCodes={DISCOUNT_CODES}
              heldOrders={heldOrders}
              onHoldOrder={handleHoldOrder}
              onRetrieveOrder={handleRetrieveOrder}
            />
          </div>

        </div>
      </main>

      {/* --- Overlay Modals --- */}

      {/* Custom inventory creation / edit Form */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
        categories={INITIAL_CATEGORIES}
      />

      {/* Success Thermal Receipt display */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        order={activeReceipt}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setActiveReceipt(null);
        }}
      />
    </div>
  );
}
