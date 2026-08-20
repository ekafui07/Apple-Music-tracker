import React from 'react';
import { X, Download, FileText, Code } from 'lucide-react';

export default function ExportModal({ isOpen, onClose, customers, currency }) {
  if (!isOpen) return null;

  const exportCSV = () => {
    const headers = ['ID,Name,Phone,Email,Plan,Amount,DueDate,Status,PaymentMethod,Notes'];
    const rows = customers.map(c => 
      `"${c.id}","${c.name}","${c.phone}","${c.email}","${c.plan}",${c.amount},"${c.dueDate}","${c.status}","${c.paymentMethod}","${c.notes || ''}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Apple_Music_Subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(customers, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Apple_Music_Roster_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#12121a] w-full max-w-md rounded-2xl border border-gray-800 p-6 shadow-2xl space-y-4 text-xs">
        
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-white">Export Apple Music Customer Roster</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-400">
          Download customer subscription records and renewal dates for accounting or CRM backups.
        </p>

        <div className="space-y-3 pt-2">
          
          <button
            onClick={exportCSV}
            className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-rose-500/40 flex items-center justify-between text-gray-200 transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-bold">Export Customer CSV</div>
                <div className="text-[10px] text-gray-400">Excel / Google Sheets roster format</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={exportJSON}
            className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-rose-500/40 flex items-center justify-between text-gray-200 transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                <Code className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-bold">Export Raw JSON Data</div>
                <div className="text-[10px] text-gray-400">Full JSON backup file</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-rose-500" />
          </button>

        </div>

        <div className="pt-3 border-t border-gray-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-900 text-gray-300 font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
