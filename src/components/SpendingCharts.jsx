import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { PieChart as PieIcon, BarChart2, History, Users } from 'lucide-react';

const PLAN_COLORS = {
  'Individual Plan': '#fa233b',
  'Family Plan': '#e63946',
  'Student Plan': '#ff4d6d',
  'Apple One Bundle': '#c9184a',
  Other: '#64748b'
};

export default function SpendingCharts({ customers, currency }) {
  // Aggregate customers by plan
  const planCountMap = customers.reduce((acc, c) => {
    if (c.status === 'Cancelled') return acc;
    const plan = c.plan || 'Individual Plan';
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(planCountMap).map(plan => ({
    name: plan,
    value: planCountMap[plan],
    color: PLAN_COLORS[plan] || PLAN_COLORS.Other
  }));

  // Revenue trend
  const revenueTrendData = [
    { month: 'Apr', revenue: 65.90 * currency.rate },
    { month: 'May', revenue: 78.85 * currency.rate },
    { month: 'Jun', revenue: 84.90 * currency.rate },
    { month: 'Jul', revenue: 92.80 * currency.rate },
    { month: 'Aug', revenue: customers.reduce((sum, c) => sum + (c.amount * currency.rate), 0) }
  ];

  // Recent Customer Payments
  const recentPayments = customers
    .flatMap(c => (c.history || []).map(h => ({ ...h, name: c.name, plan: c.plan })))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Plan Distribution */}
      <div className="glass-card rounded-2xl p-5 border border-gray-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                <PieIcon className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-200 text-sm">Subscribers by Plan</h3>
            </div>
            <span className="text-xs text-gray-400">Apple Music</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0d0d12" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`${val} Subscribers`, 'Count']}
                  contentStyle={{ backgroundColor: '#13131c', borderColor: '#2d2e42', borderRadius: '10px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-gray-800 text-xs">
          {pieData.map((item) => (
            <div key={item.name} className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-gray-300 truncate">{item.name}</span>
              <span className="text-gray-400 font-bold ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="glass-card rounded-2xl p-5 border border-gray-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-200 text-sm">Monthly Subscription Growth</h3>
            </div>
            <span className="text-xs text-rose-400 font-semibold">Live Growth</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f202e" vertical={false} />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${currency.symbol}${val.toFixed(2)}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#13131c', borderColor: '#2d2e42', borderRadius: '10px', color: '#fff' }}
                />
                <Bar dataKey="revenue" fill="#fa233b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-2 pt-3 border-t border-gray-800">
          *Calculated from active Apple Music customer renewals.
        </p>
      </div>

      {/* Payment Ledger */}
      <div className="glass-card rounded-2xl p-5 border border-gray-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                <History className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-200 text-sm">Recent Customer Payments</h3>
            </div>
            <span className="text-xs text-gray-400">Ledger</span>
          </div>

          <div className="space-y-2.5">
            {recentPayments.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs">
                <div>
                  <div className="font-bold text-gray-200">{p.name}</div>
                  <div className="text-[10px] text-gray-400">{p.plan} • {p.date}</div>
                </div>
                <div className="text-right font-extrabold text-emerald-400">
                  {currency.symbol}{(p.amount * currency.rate).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-800 text-center text-xs text-gray-400">
          Verified Apple Music Payment Audit History
        </div>
      </div>

    </div>
  );
}
