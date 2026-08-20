import React, { useState } from 'react';
import { 
  Music, 
  UserPlus, 
  Search, 
  Calendar, 
  LayoutDashboard, 
  Users, 
  BarChart2, 
  Download, 
  Globe,
  LogOut,
  X,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { CURRENCIES } from '../data/mockPayments';

export default function Navbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  currency,
  setCurrency,
  onOpenAddModal,
  onOpenExportModal,
  overdueCount,
  user,
  onLogout
}) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#0d0d12]/95 backdrop-blur-md border-b border-gray-800/80 px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto space-y-2 md:space-y-0">
        
        {/* Main Header Bar */}
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer shrink-0" 
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-sm">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  PayTrack<span className="text-rose-500 font-semibold">.</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-bold rounded bg-gray-800 text-gray-300 border border-gray-700 uppercase">
                  Manager
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium hidden lg:block">
                Apple Music Subscriber & MoMo Manager
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Hidden on Mobile Header) */}
          <nav className="hidden md:flex items-center space-x-1 bg-gray-900/90 p-1 rounded-xl border border-gray-800 text-xs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('subscribers')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all relative ${
                activeTab === 'subscribers'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Subscribers</span>
              {overdueCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'calendar'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Revenue</span>
            </button>
          </nav>

          {/* Right Action Controls (Desktop) */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="relative w-40 lg:w-48">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl glass-input focus:outline-none placeholder-gray-500"
              />
            </div>

            <div className="flex items-center space-x-1 px-2 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-300">
              <Globe className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={currency.code}
                onChange={(e) => {
                  const sel = CURRENCIES.find(c => c.code === e.target.value);
                  if (sel) setCurrency(sel);
                }}
                className="bg-transparent focus:outline-none text-xs text-gray-200 font-semibold cursor-pointer"
              >
                {CURRENCIES.map(curr => (
                  <option key={curr.code} value={curr.code} className="bg-gray-900 text-gray-200">
                    {curr.code}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onOpenExportModal}
              title="Export Roster"
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition-all active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Right Quick Controls */}
          <div className="flex md:hidden items-center space-x-1.5">
            {/* Search Toggle */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                showMobileSearch 
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
                  : 'bg-gray-900 border-gray-800 text-gray-300'
              }`}
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Quick Add Subscriber */}
            <button
              onClick={onOpenAddModal}
              className="p-2 rounded-xl bg-rose-600 text-white font-bold shadow active:scale-95"
              title="Add Subscriber"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Mobile Settings Drawer Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                showMobileMenu 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-gray-900 border-gray-800 text-gray-400'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Mobile Search Bar Collapsible Slide */}
        {showMobileSearch && (
          <div className="md:hidden pt-2 pb-1 animate-fade-in">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Search subscriber name, email or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Settings Menu Drawer */}
        {showMobileMenu && (
          <div className="md:hidden p-3 rounded-2xl bg-gray-900 border border-gray-800 space-y-3 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <span className="font-bold text-gray-300">Quick Settings</span>
              <button onClick={() => setShowMobileMenu(false)} className="text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Display Currency:</span>
              <select
                value={currency.code}
                onChange={(e) => {
                  const sel = CURRENCIES.find(c => c.code === e.target.value);
                  if (sel) setCurrency(sel);
                }}
                className="bg-gray-800 border border-gray-700 text-gray-200 px-2 py-1 rounded-lg focus:outline-none font-bold"
              >
                {CURRENCIES.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => {
                  onOpenExportModal();
                  setShowMobileMenu(false);
                }}
                className="flex items-center space-x-1.5 text-gray-300 font-semibold hover:text-white"
              >
                <Download className="w-3.5 h-3.5 text-rose-500" />
                <span>Export Roster Data</span>
              </button>

              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center space-x-1 text-rose-400 font-bold hover:text-rose-300"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Clean Mobile Bottom Navigation Bar (Row 2 on Mobile) */}
        <div className="md:hidden pt-1">
          <nav className="flex items-center justify-around bg-gray-900/90 p-1 rounded-xl border border-gray-800 text-[11px]">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all text-center flex items-center justify-center space-x-1 ${
                activeTab === 'dashboard'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-400'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dash</span>
            </button>

            <button
              onClick={() => setActiveTab('subscribers')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all text-center flex items-center justify-center space-x-1 relative ${
                activeTab === 'subscribers'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-400'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Subscribers</span>
              {overdueCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1 right-2" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all text-center flex items-center justify-center space-x-1 ${
                activeTab === 'calendar'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-400'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all text-center flex items-center justify-center space-x-1 ${
                activeTab === 'analytics'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-400'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Revenue</span>
            </button>
          </nav>
        </div>

      </div>
    </header>
  );
}
