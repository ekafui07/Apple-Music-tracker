import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Smartphone, 
  BarChart2, 
  History, 
  ArrowUpRight, 
  Users, 
  Search,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

export default function PaymentMethods({ customers, currency, onMarkPaid }) {
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerFilter, setLedgerFilter] = useState('All'); // 'All' | 'Paid' | 'Due Soon' | 'Overdue'

  // Calculate Section 1: Financial Numbers
  const totalSubscribers = customers.filter(c => c.status !== 'Cancelled');
  const expectedTotal = totalSubscribers.reduce((sum, c) => sum + c.amount, 0) * currency.rate;
  
  const paidCustomers = customers.filter(c => c.status === 'Active' || c.status === 'Paid');
  const realizedCollected = paidCustomers.reduce((sum, c) => sum + c.amount, 0) * currency.rate;

  const pendingCustomers = customers.filter(c => c.status === 'Due Soon' || c.status === 'Overdue');
  const pendingCollection = pendingCustomers.reduce((sum, c) => sum + c.amount, 0) * currency.rate;

  const collectionRate = expectedTotal > 0 ? ((realizedCollected / expectedTotal) * 100).toFixed(1) : 100;
  const arpu = totalSubscribers.length > 0 ? (expectedTotal / totalSubscribers.length).toFixed(2) : 0;

  // Section 2: Cash Flow Monthly Chart Data
  const cashFlowData = [
    { month: 'Apr', collected: 65.0 * currency.rate, target: 70.0 * currency.rate },
    { month: 'May', collected: 78.0 * currency.rate, target: 82.0 * currency.rate },
    { month: 'Jun', collected: 84.0 * currency.rate, target: 88.0 * currency.rate },
    { month: 'Jul', collected: 90.0 * currency.rate, target: 95.0 * currency.rate },
    { month: 'Aug (Cur)', collected: realizedCollected, target: expectedTotal }
  ];

  // Section 4: Transaction Audit Ledger Items
  const allLedgerItems = customers.flatMap(c => {
    const historyItems = (c.history || []).map((h, idx) => ({
      id: `${c.id}-hist-${idx}`,
      name: c.name,
      phone: c.phone,
      plan: c.plan,
      amount: c.amount,
      date: h.date,
      status: h.status || 'Paid',
      paymentMethod: c.paymentMethod,
      customerId: c.id
    }));

    if (c.status === 'Due Soon' || c.status === 'Overdue') {
      historyItems.unshift({
        id: `${c.id}-pending`,
        name: c.name,
        phone: c.phone,
        plan: c.plan,
        amount: c.amount,
        date: c.dueDate,
        status: c.status,
        paymentMethod: c.paymentMethod,
        customerId: c.id
      });
    }

    return historyItems;
  });

  const filteredLedger = allLedgerItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
                          item.phone.includes(ledgerSearch) ||
                          item.plan.toLowerCase().includes(ledgerSearch.toLowerCase());
    const matchesFilter = ledgerFilter === 'All' || item.status === ledgerFilter || (ledgerFilter === 'Paid' && item.status === 'Active');
    return matchesSearch && matchesFilter;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Page Title & Mobile Money Status Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-5 rounded-2xl border border-gray-800">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white">Payment Financial Numbers & Cash Flow</h2>
          <p className="text-xs text-gray-400 mt-1">Real-time accounting of Mobile Money collections, pending balances, and transaction logs</p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
          <Smartphone className="w-4 h-4" />
          <span>Mobile Money Channel Active</span>
        </div>
      </div>

      {/* SECTION 1: Financial Numbers & Cash Collection Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Realized Cash Collected */}
        <div className="glass-card rounded-2xl p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Realized Cash Collected
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {currency.symbol}{realizedCollected.toFixed(2)}
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-emerald-400 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Verified Mobile Money payments</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Cash Collection */}
        <div className="glass-card rounded-2xl p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Pending Collection
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-amber-400 tracking-tight">
              {currency.symbol}{pendingCollection.toFixed(2)}
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-amber-400 font-medium mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Outstanding due balances</span>
            </div>
          </div>
        </div>

        {/* Card 3: Collection Efficiency Rate */}
        <div className="glass-card rounded-2xl p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Collection Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {collectionRate}%
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-gray-400 mt-1">
              <span>Target: {currency.symbol}{expectedTotal.toFixed(2)} total</span>
            </div>
          </div>
        </div>

        {/* Card 4: ARPU */}
        <div className="glass-card rounded-2xl p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Avg Fee / Subscriber
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {currency.symbol}{arpu}
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-blue-400 font-medium mt-1">
              <Users className="w-3.5 h-3.5" />
              <span>Across {totalSubscribers.length} active members</span>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 2: Monthly Cash Flow Chart */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-gray-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-gray-100 text-sm">Monthly Cash Flow: Collected vs Target</h3>
            <p className="text-xs text-gray-400">Comparing actual realized MoMo collections against target monthly revenue</p>
          </div>
          <span className="text-xs text-emerald-400 font-bold flex items-center bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> +14.2% Cash Growth
          </span>
        </div>

        <div className="h-60 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f202e" vertical={false} />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
              <Tooltip
                formatter={(val) => [`${currency.symbol}${parseFloat(val).toFixed(2)}`]}
                contentStyle={{ backgroundColor: '#13131c', borderColor: '#2d2e42', borderRadius: '10px', color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="collected" name="Realized Cash Collected ($)" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="target" name="Expected Target Revenue ($)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 4: Transaction Audit Ledger */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-gray-800">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="font-bold text-gray-100 text-sm">Transaction Audit Ledger</h3>
              <p className="text-xs text-gray-400">Detailed historical payment receipts & pending collection log</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {/* Ledger Search */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ledger..."
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1 bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs overflow-x-auto">
              {['All', 'Paid', 'Due Soon', 'Overdue'].map(st => (
                <button
                  key={st}
                  onClick={() => setLedgerFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                    ledgerFilter === st ? 'bg-rose-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Table - Scrollable Container with Min Width */}
        <div className="glass-card rounded-2xl overflow-hidden border border-gray-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs text-gray-300">
              <thead className="bg-gray-900 text-gray-400 uppercase font-semibold border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4 min-w-[90px]">Date</th>
                  <th className="py-3 px-4 min-w-[140px]">Subscriber Name</th>
                  <th className="py-3 px-4 min-w-[110px]">MoMo Number</th>
                  <th className="py-3 px-4 min-w-[120px]">Plan Tier</th>
                  <th className="py-3 px-4 min-w-[80px]">Set Fee</th>
                  <th className="py-3 px-4 min-w-[120px]">Payment Method</th>
                  <th className="py-3 px-4 min-w-[90px]">Status</th>
                  <th className="py-3 px-4 text-right min-w-[100px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredLedger.map(item => {
                  const convertedAmount = (item.amount * currency.rate).toFixed(2);
                  return (
                    <tr key={item.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-3 px-4 text-gray-400 font-mono whitespace-nowrap">{item.date}</td>
                      <td className="py-3 px-4 font-bold text-gray-100 whitespace-nowrap">{item.name}</td>
                      <td className="py-3 px-4 text-gray-400 whitespace-nowrap">{item.phone}</td>
                      <td className="py-3 px-4 text-rose-400 font-semibold whitespace-nowrap">{item.plan}</td>
                      <td className="py-3 px-4 font-extrabold text-white whitespace-nowrap">
                        {currency.symbol}{convertedAmount}
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-medium whitespace-nowrap flex items-center space-x-1">
                        <Smartphone className="w-3 h-3" />
                        <span>Mobile Money</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          item.status === 'Paid' || item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          item.status === 'Due Soon' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          'bg-rose-500/20 text-rose-400 border-rose-500/30 font-extrabold'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {(item.status === 'Due Soon' || item.status === 'Overdue') && onMarkPaid ? (
                          <button
                            onClick={() => onMarkPaid(item.customerId)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-bold transition-all"
                          >
                            Record Paid
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-500 italic">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
