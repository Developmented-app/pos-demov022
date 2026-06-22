import React, { useState } from 'react';
import { Order, Product, Shift, UserRole } from '../types';
import { TrendingUp, Coins, ShoppingBag, Receipt, Percent, RotateCcw, ArrowUpRight, Search, BarChart3, Clock, Download, CalendarDays, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import StaffTimeClock from './StaffTimeClock';

interface AnalyticsPanelProps {
  orders: Order[];
  onRefund: (orderId: string) => void;
  onViewReceipt: (order: Order) => void;
  products: Product[];
  shifts: Shift[];
  currentRole: UserRole;
  onClockIn: (role: UserRole) => void;
  onClockOut: () => void;
  onClearShifts: () => void;
  onDeleteShift: (id: string) => void;
}

export default function AnalyticsPanel({
  orders,
  onRefund,
  onViewReceipt,
  products,
  shifts,
  currentRole,
  onClockIn,
  onClockOut,
  onClearShifts,
  onDeleteShift,
}: AnalyticsPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'sales' | 'timeclock'>('sales');
  const [historySearch, setHistorySearch] = useState('');
  const [dataMode, setDataMode] = useState<'real' | 'demo'>('real');

  // --- Calculate Last 7 Days Sales Volume ---
  const getLast7DaysData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyData: { dateKey: string; name: string; dateStr: string; volume: number; sales: number }[] = [];

    // Initialize 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const monthStr = d.toLocaleDateString([], { month: 'short' });
      const dateNum = d.getDate();
      
      dailyData.push({
        dateKey: d.toDateString(),
        name: dayName,
        dateStr: `${monthStr} ${dateNum}`,
        volume: 0,
        sales: 0
      });
    }

    // Populate actual orders
    orders.forEach((o) => {
      if (o.status !== 'completed') return;
      const oDate = new Date(o.timestamp);
      const oKey = oDate.toDateString();
      const match = dailyData.find((item) => item.dateKey === oKey);
      if (match) {
        match.volume += 1;
        match.sales += o.total;
      }
    });

    // Demo baseline dataset to show realistic data if no real orders have been made yet
    const demoVolumes = [14, 18, 25, 22, 38, 48, 32];
    const demoSales = [120.50, 162.00, 245.80, 210.00, 412.50, 524.00, 318.20];

    return dailyData.map((day, idx) => {
      const isRealEmpty = orders.filter(o => o.status === 'completed').length === 0;
      const shouldUseDemo = dataMode === 'demo' || (isRealEmpty && dataMode === 'real');
      
      return {
        ...day,
        volume: shouldUseDemo ? demoVolumes[idx] + day.volume : day.volume,
        sales: shouldUseDemo ? demoSales[idx] + day.sales : day.sales,
        isDemoData: isRealEmpty || dataMode === 'demo'
      };
    });
  };

  const last7DaysData = getLast7DaysData();
  const totalVolumeAcross7Days = last7DaysData.reduce((sum, d) => sum + d.volume, 0);

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

        {activeSubTab === 'sales' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              disabled={orders.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-sans bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-98 transition-all shadow-xs cursor-pointer select-none"
              id="print-analytics-report-btn"
              title="Print printer-friendly financial and shift report"
            >
              <Printer className="h-4 w-4 text-slate-650" />
              Print Report
            </button>
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
        )}
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit self-start" id="analytics-subtabs-navigation">
        <button
          onClick={() => setActiveSubTab('sales')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
            activeSubTab === 'sales' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-850'
          }`}
          id="subnav-sales-reports"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Sales & KPI Reports
        </button>
        <button
          onClick={() => setActiveSubTab('timeclock')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all relative ${
            activeSubTab === 'timeclock' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-850'
          }`}
          id="subnav-staff-timeclock"
        >
          <Clock className="h-3.5 w-3.5" />
          Staff Time Clock
          {shifts.some((s) => !s.endTime) && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
          )}
          {shifts.some((s) => !s.endTime) && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-650" />
          )}
        </button>
      </div>

      {activeSubTab === 'sales' ? (
        <>
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

      {/* 7-Day Sales Volume Activity (Recharts Bar Chart) */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs" id="historical-analytics-recharts-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-black text-indigo-600 font-mono tracking-widest block">Volume Metrics</span>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <CalendarDays className="h-4.5 w-4.5 text-slate-500" />
              <span>7-Day Sales Activity & Order Ticket Volume</span>
            </h3>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold select-none h-fit">
            <button
              onClick={() => setDataMode('real')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                dataMode === 'real' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-500 hover:text-slate-700'
              }`}
              id="chart-mode-real"
            >
              Session Live
            </button>
            <button
              onClick={() => setDataMode('demo')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                dataMode === 'demo' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-500 hover:text-slate-700'
              }`}
              id="chart-mode-demo"
            >
              Weekly Baseline
            </button>
          </div>
        </div>

        {/* Display subtitle notice for state */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4 bg-slate-50/50 px-3.5 py-2 rounded-xl border border-slate-100 font-sans">
          <span>
            {last7DaysData[0]?.isDemoData ? (
              <span className="text-indigo-600 font-semibold">ℹ️ No active sales yet in this session database. Showing combined standard coffee shop baseline metrics.</span>
            ) : (
              <span>Showing live ledger data tracked over the past 7 calendar days.</span>
            )}
          </span>
          <span className="font-mono text-slate-500 font-semibold">
            Count: <span className="text-slate-800 font-bold">{totalVolumeAcross7Days} order tickets</span>
          </span>
        </div>

        {/* Bar Chart Space */}
        <div className="h-64 w-full pt-1" id="recharts-bar-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={last7DaysData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              barGap={0}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc', radius: 8 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white rounded-xl p-3 shadow-lg border border-slate-800 text-xs space-y-1">
                        <p className="font-bold font-sans text-[11px] text-slate-300">
                          {data.dateStr} ({data.name})
                        </p>
                        <div className="h-px bg-slate-800 my-1" />
                        <p className="font-medium text-slate-200 font-sans">
                          🎫 Volume: <span className="font-mono font-bold text-indigo-400">{data.volume} checkouts</span>
                        </p>
                        <p className="font-medium text-[11px] text-slate-300 font-sans">
                          💰 Total Sales: <span className="font-mono text-emerald-400 font-bold">${data.sales.toFixed(2)}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="volume"
                name="Order Volume"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              >
                {last7DaysData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.dateKey}-${index}`}
                    fill="url(#barGradient)"
                    className="hover:opacity-90 hover:filter hover:brightness-105 transition-all duration-300"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
      </>
      ) : (
        <StaffTimeClock
          shifts={shifts}
          currentRole={currentRole}
          onClockIn={onClockIn}
          onClockOut={onClockOut}
          onClearShifts={onClearShifts}
          onDeleteShift={onDeleteShift}
        />
      )}
    </div>
  );
}
