import React, { useState } from 'react';
import { Order, Product } from '../types';
import { TrendingUp, Coins, ShoppingBag, Receipt, Percent, RotateCcw, ArrowUpRight, Search, BarChart3, Clock, Download } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalyticsPanelProps {
  orders: Order[];
  onRefund: (orderId: string) => void;
  onViewReceipt: (order: Order) => void;
  products: Product[];
}

export default function AnalyticsPanel({
  orders,
  onRefund,
  onViewReceipt,
  products,
}: AnalyticsPanelProps) {
  const [historySearch, setHistorySearch] = useState('');

  const handleExportCSV = () => {
    // Generate CSV content formatted for standard accounting or Excel spreadsheet viewers
    const headers = [
      'Order ID',
      'Date & Time',
      'Cashier',
      'Items Count',
      'Itemized Summary',
      'Subtotal ($)',
      'Discount ($)',
      'Tax ($)',
      'Grand Total ($)',
      'Payment Method',
      'Status'
    ];

    const rows = orders.map((o) => {
      const itemsSummary = o.items
        .map((item) => `${item.name} (x${item.quantity})`)
        .join(' | ');

      return [
        `#${o.orderNo}`,
        `"${new Date(o.timestamp).toLocaleString().replace(/"/g, '""')}"`,
        `"${o.cashier.replace(/"/g, '""')}"`,
        o.items.reduce((sum, item) => sum + item.quantity, 0),
        `"${itemsSummary.replace(/"/g, '""')}"`,
        o.subtotal.toFixed(2),
        o.discount.toFixed(2),
        o.tax.toFixed(2),
        o.total.toFixed(2),
        o.paymentMethod.toUpperCase(),
        o.status.toUpperCase()
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Create direct browser download trigger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Nordic_Roastery_POS_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Calculate high-level KPIs
  const activeOrders = orders.filter((o) => o.status === 'completed');
  const refundedOrders = orders.filter((o) => o.status === 'refunded');

  const grossSales = activeOrders.reduce((sum, o) => sum + o.total, 0);
  const totalRefunds = refundedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalDiscounts = activeOrders.reduce((sum, o) => sum + o.discount, 0);
  const transactionCount = activeOrders.length;
  
  const totalUnitsSold = activeOrders.reduce((units, order) => {
    return units + order.items.reduce((sum, item) => sum + item.quantity, 0);
  }, 0);

  const averageOrderValue = transactionCount > 0 ? grossSales / transactionCount : 0;

  // Hourly distribution (simulated based on order timestamp hour, or mock defaults if none)
  const hourlyData = Array.from({ length: 8 }, (_, i) => {
    const hour = i + 9; // 9 AM to 4 PM
    const ordersInHour = activeOrders.filter((o) => {
      const date = new Date(o.timestamp);
      const h = date.getHours();
      return h === hour;
    });
    const revenue = ordersInHour.reduce((sum, o) => sum + o.total, 0);
    return { hour: `${hour}:00`, revenue };
  });

  // Calculate highest revenue hourly mark
  const maxHourlyRevenue = Math.max(...hourlyData.map((d) => d.revenue), 20);

  // Category breakdown calculation
  const categorySalesMap: { [key: string]: number } = {};
  activeOrders.forEach((order) => {
    order.items.forEach((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      const cat = p ? p.category : 'other';
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + item.subtotal;
    });
  });

  const categoriesList = [
    { name: 'Coffee', id: 'coffee', color: 'bg-amber-400' },
    { name: 'Tea', id: 'tea', color: 'bg-emerald-400' },
    { name: 'Bakery', id: 'bakery', color: 'bg-orange-400' },
    { name: 'Lunch', id: 'lunch', color: 'bg-lime-400' },
    { name: 'Merchandise', id: 'merch', color: 'bg-purple-400' },
  ];

  const totalCategorySales = Object.values(categorySalesMap).reduce((sum, v) => sum + v, 0) || 1;

  // Filter history logs
  const filteredOrders = orders.filter((o) => {
    const matchId = o.orderNo.toString().includes(historySearch) || o.id.toLowerCase().includes(historySearch.toLowerCase());
    const matchPayment = o.paymentMethod.toLowerCase().includes(historySearch.toLowerCase());
    const matchStatus = o.status.toLowerCase().includes(historySearch.toLowerCase());
    return matchId || matchPayment || matchStatus;
  });

  return (
    <div className="space-y-6" id="analytics-panel">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800 tracking-tight flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-slate-600" />
            Control Center & Analytics
          </h2>
          <p className="text-xs text-slate-500">Live cashier session sales review and inventory audits</p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={orders.length === 0}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-sans bg-slate-900 border border-slate-950 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-98 transition-all shadow-xs cursor-pointer select-none"
          id="export-sales-csv-btn"
          title="Export total sales report ledger data as CSV file"
        >
          <Download className="h-4 w-4" />
          Export Sales CSV
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI: Gross Sales */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Sales</span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-800">
              ${grossSales.toFixed(2)}
            </span>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              <span>Session Open</span>
            </div>
          </div>
        </div>

        {/* KPI: Units Sold */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Units Sold</span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-800">
              {totalUnitsSold}
            </span>
            <p className="mt-1 text-[10px] text-slate-400">Total physical items handed out</p>
          </div>
        </div>

        {/* KPI: Chekouts (AOV) */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Order Val</span>
            <div className="rounded-xl bg-purple-50 p-2 text-purple-600">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-800">
              ${averageOrderValue.toFixed(2)}
            </span>
            <p className="mt-1 text-[10px] text-slate-400">
              Across <span className="font-semibold">{transactionCount}</span> transactions
            </p>
          </div>
        </div>

        {/* KPI: Discount Promo */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Discounts Given</span>
            <div className="rounded-xl bg-orange-50 p-2 text-orange-600">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-800">
              -${totalDiscounts.toFixed(2)}
            </span>
            <p className="mt-1 text-[10px] text-slate-400">
              Refunds voided: <span className="font-semibold font-mono text-red-500">${totalRefunds.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Visual Charts Layout - Two Column Side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Sales SVG Graph */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-700">Today's Hourly Revenue</h3>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Register 1 Live Feed</span>
          </div>

          {/* SVG Custom Column Chart */}
          <div className="h-44 w-full flex items-end justify-between gap-2.5 pt-4">
            {hourlyData.map((data, index) => {
              const heightPct = Math.min(100, Math.max(8, (data.revenue / maxHourlyRevenue) * 100));
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  {/* Bar */}
                  <div className="w-full bg-slate-50 rounded-lg h-32 flex items-end overflow-hidden relative border border-slate-100">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="w-full bg-slate-900 rounded-b-md group-hover:bg-slate-800 transition-colors relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                        ${data.revenue.toFixed(2)}
                      </div>
                    </motion.div>
                  </div>
                  {/* Label */}
                  <span className="text-[10px] text-slate-500 font-mono font-medium tracking-tight">
                    {data.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown list */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <span>📊</span> Sales by Department
          </h3>
          <div className="space-y-3.5">
            {categoriesList.map((cat) => {
              const value = categorySalesMap[cat.id] || 0;
              const percent = totalCategorySales > 0 ? (value / totalCategorySales) * 100 : 0;
              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">{cat.name}</span>
                    <span className="text-slate-800 font-bold font-mono">
                      ${value.toFixed(2)} ({Math.round(percent)}%)
                    </span>
                  </div>
                  {/* Micro custom progress-bar */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.6 }}
                      className={`h-full rounded-full ${cat.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transaction Records ledger */}
      <div className="rounded-2xl border border-slate-150 bg-white shadow-xs overflow-hidden">
        {/* Ledger Header */}
        <div className="border-b border-slate-100 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Transaction History</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 font-mono">
              {orders.length}
            </span>
          </div>

          {/* Ledger Search */}
          <div className="relative max-w-xs w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              placeholder="Search orders, payment, status..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs placeholder-slate-400 transition-all focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-800"
              id="ledger-search-input"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <div className="text-2xl">📋</div>
              <p className="text-xs">No matching transactions listed under this session</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-100 text-left border-collapse">
              <thead className="bg-slate-50 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-550 select-none">
                <tr>
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-3 py-3">Timestamp</th>
                  <th className="px-3 py-3">Cashier</th>
                  <th className="px-3 py-3">Items Sold</th>
                  <th className="px-3 py-3">Method</th>
                  <th className="px-3 py-3 text-right">Refundable Net</th>
                  <th className="px-3 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-xs text-slate-700 font-sans">
                {filteredOrders.map((order) => {
                  const itemsCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
                  const isCompleted = order.status === 'completed';

                  return (
                    <motion.tr
                      key={order.id}
                      layout
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Order Ref */}
                      <td className="px-5 py-3 font-mono font-semibold text-slate-850">
                        #{order.orderNo}
                      </td>

                      {/* Date */}
                      <td className="px-3 py-2 text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>

                      {/* Cashier */}
                      <td className="px-3 py-2 whitespace-nowrap font-medium text-slate-650">
                        {order.cashier}
                      </td>

                      {/* Item volume */}
                      <td className="px-3 py-2 font-mono font-medium">
                        {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                      </td>

                      {/* Pay Method */}
                      <td className="px-3 py-2 uppercase font-semibold text-slate-600 font-mono text-[10px]">
                        {order.paymentMethod}
                      </td>

                      {/* Total */}
                      <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                        {isCompleted ? '' : '-'}${order.total.toFixed(2)}
                      </td>

                      {/* Status pill */}
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                              : 'bg-red-50 text-red-700 border border-red-200/50 animate-pulse'
                          }`}
                        >
                          {isCompleted ? 'Completed' : 'Refunded/Void'}
                        </span>
                      </td>

                      {/* Print & Void buttons */}
                      <td className="px-5 py-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onViewReceipt(order)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all cursor-pointer"
                            id={`view-ledger-order-${order.orderNo}`}
                          >
                            <ArrowUpRight className="h-3 w-3" />
                            Receipt
                          </button>

                          {isCompleted ? (
                            <button
                              onClick={() => {
                                if (confirm(`Perform full Refund/Void on Order #${order.orderNo}?\nThis operation will restock the itemized catalog inventory quantities.`)) {
                                  onRefund(order.id);
                                }
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100 transition-all cursor-pointer"
                              id={`refund-ledger-order-${order.orderNo}`}
                            >
                              <RotateCcw className="h-3 w-3" />
                              Refund
                            </button>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-400 italic pr-2">
                              Voided
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
