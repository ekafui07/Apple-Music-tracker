import React, { useState, useEffect } from 'react';
import { X, Mail, Send, Sparkles, CheckCircle2 } from 'lucide-react';

export default function SendEmailModal({ isOpen, onClose, customer, onSendEmail, currency }) {
  if (!isOpen || !customer) return null;

  const amountStr = `${currency.symbol}${(customer.amount * currency.rate).toFixed(2)}`;

  const [template, setTemplate] = useState('reminder');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Update email content when template or customer changes
  useEffect(() => {
    if (!customer) return;

    if (template === 'reminder') {
      setSubject(`Apple Music Subscription Reminder - Due ${customer.dueDate}`);
      setMessage(`Hi ${customer.name},\n\nThis is a friendly reminder that your Apple Music ${customer.plan} subscription (${amountStr}/mo) is due for renewal on ${customer.dueDate}.\n\nPlease send your payment via Mobile Money to phone: ${customer.phone}.\n\nThank you for choosing Apple Music PayTrack!\nBest regards,\nApple Music Subscription Manager`);
    } else if (template === 'overdue') {
      setSubject(`URGENT: Apple Music Subscription Overdue Notice`);
      setMessage(`Dear ${customer.name},\n\nYour Apple Music ${customer.plan} subscription payment of ${amountStr} was due on ${customer.dueDate} and is currently OVERDUE.\n\nTo keep your music streaming active without interruption, please make your Mobile Money transfer immediately to: ${customer.phone}.\n\nThank you!`);
    } else if (template === 'momo') {
      setSubject(`Mobile Money Payment Transfer Instructions`);
      setMessage(`Hello ${customer.name},\n\nHere are your Mobile Money payment details for your Apple Music ${customer.plan} (${amountStr}/mo):\n\n• Mobile Money Phone: ${customer.phone}\n• Payment Account: Apple Music PayTrack\n• Amount: ${amountStr}\n• Renewal Date: ${customer.dueDate}\n\nOnce transferred, reply to this message or send a confirmation receipt.\n\nThanks!`);
    } else if (template === 'custom') {
      setSubject(`Apple Music Subscription Notice for ${customer.name}`);
      setMessage(`Hi ${customer.name},\n\nType your custom email message here...`);
    }
  }, [template, customer, currency]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject || !message) return;

    onSendEmail(customer.id, subject, message);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#12121a] w-full max-w-lg rounded-2xl border border-gray-800 p-6 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Send Email Notice</h3>
              <p className="text-xs text-gray-400">Recipient: <span className="text-gray-200 font-bold">{customer.name}</span> ({customer.email})</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto space-y-4 my-4 pr-1">
          
          {/* Template Selector */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Email Template
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTemplate('reminder')}
                className={`p-2 rounded-xl border text-left font-medium transition-all ${
                  template === 'reminder' ? 'bg-rose-500/10 border-rose-500/50 text-white' : 'bg-gray-900 border-gray-800 text-gray-400'
                }`}
              >
                Payment Reminder
              </button>

              <button
                type="button"
                onClick={() => setTemplate('overdue')}
                className={`p-2 rounded-xl border text-left font-medium transition-all ${
                  template === 'overdue' ? 'bg-rose-500/10 border-rose-500/50 text-white' : 'bg-gray-900 border-gray-800 text-gray-400'
                }`}
              >
                Overdue Notice
              </button>

              <button
                type="button"
                onClick={() => setTemplate('momo')}
                className={`p-2 rounded-xl border text-left font-medium transition-all ${
                  template === 'momo' ? 'bg-rose-500/10 border-rose-500/50 text-white' : 'bg-gray-900 border-gray-800 text-gray-400'
                }`}
              >
                MoMo Instructions
              </button>

              <button
                type="button"
                onClick={() => setTemplate('custom')}
                className={`p-2 rounded-xl border text-left font-medium transition-all ${
                  template === 'custom' ? 'bg-rose-500/10 border-rose-500/50 text-white' : 'bg-gray-900 border-gray-800 text-gray-400'
                }`}
              >
                Custom Email
              </button>
            </div>
          </div>

          <form id="send-email-form" onSubmit={handleSubmit} className="space-y-3">
            
            {/* Subject Line */}
            <div>
              <label className="text-gray-400 block mb-1 font-semibold">Email Subject *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input focus:outline-none font-bold text-gray-100"
              />
            </div>

            {/* Email Message Body */}
            <div>
              <label className="text-gray-400 block mb-1 font-semibold">Email Body Message *</label>
              <textarea
                rows={6}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input focus:outline-none text-gray-200 leading-relaxed"
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
            form="send-email-form"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all flex items-center space-x-1.5 shadow"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch Email</span>
          </button>
        </div>

      </div>
    </div>
  );
}
