import React, { useState } from 'react';
import { X, UserPlus, Smartphone, Check } from 'lucide-react';
import { APPLE_MUSIC_PLANS } from '../data/mockPayments';

export default function AddPaymentModal({ isOpen, onClose, onAddCustomer }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    plan: 'Individual Plan',
    amount: '10.00',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'Mobile Money',
    notes: ''
  });

  const handleSelectPlan = (planObj) => {
    setFormData({
      ...formData,
      plan: planObj.name,
      amount: planObj.defaultPrice.toString()
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const newCustomer = {
      id: `cust-${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      plan: formData.plan,
      amount: parseFloat(formData.amount) || 10.00,
      dueDate: formData.dueDate,
      status: 'Active',
      paymentMethod: 'Mobile Money',
      notes: formData.notes || 'Registered Apple Music Subscriber',
      history: [{ date: new Date().toISOString().split('T')[0], amount: parseFloat(formData.amount) || 10.00, status: 'Registered' }]
    };

    onAddCustomer(newCustomer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#12121a] w-full max-w-lg rounded-2xl border border-gray-800 p-6 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Register Subscriber (Mobile Money)</h3>
              <p className="text-xs text-gray-400">Add a customer & set custom monthly subscription price</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto space-y-4 my-4 pr-1 text-xs">
          
          {/* Quick Plan Selector */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Select Apple Music Plan Tier
            </label>
            <div className="grid grid-cols-2 gap-2">
              {APPLE_MUSIC_PLANS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPlan(p)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    formData.plan === p.name
                      ? 'bg-rose-500/10 border-rose-500/50 text-white'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{p.name}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5 truncate">{p.description}</div>
                </button>
              ))}
            </div>
          </div>

          <form id="add-customer-form" onSubmit={handleSubmit} className="space-y-3">
            
            {/* Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Mobile Money Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0202995668"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input focus:outline-none"
                />
              </div>
            </div>

            {/* Custom Subscription Price & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Custom Monthly Price ($ USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Set custom price e.g. 2.00 or 15.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input focus:outline-none font-extrabold text-rose-400 border-rose-500/30"
                />
                <span className="text-[10px] text-gray-500 block mt-0.5">Enter any custom rate you set for this user</span>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  placeholder="customer@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input focus:outline-none"
                />
              </div>
            </div>

            {/* Next Due Date & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Next Payment Due Date</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Payment Method</label>
                <div className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs">Mobile Money</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-gray-400 block mb-1 font-semibold">Subscriber Notes / Custom Deal</label>
              <textarea
                rows={2}
                placeholder="e.g. Special negotiated rate or slots details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input focus:outline-none"
              />
            </div>

          </form>

        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-gray-800 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 font-semibold"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="add-customer-form"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all"
          >
            Save Subscriber
          </button>
        </div>

      </div>
    </div>
  );
}
