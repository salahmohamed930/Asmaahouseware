
import React, { useState } from 'react';
import { ShoppingCart, Search, User, Menu, ClipboardList, LogOut, ChevronDown, UserCircle } from 'lucide-react';
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
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onCartClick, user, isAdmin, onMyOrders, onHome, onLoginClick }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-[80] font-['Tajawal'] border-b border-gray-100">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo Replacement */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={onHome}>
          <Logo />
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 mx-12">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              placeholder="ابحثي عن الأدوات التي تحتاجينها..."
              className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 bg-gray-50/50 font-bold transition-all"
            />
            <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-3 md:gap-4">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 bg-blue-50/50 hover:bg-blue-50 px-3 md:px-4 py-2.5 rounded-2xl transition border border-blue-100/30"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-200">
                  {user.email?.[0].toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-black text-gray-700">حسابي</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute left-0 mt-3 w-56 bg-white rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-50 py-2 z-[90] animate-in fade-in slide-in-from-top-2">
                  <button 
                    onClick={() => { onMyOrders(); setIsUserMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-blue-50 text-gray-700 transition"
                  >
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-sm">طلباتي السابقة</span>
                  </button>
                  <div className="border-t border-gray-50 my-1" />
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-red-50 text-red-500 transition"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold text-sm">تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 md:px-7 py-3 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
            >
              <UserCircle className="w-5 h-5" />
              <span className="hidden sm:inline">دخول</span>
            </button>
          )}

          <div 
            className="relative cursor-pointer group"
            onClick={onCartClick}
          >
            <div className="p-3 rounded-2xl bg-gray-50 group-hover:bg-blue-50 transition-colors border border-transparent group-hover:border-blue-100">
              <ShoppingCart className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
            </div>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-lg shadow-red-100 animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
