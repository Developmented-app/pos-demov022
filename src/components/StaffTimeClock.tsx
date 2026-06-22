import React, { useState, useEffect } from 'react';
import { Shift, UserRole } from '../types';
import { Clock, UserCheck, UserX, Calendar, Play, Square, Award, Trash2, Clipboard, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StaffTimeClockProps {
  shifts: Shift[];
  currentRole: UserRole;
  onClockIn: (role: UserRole) => void;
  onClockOut: () => void;
  onClearShifts: () => void;
  onDeleteShift: (id: string) => void;
}

export default function StaffTimeClock({
  shifts,
  currentRole,
  onClockIn,
  onClockOut,
  onClearShifts,
  onDeleteShift,
}: StaffTimeClockProps) {
  // Find active running shift (no endTime)
  const activeShift = shifts.find((s) => !s.endTime) || null;

  // Track live counter state for elapsed duration
  const [elapsedString, setElapsedString] = useState('00:00:00');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (activeShift) {
      const updateTimer = () => {
        const start = new Date(activeShift.startTime).getTime();
        const now = Date.now();
        const diffMs = Math.max(0, now - start);

        // Calculate hours, minutes, seconds
        const hrs = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);
        const secs = Math.floor((diffMs % 6000) / 1000); // Wait, diffMs % 60000 / 1000 is seconds! Let's fix that
        const secsCorrect = Math.floor((diffMs % 60000) / 1000);

        const format = (num: number) => num.toString().padStart(2, '0');
        setElapsedString(`${format(hrs)}:${format(mins)}:${format(secsCorrect)}`);
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setElapsedString('00:00:00');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeShift]);

  // Aggregate stats
  const completedShifts = shifts.filter((s) => s.endTime);
  const totalHours = completedShifts.reduce((sum, s) => sum + (s.hoursWorked || 0), 0);

  // Grouped by role hours
  const hoursByRole = completedShifts.reduce((acc, s) => {
    acc[s.userRole] = (acc[s.userRole] || 0) + (s.hoursWorked || 0);
    return acc;
  }, {} as Record<UserRole, number>);

  return (
    <div className="space-y-5" id="staff-time-clock-root">
      {/* Dynamic Action Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Interactive Clock In/Out Terminal */}
        <div className="md:col-span-1 rounded-2xl border border-slate-150 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 font-mono flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>Shift Register</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Clock in/out to track your hours securely</p>
          </div>

          <AnimatePresence mode="wait">
            {activeShift ? (
              <motion.div
                key="active-shift"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3.5"
              >
                {/* Active Shift Info */}
                <div className="rounded-xl bg-indigo-50 border border-indigo-150 p-4 text-center space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-indigo-700">
                    <UserCheck className="h-4.5 w-4.5 animate-pulse" />
                    <span className="text-xs font-black font-sans uppercase tracking-wide">
                      Active Shift Running
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[10px] font-medium text-indigo-500 font-sans">
                      Clocked in as <span className="font-bold underline">{activeShift.userRole}</span>
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">
                      Since: {new Date(activeShift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>

                  {/* Big digital timer representation */}
                  <div className="text-xl font-bold font-mono tracking-tight text-indigo-950 bg-white border border-indigo-100/60 rounded-xl py-1.5 shadow-2xs">
                    {elapsedString}
                  </div>
                </div>

                <button
                  onClick={onClockOut}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-98 transition-all text-white font-bold text-xs flex items-center justify-center gap-2"
                  id="clock-out-btn"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                  Clock Out Shift
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="inactive-shift"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Inactive state display */}
                <div className="rounded-xl bg-slate-50 border border-slate-150 p-4 text-center space-y-2.5">
                  <UserX className="h-5 w-5 text-slate-400 mx-auto" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-700">Not Currently Clocked In</p>
                    <p className="text-[10px] text-slate-400">
                      Next login role detected: <span className="text-indigo-650 font-bold font-mono">{currentRole}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => onClockIn(currentRole)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition-all text-white font-bold text-xs flex items-center justify-center gap-2"
                    id="clock-in-btn"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Clock In as {currentRole}
                  </button>

                  {/* Fast simulation help */}
                  <p className="text-[9px] text-center text-slate-400 leading-normal">
                    *Tip: Shifts are assigned to the current active dispatch role. Change roles in the Alert Dispatch panel.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Aggregated Hours stats */}
        <div className="md:col-span-2 rounded-2xl border border-slate-150 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 font-mono flex items-center gap-2">
              <Award className="h-3.5 w-3.5 text-slate-500" />
              <span>Shift Metrics Summary</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Total recorded worked hours breakdown</p>
          </div>

          <div className="grid grid-cols-3 gap-3.5 my-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Total Hours</span>
              <span className="text-xl font-bold font-mono text-slate-800 block mt-1">
                {totalHours.toFixed(2)} hrs
              </span>
            </div>
            <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/50 text-center">
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Completed Shifts</span>
              <span className="text-xl font-bold font-mono text-indigo-750 block mt-1">
                {completedShifts.length}
              </span>
            </div>
            <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100/50 text-center animate-pulse">
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Status</span>
              <span className={`text-[10px] font-bold uppercase block mt-2 ${activeShift ? 'text-emerald-700' : 'text-slate-500'}`}>
                {activeShift ? '🔴 WORKING' : '💤 OFFLINE'}
              </span>
            </div>
          </div>

          {/* Role specific split */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase font-mono">
              <span>Worked Split by Position</span>
              <span>Accumulated Hours</span>
            </div>
            <div className="flex gap-2">
              {['Cashier', 'Admin', 'Other'].map((role) => {
                const hrs = hoursByRole[role as UserRole] || 0;
                const percent = totalHours > 0 ? (hrs / totalHours) * 100 : 0;
                const colors =
                  role === 'Cashier'
                    ? { bg: 'bg-indigo-600', text: 'text-indigo-600' }
                    : role === 'Admin'
                    ? { bg: 'bg-indigo-400', text: 'text-indigo-400' }
                    : { bg: 'bg-slate-400', text: 'text-slate-400' };

                return (
                  <div key={role} className="flex-1 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-semibold text-slate-600">{role}</span>
                      <span className="font-mono font-bold text-slate-700">{hrs.toFixed(2)}h</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors.bg}`}
                        style={{ width: `${percent || 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Shifts History Log Table */}
      <div className="rounded-2xl border border-slate-150 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Completed Shifts History Logs</h3>
          </div>

          {shifts.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all historical shift time clock logs? This cannot be undone.')) {
                  onClearShifts();
                }
              }}
              className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
              id="clear-all-shifts-btn"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear Shifts
            </button>
          )}
        </div>

        <div className="max-h-[220px] overflow-y-auto">
          {shifts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Clipboard className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-xs">No logged shifts yet. Start by clocking in your first shift!</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-100 text-left border-collapse">
              <thead className="bg-slate-50 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500 select-none">
                <tr>
                  <th className="px-5 py-3.5">Position Role</th>
                  <th className="px-3 py-3.5">Date</th>
                  <th className="px-3 py-3.5">Start Time</th>
                  <th className="px-3 py-3.5">End Time</th>
                  <th className="px-3 py-3.5 text-right">Hours Worked</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
                {/* Order from newest running to oldest shifts */}
                {[...shifts]
                  .reverse()
                  .map((shift) => {
                    const isRunning = !shift.endTime;
                    return (
                      <tr
                        key={shift.id}
                        className={`hover:bg-slate-50/40 transition-colors ${
                          isRunning ? 'bg-indigo-50/10 font-medium' : ''
                        }`}
                      >
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center rounded-xl px-2 py-0.5 text-[10px] font-bold ${
                              shift.userRole === 'Admin'
                                ? 'bg-indigo-100 text-indigo-700'
                                : shift.userRole === 'Cashier'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-150 text-slate-600'
                            }`}
                          >
                            {shift.userRole}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-500 text-[11px]">
                          {new Date(shift.startTime).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-3 py-3 font-mono text-slate-500 text-[11px]">
                          {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-3 py-3 font-mono text-slate-500 text-[11px]">
                          {shift.endTime ? (
                            new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          ) : (
                            <span className="text-red-500 font-bold animate-pulse">Running...</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-bold text-slate-900">
                          {isRunning ? (
                            <span className="text-indigo-600 text-[10px] font-sans">In Progress</span>
                          ) : (
                            `${(shift.hoursWorked || 0).toFixed(2)} hrs`
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => onDeleteShift(shift.id)}
                            className="text-slate-400 hover:text-red-500 hover:scale-110 transition-all p-1 cursor-pointer"
                            title="Delete this shift entry record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
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
