
import React from 'react';
import { Star, ShoppingCart, Eye, Heart, Banknote } from 'lucide-react';
import { Product, UserProfile } from '../types';

interface ProductCardProps {
  product: Product;
  userProfile?: UserProfile | null;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, userProfile, onAddToCart, onViewDetails }) => {
  const isWholesale = userProfile?.is_wholesale || false;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100/50 overflow-hidden hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)] hover:-translate-y-2 transition-all duration-500 group relative">
      <button className="absolute top-5 left-5 z-20 bg-white/80 backdrop-blur-md p-2.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100">
        <Heart className="w-5 h-5" />
      </button>

      <div className="relative h-72 overflow-hidden cursor-pointer bg-gray-50 flex items-center justify-center" onClick={() => onViewDetails(product)}>
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute top-5 right-5 bg-white/60 backdrop-blur-xl border border-white/40 px-4 py-1.5 rounded-2xl text-[11px] font-black text-blue-700">
          {product.category}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-black text-lg text-gray-900 line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        <div className="space-y-3 pt-4 border-t border-gray-50">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-black mb-1">السعر {isWholesale && 'العادي'}</span>
              <div className="flex items-center gap-1">
                <span className={`font-black text-blue-600 ${isWholesale ? 'text-lg line-through opacity-50' : 'text-2xl'}`}>
                  {product.price.toLocaleString()}
                </span>
                <span className="text-[10px] font-black text-gray-400">ج.م</span>
              </div>
            </div>

            {isWholesale && product.wholesale_price && (
              <div className="bg-purple-50 p-2 px-3 rounded-2xl border border-purple-100">
                <span className="text-[9px] text-purple-600 font-black block mb-1 flex items-center gap-1"><Banknote className="w-3 h-3"/> سعر الجملة</span>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-black text-purple-700">
                    {product.wholesale_price.toLocaleString()}
                  </span>
                  <span className="text-[9px] font-black text-purple-400">ج.م</span>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 font-black text-sm shadow-lg shadow-blue-50"
          >
            <ShoppingCart className="w-5 h-5" />
            أضيفي للسلة
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
