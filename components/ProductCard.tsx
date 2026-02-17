
import React from 'react';
import { Star, ShoppingCart, Eye, Heart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetails }) => {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100/50 overflow-hidden hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)] hover:-translate-y-2 transition-all duration-500 group relative">
      {/* Wishlist Button */}
      <button className="absolute top-5 left-5 z-20 bg-white/80 backdrop-blur-md p-2.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
        <Heart className="w-5 h-5" />
      </button>

      {/* Image Section */}
      <div 
        className="relative h-80 overflow-hidden cursor-pointer bg-gray-50 flex items-center justify-center" 
        onClick={() => onViewDetails(product)}
      >
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        
        {/* Category Badge */}
        <div className="absolute top-5 right-5 bg-white/60 backdrop-blur-xl border border-white/40 px-4 py-1.5 rounded-2xl text-[11px] font-black text-blue-700 shadow-sm z-10">
          {product.category}
        </div>

        {/* Quick View Button Overlay */}
        <div className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
           <button 
             type="button"
             onClick={(e) => {
               e.stopPropagation();
               onViewDetails(product);
             }}
             className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-sm shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 flex items-center gap-2 hover:bg-blue-600 hover:text-white"
           >
             <Eye className="w-4 h-4" />
             نظرة سريعة
           </button>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-8">
        <div className="mb-4">
          <h3 className="font-black text-xl text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors mb-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center text-yellow-400 bg-yellow-50 px-2 py-0.5 rounded-lg">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-black mr-1">{product.rating}</span>
            </div>
            <span className="text-xs text-gray-400 font-bold tracking-tight">({product.reviews} تقييم)</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-sm text-gray-400 font-bold mb-0.5">السعر</span>
            <div className="flex items-end gap-1.5">
              <span className="text-3xl font-black text-blue-600 leading-none">
                {product.price.toLocaleString()}
              </span>
              <span className="text-xs font-black text-gray-400 pb-0.5">ج.م</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl transition-all duration-300 shadow-xl shadow-blue-100 hover:shadow-blue-200 active:scale-95"
              title="أضيفي للسلة"
            >
              <ShoppingCart className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
