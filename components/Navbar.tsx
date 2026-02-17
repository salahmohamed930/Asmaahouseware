
import React, { useState } from 'react';
import { ShoppingCart, Search, User, Menu, ClipboardList, LogOut, ChevronDown, UserCircle, Home } from 'lucide-react';
import Logo from './Logo';
import { supabase } from '../lib/supabase';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  user?: any;
  isAdmin?: boolean;
  onMyOrders: () => void;
  onHome: () => void;
  onLoginClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  cartCount, onCartClick, user, isAdmin, onMyOrders, onHome, onLoginClick, searchQuery, onSearchChange 
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-[100] font-['Tajawal'] border-b border-gray-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-4 cursor-pointer flex-shrink-0" onClick={onHome}>
          <Logo className="h-9 md:h-11" />
        </div>

        {/* Search Bar - Connected */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحثي عن أدوات المطبخ، الأجهزة..."
              className="w-full pl-4 pr-11 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 font-bold transition-all text-sm"
            />
            <Search className="absolute right-4 top-3.5 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <button onClick={onHome} className="md:hidden p-2 text-gray-500 hover:text-blue-600"><Home className="w-6 h-6" /></button>
          
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 bg-blue-50/50 hover:bg-blue-50 px-3 py-2 rounded-xl transition border border-blue-100/30"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-md">
                  {user.email?.[0].toUpperCase()}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute left-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-50 py-2 z-[110] animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-[10px] text-gray-400 font-black mb-1">مسجل كـ</p>
                    <p className="text-xs font-black text-blue-600 truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => { onMyOrders(); setIsUserMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-gray-50 text-gray-700 transition"
                  >
                    <ClipboardList className="w-5 h-5 text-gray-400" />
                    <span className="font-bold text-sm">طلباتي السابقة</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-red-50 text-red-500 transition"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold text-sm">خروج</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
            >
              <UserCircle className="w-5 h-5 inline-block ml-1" />
              <span className="hidden sm:inline">دخول</span>
            </button>
          )}

          <button 
            className="relative p-3 rounded-2xl bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
            onClick={onCartClick}
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-md">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
