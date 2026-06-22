import React, { useState } from 'react';
import { NotificationPayload, UserRole } from '../types';
import { Bell, Shield, User, HeartHandshake, Eye, Volume2, Slack, Phone, Mail, Ban, Check, Trash2, Zap, AlertTriangle, AlertCircle, Sparkles, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationCenterProps {
  notifications: NotificationPayload[];
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  config: {
    slackEnabled: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;
    soundEnabled: boolean;
  };
  onConfigChange: (newConfig: {
    slackEnabled: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;
    soundEnabled: boolean;
  }) => void;
  onClearNotifications: () => void;
  onManualTriggerSim: (type: 'checkout' | 'cancel') => void;
}

export default function NotificationCenter({
  notifications,
  activeRole,
  onRoleChange,
  config,
  onConfigChange,
  onClearNotifications,
  onManualTriggerSim,
}: NotificationCenterProps) {
  const [testMode, setTestMode] = useState(false);

  const toggleChan = (key: 'slackEnabled' | 'smsEnabled' | 'emailEnabled' | 'soundEnabled') => {
    onConfigChange({
      ...config,
      [key]: !config[key],
    });
  };

  return (
    <div className="space-y-6" id="notification-center-panel">
      {/* Upper Meta Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800 tracking-tight flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-600 animate-pulse" />
            Alert Dispatch & Role Center
          </h2>
          <p className="text-xs text-slate-500">
            Real-time multi-channel notifications on invoice checkout & cancellations
          </p>
        </div>

        <button
          onClick={() => onManualTriggerSim('checkout')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all py-2 px-4 rounded-xl cursor-pointer"
          id="quick-sim-checkout"
        >
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          Simulate Checkout Alert
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Role Selector & Configurations */}
        <div className="lg:col-span-1 space-y-6">
          {/* Active Cashier Role Toggles */}
          <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 font-mono">
              1. Active Cashier Role
            </h3>

            <div className="space-y-2.5">
              {/* Admin Selector */}
              <button
                onClick={() => onRoleChange('Admin')}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                  activeRole === 'Admin'
                    ? 'border-indigo-600 bg-indigo-50/20 text-indigo-950 shadow-xs'
                    : 'border-slate-100 hover:border-slate-200 text-slate-600'
                }`}
                id="role-select-admin"
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${activeRole === 'Admin' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs font-sans">Administrator</span>
                    {activeRole === 'Admin' && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-mono">Active</span>}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    🚫 Silences notifications. Invoices checkout or cancellation will NOT trigger alerts.
                  </p>
                </div>
              </button>

              {/* Cashier Selector */}
              <button
                onClick={() => onRoleChange('Cashier')}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                  activeRole === 'Cashier'
                    ? 'border-indigo-600 bg-indigo-50/20 text-indigo-950 shadow-xs'
                    : 'border-slate-100 hover:border-slate-200 text-slate-600'
                }`}
                id="role-select-cashier"
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${activeRole === 'Cashier' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs font-sans">Staff Cashier</span>
                    {activeRole === 'Cashier' && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-mono">Active</span>}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    📡 Active alerts. Checkout or cancel events automatically trigger secure channels.
                  </p>
                </div>
              </button>

              {/* Other Selector */}
              <button
                onClick={() => onRoleChange('Other')}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                  activeRole === 'Other'
                    ? 'border-indigo-600 bg-indigo-50/20 text-indigo-950 shadow-xs'
                    : 'border-slate-100 hover:border-slate-200 text-slate-600'
                }`}
                id="role-select-other"
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${activeRole === 'Other' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <HeartHandshake className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs font-sans">Other (Supervisor/Guest)</span>
                    {activeRole === 'Other' && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-mono">Active</span>}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    📡 Active alerts. Perfect for system-wide auditing and training notifications.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Active Channels Configurations */}
          <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 font-mono">
              2. Channels & Targets
            </h3>

            <div className="space-y-2.5">
              {/* Slack */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${config.slackEnabled ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-400'}`}>
                    <Slack className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold font-sans text-slate-800">Slack Webhook</p>
                    <p className="text-[10px] text-slate-400">Dispatch alerts to #register-logs</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleChan('slackEnabled')}
                  className={`h-5 w-9 rounded-full transition-colors relative cursor-pointer ${
                    config.slackEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                  id="toggle-slack-channel"
                >
                  <div className={`h-4 w-4 rounded-full bg-white absolute top-0.5 transition-all ${config.slackEnabled ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* SMS alert */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${config.smsEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold font-sans text-slate-800">SMS Broadcaster</p>
                    <p className="text-[10px] text-slate-400">Emergency notifications to supervisor</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleChan('smsEnabled')}
                  className={`h-5 w-9 rounded-full transition-colors relative cursor-pointer ${
                    config.smsEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                  id="toggle-sms-channel"
                >
                  <div className={`h-4 w-4 rounded-full bg-white absolute top-0.5 transition-all ${config.smsEnabled ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Email Alert */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${config.emailEnabled ? 'bg-blue-100 text-blue-700' : 'bg-slate-50 text-slate-400'}`}>
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold font-sans text-slate-800">Email Dispatcher</p>
                    <p className="text-[10px] text-slate-400">Nightly POS audit ticket logs</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleChan('emailEnabled')}
                  className={`h-5 w-9 rounded-full transition-colors relative cursor-pointer ${
                    config.emailEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                  id="toggle-email-channel"
                >
                  <div className={`h-4 w-4 rounded-full bg-white absolute top-0.5 transition-all ${config.emailEnabled ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Sound Ping */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${config.soundEnabled ? 'bg-pink-100 text-pink-700' : 'bg-slate-50 text-slate-400'}`}>
                    <Volume2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold font-sans text-slate-800">Volume Ping</p>
                    <p className="text-[10px] text-slate-400">Play responsive audio sound alerts</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleChan('soundEnabled')}
                  className={`h-5 w-9 rounded-full transition-colors relative cursor-pointer ${
                    config.soundEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                  id="toggle-sound-channel"
                >
                  <div className={`h-4 w-4 rounded-full bg-white absolute top-0.5 transition-all ${config.soundEnabled ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Telegram (BLOCKED / OFFLINE EXPLICIT DESIGN) */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-red-200 bg-red-50/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-red-100 text-red-700">
                    <Ban className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black font-sans text-red-800 flex items-center gap-1">
                      Telegram Channel
                      <span className="text-[8px] bg-red-550 text-white font-extrabold px-1 rounded uppercase tracking-wider scale-95">Offline</span>
                    </p>
                    <p className="text-[10px] text-slate-400">Deactivated per security architecture</p>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-red-500 font-extrabold select-none uppercase tracking-wider">
                  Disabled
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Dispatch Log Monitor Terminal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs flex flex-col justify-between h-full min-h-[500px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-indigo-600 shrink-0" />
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 font-mono">
                    Live Dispatch Stream Terminal
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-400">STREAMING • ALL SYNCED</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={onClearNotifications}
                      className="ml-3 inline-flex items-center gap-1 text-[10px] text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded"
                      id="clear-logs-btn"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear Logs
                    </button>
                  )}
                </div>
              </div>

              {/* Sandbox Trigger Station */}
              <div className="rounded-xl bg-slate-55 mb-2.5 p-3.5 border border-slate-100 flex flex-wrap gap-2 items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-spin" />
                    Interactive Sandbox Station
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Test how current role ({activeRole}) affects live broadcast events.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onManualTriggerSim('checkout')}
                    className="px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold hover:bg-indigo-100 transition-colors rounded-lg cursor-pointer"
                    id="trigger-checkout-sandbox-btn"
                  >
                    Checkout Invoice
                  </button>
                  <button
                    onClick={() => onManualTriggerSim('cancel')}
                    className="px-2.5 py-1.5 bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold hover:bg-red-100 transition-colors rounded-lg cursor-pointer"
                    id="trigger-cancel-sandbox-btn"
                  >
                    Cancel / Refund Order
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-900 bg-slate-950 p-4 font-mono text-xs text-slate-350 min-h-[300px] max-h-[400px] overflow-y-auto space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-20 text-slate-600 italic">
                    {activeRole === 'Admin' ? (
                      <div className="space-y-1">
                        <p>No dispatch logs received.</p>
                        <p className="text-[10px] text-red-400 not-italic font-sans">
                          ⚠️ Active role is currently Admin. Admin actions do NOT dispatch notifications. Change role to "Cashier" or "Other" to start broadcasting.
                        </p>
                      </div>
                    ) : (
                      <p>Terminal waiting for checkout or cancel events... Try checking out items or clicking simulation buttons above.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="border-b border-slate-900 pb-2.5 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between">
                          <span className={`text-[10px] font-bold uppercase rounded px-1.5 py-0.5 leading-none ${
                            notif.type === 'checkout'
                              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
                              : notif.type === 'cancel'
                              ? 'bg-red-950/80 border border-red-800 text-red-400'
                              : 'bg-indigo-950/80 border border-indigo-800 text-indigo-400'
                          }`}>
                            {notif.type}
                          </span>

                          <span className="text-[9px] text-slate-500">
                            {new Date(notif.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        <p className="text-white font-bold text-[11px] mt-1.5">{notif.title}</p>
                        <p className="text-slate-400 mt-1 text-[10px]">{notif.message}</p>

                        {/* Channels dispatch badges */}
                        <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[9px] text-slate-500 uppercase font-black shrink-0">Dispatched To:</span>
                          {notif.channels.slackSimulated && (
                            <span className="text-[9px] bg-amber-950/60 border border-amber-900/50 text-amber-500 px-1 rounded flex items-center gap-0.5">
                              <Slack className="h-2 w-2" /> Slack
                            </span>
                          )}
                          {notif.channels.smsSimulated && (
                            <span className="text-[9px] bg-emerald-950/60 border border-emerald-900/50 text-emerald-400 px-1 rounded flex items-center gap-0.5">
                              <Phone className="h-2 w-2" /> SMS
                            </span>
                          )}
                          {notif.channels.emailSimulated && (
                            <span className="text-[9px] bg-blue-950/60 border border-blue-900/50 text-blue-400 px-1 rounded flex items-center gap-0.5">
                              <Mail className="h-2 w-2" /> Email
                            </span>
                          )}
                          {notif.channels.audioPing && (
                            <span className="text-[9px] bg-pink-950/60 border border-pink-900/50 text-pink-400 px-1 rounded flex items-center gap-0.5">
                              <Volume2 className="h-2 w-2" /> Sound
                            </span>
                          )}
                          <span className="text-[9px] bg-red-950/40 border border-red-950/50 text-red-600/80 px-1 rounded line-through">
                            Telegram
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Architecture guidelines banner footer */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[10px] text-slate-500 font-sans">
              <span className="flex items-center gap-1.5 font-medium">
                <AlertCircle className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                No-Telegram security ruleset has been complied with.
              </span>
              <span>All notifications securely persist inside user's local instance.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
