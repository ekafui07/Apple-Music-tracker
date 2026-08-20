import React, { useState } from 'react';
import { 
  Users, 
  Phone, 
  Mail, 
  Calendar, 
  Smartphone, 
  CheckCircle2, 
  MessageSquare, 
  Trash2, 
  Grid, 
  List as ListIcon, 
  Edit3, 
  Send
} from 'lucide-react';

export default function PaymentList({
  customers,
  currency,
  searchQuery,
  onMarkPaid,
  onSendReminder,
  onOpenEditModal,
  onOpenEmailModal,
  onDeleteCustomer
}) {
  const [selectedPlan, setSelectedPlan] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState('grid');

  const plans = ['All', 'Individual Plan', 'Family Plan', 'Student Plan', 'Apple One Bundle'];
  const statuses = ['All', 'Active', 'Due Soon', 'Overdue'];

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.phone.includes(searchQuery);
    const matchesPlan = selectedPlan === 'All' || c.plan === selectedPlan;
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Filters Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-gray-800">
        
        {/* Plan Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          {plans.map(p => (
            <button
              key={p}
              onClick={() => setSelectedPlan(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedPlan === p
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-gray-900 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Status Filter & View Toggle */}
        <div className="flex items-center space-x-3 w-full lg:w-auto justify-between lg:justify-end">
          
          <div className="flex items-center space-x-1 bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs">
            {statuses.map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedStatus === st
                    ? 'bg-gray-800 text-white font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1 bg-gray-900 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'grid' ? 'bg-rose-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'table' ? 'bg-rose-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Table View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map(customer => {
            const convertedAmount = (customer.amount * currency.rate).toFixed(2);
            
            return (
              <div 
                key={customer.id}
                className="glass-card rounded-2xl p-5 border border-gray-800 flex flex-col justify-between hover:border-gray-700 transition-all"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center font-extrabold text-sm">
                        {customer.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-100 text-sm">
                          {customer.name}
                        </h4>
                        <span className="text-xs text-rose-400 font-medium">
                          {customer.plan}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <span 
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          customer.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : customer.status === 'Due Soon'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : customer.status === 'Overdue'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 font-extrabold'
                            : 'bg-gray-800 text-gray-400 border-gray-700'
                        }`}
                      >
                        {customer.status}
                      </span>
                      
                      {/* Edit Customer Button */}
                      <button
                        onClick={() => onOpenEditModal(customer)}
                        className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                        title="Edit Customer Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-xs text-gray-400 mb-4 bg-gray-900/60 p-2.5 rounded-xl border border-gray-800/80">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span className="truncate">{customer.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  </div>

                  {/* Pricing & Renewal Date */}
                  <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">Set Fee</span>
                      <div className="text-lg font-extrabold text-white">
                        {currency.symbol}{convertedAmount}
                        <span className="text-xs font-normal text-gray-400">/mo</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">Next Renewal</span>
                      <div className="text-xs font-bold text-gray-200 flex items-center justify-end space-x-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-rose-400" />
                        <span>{customer.dueDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                  <button
                    onClick={() => onOpenEmailModal(customer)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
                    title="Send Email Notice"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Email</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onSendReminder(customer)}
                      className="px-2 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-xs font-semibold flex items-center space-x-1 transition-colors"
                      title="Copy Mobile Money Reminder Message"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                      <span className="hidden sm:inline">MoMo</span>
                    </button>

                    <button
                      onClick={() => onMarkPaid(customer.id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center space-x-1"
                      title="Record Payment"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Paid</span>
                    </button>

                    <button
                      onClick={() => onDeleteCustomer(customer.id)}
                      className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-rose-400 transition-colors"
                      title="Remove Customer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Table View with min-w-[750px] for Mobile Horizontal Scroll */
        <div className="glass-card rounded-2xl overflow-hidden border border-gray-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-xs text-gray-300">
              <thead className="bg-gray-900 text-gray-400 uppercase font-semibold border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4 min-w-[140px]">Customer Name</th>
                  <th className="py-3 px-4 min-w-[110px]">Phone / MoMo</th>
                  <th className="py-3 px-4 min-w-[140px]">Email</th>
                  <th className="py-3 px-4 min-w-[120px]">Plan</th>
                  <th className="py-3 px-4 min-w-[80px]">Fee</th>
                  <th className="py-3 px-4 min-w-[100px]">Next Due Date</th>
                  <th className="py-3 px-4 min-w-[90px]">Status</th>
                  <th className="py-3 px-4 text-right min-w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredCustomers.map(c => {
                  const convertedAmount = (c.amount * currency.rate).toFixed(2);
                  return (
                    <tr key={c.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-100 whitespace-nowrap">{c.name}</td>
                      <td className="py-3 px-4 text-gray-400 whitespace-nowrap">{c.phone}</td>
                      <td className="py-3 px-4 text-gray-400 whitespace-nowrap">{c.email}</td>
                      <td className="py-3 px-4 text-rose-400 font-semibold whitespace-nowrap">{c.plan}</td>
                      <td className="py-3 px-4 font-extrabold text-white whitespace-nowrap">
                        {currency.symbol}{convertedAmount}
                      </td>
                      <td className="py-3 px-4 text-gray-200 whitespace-nowrap">{c.dueDate}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          c.status === 'Due Soon' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onOpenEditModal(c)}
                            className="p-1 hover:text-white text-gray-400"
                            title="Edit Subscriber Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenEmailModal(c)}
                            className="p-1 hover:text-indigo-300 text-gray-400"
                            title="Send Email Notice"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onSendReminder(c)}
                            className="p-1 hover:text-white text-gray-400"
                            title="Copy MoMo Reminder"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onMarkPaid(c.id)}
                            className="px-2 py-1 bg-rose-600 text-white rounded text-[11px] font-bold"
                          >
                            Record Paid
                          </button>
                          <button
                            onClick={() => onDeleteCustomer(c.id)}
                            className="p-1 hover:text-rose-400 text-gray-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 glass-card rounded-2xl border border-gray-800">
          <Users className="w-10 h-10 text-gray-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-gray-300">No Customers Found</h4>
          <p className="text-xs text-gray-500 mt-1">Try clearing your filters or register a new subscriber.</p>
        </div>
      )}

    </div>
  );
}
