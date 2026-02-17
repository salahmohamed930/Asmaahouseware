
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import AISearch from './components/AISearch';
import AdminDashboard from './components/AdminDashboard';
import { PRODUCTS, CATEGORIES } from './constants';
import { Product, CartItem, Category } from './types';
import { 
  Package, 
  ShieldCheck, 
  Truck, 
  Headphones, 
  Settings, 
  X, 
  Star, 
  ShoppingCart, 
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'store' | 'admin'>('store');
  const [activeCategory, setActiveCategory] = useState<Category>('الكل');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter States
  const maxAvailablePrice = Math.max(...PRODUCTS.map(p => p.price));
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(maxAvailablePrice);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('default');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = PRODUCTS.filter(p => {
      const categoryMatch = activeCategory === 'الكل' || p.category === activeCategory;
      const priceMatch = p.price >= minPrice && p.price <= maxPrice;
      const ratingMatch = p.rating >= minRating;
      return categoryMatch && priceMatch && ratingMatch;
    });

    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating-high') result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [activeCategory, minPrice, maxPrice, minRating, sortBy]);

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  if (view === 'admin') return <AdminDashboard onLogout={() => setView('store')} />;

  return (
    <div className="min-h-screen flex flex-col font-['Tajawal']">
      <Navbar 
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} 
        onCartClick={() => setIsCartOpen(true)} 
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-blue-900 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img src="https://picsum.photos/seed/kitchen/1920/1080" className="w-full h-full object-cover" alt="" />
          </div>
          <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 text-center md:text-right">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-black mb-6 leading-tight"
              >
                اجعلي منزلكِ <br/> 
                <span className="text-blue-400">عصرياً بذكاء</span>
              </motion.h2>
              <p className="text-xl text-blue-100 mb-8 opacity-90">أرقى الأدوات المنزلية وأجهزة المطبخ العالمية بين يديكِ.</p>
              <button 
                onClick={() => document.getElementById('products')?.scrollIntoView()}
                className="bg-white text-blue-900 px-10 py-4 rounded-2xl font-black text-xl hover:bg-blue-50 transition active:scale-95"
              >
                تسوقي الآن
              </button>
            </div>
            <div className="md:w-1/2">
              <motion.img 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src="https://picsum.photos/seed/appliance/800/800" 
                className="rounded-[3rem] shadow-2xl border-8 border-white/5"
                alt="Showcase"
              />
            </div>
          </div>
        </section>

        {/* Categories & Filters */}
        <section className="bg-white border-b sticky top-[88px] z-40">
          <div className="container mx-auto px-4 flex items-center justify-between py-4">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar flex-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat as Category)}
                  className={`whitespace-nowrap px-6 py-3 rounded-xl font-bold transition ${
                    activeCategory === cat ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="mr-4 p-3 bg-gray-50 rounded-xl text-gray-500 hover:text-blue-600"
            >
              <SlidersHorizontal className="w-6 h-6" />
            </button>
          </div>
          
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="bg-gray-50 overflow-hidden"
              >
                <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="font-black text-sm flex items-center gap-2">
                      <ArrowUpDown className="w-4 h-4" /> نطاق السعر ({maxPrice} ج.م)
                    </label>
                    <input 
                      type="range" min="0" max={maxAvailablePrice} value={maxPrice} 
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="font-black text-sm">الترتيب حسب</label>
                    <select 
                      value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-white border rounded-xl px-4 py-2 font-bold outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="default">الافتراضي</option>
                      <option value="price-low">السعر: من الأقل</option>
                      <option value="price-high">السعر: من الأعلى</option>
                      <option value="rating-high">الأعلى تقييماً</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={() => { setMaxPrice(maxAvailablePrice); setSortBy('default'); setActiveCategory('الكل'); }}
                      className="text-red-500 font-bold hover:underline"
                    >
                      إعادة ضبط الفلاتر
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Features */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: "شحن سريع" },
              { icon: ShieldCheck, title: "ضمان حقيقي" },
              { icon: Package, title: "تغليف آمن" },
              { icon: Headphones, title: "دعم 24/7" }
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center p-6 bg-gray-50 rounded-3xl">
                <f.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h4 className="font-black text-gray-900">{f.title}</h4>
              </div>
            ))}
          </div>
        </section>

        {/* Products Grid */}
        <section id="products" className="py-20 bg-gray-50/50">
          <div className="container mx-auto px-4">
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map(product => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <ProductCard 
                      product={product} 
                      onAddToCart={handleAddToCart}
                      onViewDetails={setSelectedProduct}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Quick View Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setSelectedProduct(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <div className="md:w-1/2 bg-gray-100">
                <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
              </div>
              <div className="md:w-1/2 p-10 flex flex-col">
                <button onClick={() => setSelectedProduct(null)} className="self-end p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-8 h-8 text-gray-400" />
                </button>
                <h2 className="text-4xl font-black text-gray-900 mb-4">{selectedProduct.name}</h2>
                <div className="flex items-center gap-2 mb-6">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-bold">{selectedProduct.rating} ({selectedProduct.reviews} تقييم)</span>
                </div>
                <p className="text-gray-600 mb-10 text-lg leading-relaxed">{selectedProduct.description}</p>
                <div className="mt-auto">
                  <div className="text-4xl font-black text-blue-600 mb-8">{selectedProduct.price.toLocaleString()} ج.م</div>
                  <button 
                    onClick={() => { handleAddToCart(selectedProduct); setSelectedProduct(null); setIsCartOpen(true); }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition active:scale-95"
                  >
                    <ShoppingCart className="w-6 h-6" /> أضيفي للسلة
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Cart 
        isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems}
        onUpdateQuantity={handleUpdateQuantity} onRemove={handleRemoveFromCart}
      />
      <AISearch />

      {/* Admin FAB */}
      <button onClick={() => setView('admin')} className="fixed top-24 right-6 p-4 bg-gray-900 text-white rounded-2xl shadow-xl hover:scale-110 transition z-50">
        <Settings className="w-6 h-6" />
      </button>
    </div>
  );
};

export default App;
