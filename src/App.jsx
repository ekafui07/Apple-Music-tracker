import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardStats from './components/DashboardStats';
import SpendingCharts from './components/SpendingCharts';
import PaymentList from './components/PaymentList';
import PaymentMethods from './components/PaymentMethods';
import CalendarView from './components/CalendarView';
import AddPaymentModal from './components/AddPaymentModal';
import EditCustomerModal from './components/EditCustomerModal';
import SendEmailModal from './components/SendEmailModal';
import ExportModal from './components/ExportModal';
import AuthPage from './components/AuthPage';

import { CURRENCIES } from './data/mockPayments';
import { 
  fetchCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer, 
  markCustomerPaid, 
  sendCustomerEmail 
} from './api/client';

import { CheckCircle2, Music } from 'lucide-react';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('paytrack_auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Subscriber state loaded from API
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState(CURRENCIES[0]); // GHS default (₵)
  
  // Modal Visibility State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomerForEdit, setSelectedCustomerForEdit] = useState(null);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedCustomerForEmail, setSelectedCustomerForEmail] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);

  // Sync Auth User to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('paytrack_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('paytrack_auth_user');
    }
  }, [currentUser]);

  // Load subscribers from REST API backend on login
  const loadCustomersFromAPI = async () => {
    setLoadingCustomers(true);
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('[API Error]', err);
      showToast('Failed to connect to backend database.');
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadCustomersFromAPI();
    }
  }, [currentUser]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleLogin = (userInfo) => {
    setCurrentUser(userInfo);
    showToast(`Welcome back, ${userInfo.name || 'Admin'}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // API Mutation Handlers
  const handleMarkPaid = async (id) => {
    try {
      const updated = await markCustomerPaid(id);
      setCustomers(prev => prev.map(c => c.id === id ? updated : c));
      showToast(`Payment recorded for ${updated.name}! Next renewal: ${updated.dueDate}`);
    } catch (err) {
      showToast(err.message || 'Failed to record payment');
    }
  };

  const handleSendReminder = (customer) => {
    const amountStr = `${currency.symbol}${(customer.amount * currency.rate).toFixed(2)}`;
    const msg = `Hi ${customer.name}! Friendly reminder that your Apple Music ${customer.plan} subscription (${amountStr}) is due on ${customer.dueDate}. Please send payment via Mobile Money to ${customer.phone}. Thank you!`;

    navigator.clipboard.writeText(msg).then(() => {
      showToast(`Copied Mobile Money reminder for ${customer.name} to clipboard!`);
    }).catch(() => {
      showToast(`MoMo reminder message prepared for ${customer.name}`);
    });
  };

  const handleSaveCustomer = async (updatedCustomer) => {
    try {
      const result = await updateCustomer(updatedCustomer.id, updatedCustomer);
      setCustomers(prev => prev.map(c => c.id === result.id ? result : c));
      showToast(`Updated subscriber details in database for ${result.name}`);
    } catch (err) {
      showToast(err.message || 'Failed to update subscriber');
    }
  };

  const handleSendEmail = async (customerId, subject, body) => {
    const target = customers.find(c => c.id === customerId);
    if (!target) return;

    try {
      await sendCustomerEmail(customerId, subject, body);
      await loadCustomersFromAPI(); // Refresh history
      showToast(`Email dispatched to ${target.name}!`);
    } catch (err) {
      showToast(err.message || 'Failed to send email notice');
    }
  };

  const handleOpenEditModal = (customer) => {
    setSelectedCustomerForEdit(customer);
    setIsEditModalOpen(true);
  };

  const handleOpenEmailModal = (customer) => {
    setSelectedCustomerForEmail(customer);
    setIsEmailModalOpen(true);
  };

  const handleDeleteCustomer = async (id) => {
    const target = customers.find(c => c.id === id);
    try {
      await deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      if (target) showToast(`Deleted ${target.name} from database.`);
    } catch (err) {
      showToast(err.message || 'Failed to delete subscriber');
    }
  };

  const handleAddCustomer = async (newCustomerData) => {
    try {
      const created = await createCustomer(newCustomerData);
      setCustomers(prev => [created, ...prev]);
      showToast(`Registered ${created.name} in database for Apple Music ${created.plan}!`);
    } catch (err) {
      showToast(err.message || 'Failed to register subscriber');
    }
  };

  const overdueCount = customers.filter(c => c.status === 'Overdue' || c.status === 'Due Soon').length;

  // Render AuthPage if not logged in
  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="relative min-h-screen bg-[#0b0c10] text-gray-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currency={currency}
        setCurrency={setCurrency}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        overdueCount={overdueCount}
        user={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-8 relative z-10">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-gray-900 border border-rose-500/50 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-3">
            <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}

        {loadingCustomers ? (
          <div className="text-center py-24 space-y-3">
            <Music className="w-10 h-10 text-rose-500 animate-spin mx-auto" />
            <p className="text-xs text-gray-400 font-semibold">Connecting to Amazon DynamoDB Cloud Database...</p>
          </div>
        ) : (
          <>
            {/* Tab 1: Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fade-in">
                <DashboardStats
                  customers={customers}
                  currency={currency}
                  onMarkPaid={handleMarkPaid}
                  onSendReminder={handleSendReminder}
                />

                <SpendingCharts
                  customers={customers}
                  currency={currency}
                />
              </div>
            )}

            {/* Tab 2: Subscribers List */}
            {activeTab === 'subscribers' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-lg font-bold text-white">All Apple Music Subscribers</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Manage database records, record monthly payments, send email notices, or copy WhatsApp reminders</p>
                </div>

                <PaymentList
                  customers={customers}
                  currency={currency}
                  searchQuery={searchQuery}
                  onMarkPaid={handleMarkPaid}
                  onSendReminder={handleSendReminder}
                  onOpenEditModal={handleOpenEditModal}
                  onOpenEmailModal={handleOpenEmailModal}
                  onDeleteCustomer={handleDeleteCustomer}
                />
              </div>
            )}

            {/* Tab 3: Renewal Calendar */}
            {activeTab === 'calendar' && (
              <div className="space-y-6 animate-fade-in">
                <CalendarView
                  customers={customers}
                  currency={currency}
                />
              </div>
            )}

            {/* Tab 4: Revenue & Numbers */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-fade-in">
                <PaymentMethods
                  customers={customers}
                  currency={currency}
                  onMarkPaid={handleMarkPaid}
                />
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#090a0f] border-t border-gray-800/80 py-5 px-4 lg:px-8 mt-12 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Music className="w-4 h-4 text-rose-500" />
            <span className="font-bold text-gray-300">Apple Music PayTrack Manager</span>
          </div>
          <p>© 2026 Apple Music Customer Payment Tracker (Express & Amazon DynamoDB Powered)</p>
        </div>
      </footer>

      {/* Modals */}
      <AddPaymentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCustomer={handleAddCustomer}
      />

      <EditCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCustomerForEdit(null);
        }}
        customer={selectedCustomerForEdit}
        onSaveCustomer={handleSaveCustomer}
      />

      <SendEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setSelectedCustomerForEmail(null);
        }}
        customer={selectedCustomerForEmail}
        onSendEmail={handleSendEmail}
        currency={currency}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        customers={customers}
        currency={currency}
      />

    </div>
  );
}
