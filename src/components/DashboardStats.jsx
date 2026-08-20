import React from 'react';
import { 
  Users, 
  DollarSign, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  MessageSquare,
  TrendingUp,
  Smartphone,
  UserCheck
} from 'lucide-react';

export default function DashboardStats({ customers, currency, onMarkPaid, onSendReminder }) {
  const activeCustomers = customers.filter(c => c.status !== 'Cancelled');
  
  // Calculate Total Monthly Revenue
  const totalMonthlyRevenue = activeCustomers.reduce((acc, c) => acc + c.amount, 0) * currency.rate;

  const dueSoonCustomers = customers.filter(c => c.status === 'Due Soon');
  const overdueCustomers = customers.filter(c => c.status === 'Overdue');
  const urgentCount = dueSoonCustomers.length + overdueCustomers.length;

  const urgentCustomer = overdueCustomers[0] || dueSoonCustomers[0];

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Urgent Customer Overdue Alert */}
      {urgentCustomer && (
        <div className="rounded-2xl bg-gray-900 border border-rose-500/40 p-4 lg:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-500">
                  Mobile Money Due Alert
                </span>
                <span className="text-xs text-gray-400">
                  • {urgentCount} subscriber{urgentCount > 1 ? 's' : ''} pending
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">
                {urgentCustomer.name} ({urgentCustomer.plan}) — {currency.symbol}{(urgentCustomer.amount * currency.rate).toFixed(2)}/mo
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Due Date: {urgentCustomer.dueDate} • MoMo Phone: <span className="text-gray-200 font-bold">{urgentCustomer.phone}</span> • Status: <span className="text-amber-400 font-bold">{urgentCustomer.status}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end shrink-0">
            <button
              onClick={() => onSendReminder(urgentCustomer)}
              className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold border border-gray-700 flex items-center space-x-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
              <span>Copy MoMo Reminder</span>
            </button>
            <button
              onClick={() => onMarkPaid(urgentCustomer.id)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Record Paid</span>
            </button>
          </div>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Monthly Revenue */}
        <div className="glass-card rounded-2xl p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Monthly Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {currency.symbol}{totalMonthlyRevenue.toFixed(2)}
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-emerald-400 mt-1 font-medium">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Collected via Mobile Money</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Active Subscribers */}
        <div className="glass-card rounded-2xl p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Active Subscribers
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {activeCustomers.length} <span className="text-xs font-normal text-gray-400">Members</span>
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-gray-400 mt-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Custom negotiated plan tiers</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Due Soon */}
        <div className="glass-card rounded-2xl p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Due in 7 Days
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {dueSoonCustomers.length} <span className="text-xs font-normal text-gray-400">Customers</span>
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-amber-400 font-medium mt-1">
              <span>Upcoming renewal dates</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Overdue Count */}
        <div className="glass-card rounded-2xl p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Overdue Payments
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-rose-400 tracking-tight">
              {overdueCustomers.length} <span className="text-xs font-normal text-gray-400">Pending</span>
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-rose-400 mt-1">
              <span>Requires Mobile Money reminder</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
