
import React from 'react';
import { ShoppingCart, Search, User, Menu } from 'lucide-react';
import Logo from './Logo';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onCartClick }) => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo Replacement */}
        <div className="flex items-center gap-4">
          <Menu className="md:hidden w-6 h-6 cursor-pointer text-gray-600" />
          <Logo />
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 mx-12">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              placeholder="ابحث عن أدوات المطبخ، أجهزة..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
            />
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 cursor-pointer group">
            <div className="p-2 rounded-xl group-hover:bg-blue-50 transition">
              <User className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
            </div>
            <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600">حسابي</span>
          </div>
          <div 
            className="relative cursor-pointer group"
            onClick={onCartClick}
          >
            <div className="p-2 rounded-xl group-hover:bg-blue-50 transition">
              <ShoppingCart className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
            </div>
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
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
