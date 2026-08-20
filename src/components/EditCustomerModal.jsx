import React, { useState, useEffect } from 'react';
import { X, Edit3, Save, Smartphone } from 'lucide-react';
import { APPLE_MUSIC_PLANS } from '../data/mockPayments';

export default function EditCustomerModal({ isOpen, onClose, customer, onSaveCustomer }) {
  if (!isOpen || !customer) return null;

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    phone: '',
    email: '',
    plan: 'Individual Plan',
    amount: '',
    dueDate: '',
    status: 'Active',
    paymentMethod: 'Mobile Money',
    notes: ''
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        id: customer.id,
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        plan: customer.plan || 'Individual Plan',
        amount: customer.amount ? customer.amount.toString() : '10.00',
        dueDate: customer.dueDate || new Date().toISOString().split('T')[0],
        status: customer.status || 'Active',
        paymentMethod: customer.paymentMethod || 'Mobile Money',
        notes: customer.notes || ''
      });
    }
  }, [customer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const updated = {
      ...customer,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      plan: formData.plan,
      amount: parseFloat(formData.amount) || 10.00,
      dueDate: formData.dueDate,
      status: formData.status,
      notes: formData.notes
    };

    onSaveCustomer(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#12121a] w-full max-w-lg rounded-2xl border border-gray-800 p-6 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Subscriber Details</h3>
              <p className="text-xs text-gray-400">Update customer contact, set fee, due date, or plan status</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto space-y-3 my-4 pr-1">
          <form id="edit-customer-form" onSubmit={handleSubmit} className="space-y-3">
            
            {/* Customer Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Mobile Money Phone *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input focus:outline-none"
                />
              </div>
            </div>

            {/* Email & Custom Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Custom Monthly Fee ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input focus:outline-none font-bold text-rose-400"
                />
              </div>
            </div>

            {/* Plan Tier & Payment Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Apple Music Plan Tier</label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input focus:outline-none bg-gray-900"
                >
                  {APPLE_MUSIC_PLANS.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Subscription Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input focus:outline-none bg-gray-900"
                >
                  <option value="Active">Active</option>
                  <option value="Due Soon">Due Soon</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Due Date & Payment Method */}
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
                <label className="text-gray-400 block mb-1 font-semibold">Payment Channel</label>
                <div className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-emerald-400 font-bold flex items-center space-x-2">
                  <Smartphone className="w-4 h-4" />
                  <span>Mobile Money</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-gray-400 block mb-1 font-semibold">Subscriber Notes</label>
              <textarea
                rows={2}
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
            form="edit-customer-form"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Update Subscriber</span>
          </button>
        </div>

      </div>
    </div>
  );
}
