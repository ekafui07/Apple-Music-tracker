import React, { useState, useEffect } from 'react';
import { Mail, Send, X, Clock, CheckCircle2, AlertTriangle, Smartphone } from 'lucide-react';

export default function SendEmailModal({
  isOpen,
  onClose,
  customer,
  onSendEmail,
  currency
}) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [template, setTemplate] = useState('reminder');
  const [scheduleOption, setScheduleOption] = useState('now'); // 'now' | 'auto'
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (customer) {
      const amountStr = `${currency.symbol}${(customer.amount * currency.rate).toFixed(2)}`;
      
      if (template === 'reminder') {
        setSubject(`🎵 Apple Music Subscription Due Reminder - ${customer.name}`);
        setMessage(
          `Hi ${customer.name},\n\n` +
          `This is a friendly reminder that your Apple Music ${customer.plan} subscription (${amountStr}/mo) is due for renewal on ${customer.dueDate}.\n\n` +
          `Please send your Mobile Money payment to ${customer.phone} to ensure uninterrupted music streaming.\n\n` +
          `Thank you for tracking your membership with us!\n` +
          `Apple Music PayTrack Management`
        );
      } else if (template === 'overdue') {
        setSubject(`⚠️ URGENT: Apple Music Subscription Payment Overdue`);
        setMessage(
          `Dear ${customer.name},\n\n` +
          `Your Apple Music ${customer.plan} subscription fee of ${amountStr} was due on ${customer.dueDate} and is currently OVERDUE.\n\n` +
          `Please make your Mobile Money payment to ${customer.phone} immediately to avoid service interruption.\n\n` +
          `Regards,\n` +
          `Apple Music PayTrack Management`
        );
      } else if (template === 'momo') {
        setSubject(`📱 Mobile Money Payment Instructions - Apple Music`);
        setMessage(
          `Hi ${customer.name},\n\n` +
          `Here are your Mobile Money payment instructions for your Apple Music ${customer.plan}:\n\n` +
          `• Set Monthly Amount: ${amountStr}\n` +
          `• Due Date: ${customer.dueDate}\n` +
          `• MoMo Recipient Number: ${customer.phone}\n\n` +
          `After sending payment, reply to this email or send us a WhatsApp message to confirm receipt.\n\n` +
          `Thank you!`
        );
      } else {
        setSubject(`Apple Music Subscription Notice - ${customer.name}`);
        setMessage('');
      }
    }
  }, [customer, template, currency]);

  if (!isOpen || !customer) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await onSendEmail(customer.id, subject, message);
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-[#12121a] w-full max-w-lg rounded-2xl border border-gray-800 p-6 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">Send Email Notice</h3>
              <p className="text-[11px] text-gray-400">Recipient: <span className="text-gray-200 font-semibold">{customer.email || customer.name}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Preset Templates */}
          <div>
            <label className="text-gray-400 block mb-1.5 font-semibold">Select Email Template</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTemplate('reminder')}
                className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                  template === 'reminder' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                <span className="font-bold">Due Reminder</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplate('overdue')}
                className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                  template === 'overdue' ? 'bg-rose-600/20 border-rose-500 text-rose-300' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-bold">Overdue Notice</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplate('momo')}
                className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                  template === 'momo' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <Smartphone className="w-4 h-4 shrink-0" />
                <span className="font-bold">MoMo Details</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplate('custom')}
                className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                  template === 'custom' ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span className="font-bold">Custom Email</span>
              </button>
            </div>
          </div>

          {/* Schedule Dispatch Option */}
          <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
            <label className="text-gray-300 font-semibold block">Dispatch Settings</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer text-gray-300">
                <input
                  type="radio"
                  name="schedule"
                  checked={scheduleOption === 'now'}
                  onChange={() => setScheduleOption('now')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span>Dispatch Email Immediately</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-gray-300">
                <input
                  type="radio"
                  name="schedule"
                  checked={scheduleOption === 'auto'}
                  onChange={() => setScheduleOption('auto')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span className="flex items-center space-x-1">
                  <span>Automated Cron (3D & Overdue)</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">AWS Active</span>
                </span>
              </label>
            </div>
          </div>

          {/* Subject Input */}
          <div>
            <label className="text-gray-400 block mb-1 font-semibold">Subject Line</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input focus:outline-none font-medium"
            />
          </div>

          {/* Message Body Input */}
          <div>
            <label className="text-gray-400 block mb-1 font-semibold">Email Message Body</label>
            <textarea
              rows={6}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input focus:outline-none font-medium leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-900 text-gray-300 font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Dispatching...' : 'Dispatch Email'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
