import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import AISearch from './components/AISearch';
import AdminDashboard from './components/AdminDashboard';
import Logo from './components/Logo';
import { PRODUCTS, CATEGORIES } from './constants';
import { Product, CartItem, Category } from './types';
import { 
  ArrowLeft, 
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

  // Price Filter State
  const maxAvailablePrice = Math.max(...PRODUCTS.map(p => p.price));
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(maxAvailablePrice);
  
  // Advanced Filter State
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

    // Sorting logic
    switch (sortBy) {
      case 'popularity':
        result = [...result].sort((a, b) => b.reviews - a.reviews);
        break;
      case 'rating-high':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case 'price-low':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

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
    // Optional: Open cart after adding
    // setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const resetFilters = () => {
    setMinPrice(0);
    setMaxPrice(maxAvailablePrice);
    setMinRating(0);
    setSortBy('default');
    setActiveCategory('الكل');
  };

  if (view === 'admin') {
    return <AdminDashboard onLogout={() => setView('store')} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-['Tajawal']">
      <Navbar 
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} 
        onCartClick={() => setIsCartOpen(true)} 
      />

      <main className="flex-1">
        {/* Admin Switcher FAB */}
        <div className="fixed top-28 right-4 z-[60]">
          <button 
            onClick={() => setView('admin')}
            className="bg-gray-900/90 backdrop-blur text-white p-3 rounded-2xl shadow-xl hover:scale-110 transition-transform flex items-center gap-2 border border-white/10"
            title="لوحة التحكم"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Section */}
        <section className="relative bg-blue-900 text-white py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-15">
            <img 
              src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1920&q=80" 
              alt="Home Background" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2 text-center md:text-right">
              <motion.h2 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl md:text-7xl font-black mb-8 leading-tight"
              >
                اجعلي منزلكِ <br/> 
                <span className="text-blue-400 italic">عصرياً بذكاء</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-blue-100 mb-10 max-w-xl mx-auto md:mr-0 leading-relaxed opacity-90"
              >
                أرقى الأدوات المنزلية وأجهزة المطبخ العالمية المختارة بعناية لتناسب ذوقك الرفيع.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-4 justify-center md:justify-start"
              >
                <button 
                  onClick={() => document.getElementById('products')?.scrollIntoView()}
                  className="bg-white text-blue-900 px-10 py-5 rounded-2xl font-black text-xl hover:bg-blue-50 transition shadow-2xl active:scale-95"
                >
                  ابدئي التسوق
                </button>
              </motion.div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-80 h-80 md:w-[500px] md:h-[500px]">
                <div className="absolute inset-0 bg-blue-500 rounded-[4rem] rotate-6 opacity-20 blur-3xl animate-pulse" />
                <motion.img 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80" 
                  alt="Showcase" 
                  className="relative z-10 w-full h-full object-cover rounded-[3rem] shadow-2xl border-8 border-white/5"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filters Sticky Bar */}
        <section className="bg-white border-b sticky top-[88px] z-40">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-6 flex-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat as Category)}
                  className={`whitespace-nowrap px-8 py-3.5 rounded-2xl font-black transition-all duration-300 ${
                    activeCategory === cat 
                      ? 'bg-blue-600 text-white shadow-lg scale-105' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`mr-6 p-3.5 rounded-2xl border transition-all flex items-center gap-2 font-black ${
                showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">تصفية متقدمة</span>
            </button>
          </div>
          
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-blue-50/30 border-b overflow-hidden"
              >
                <div className="container mx-auto px-4 py-10">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div className="space-y-4">
                      <h4 className="font-black text-gray-900 text-sm flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4 text-blue-600" />
                        نطاق السعر
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-gray-500">
                          <span>{minPrice} ج.م</span>
                          <span>{maxPrice} ج.م</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max={maxAvailablePrice} 
                          value={minPrice} 
                          onChange={(e) => setMinPrice(Number(e.target.value))}
                          className="w-full accent-blue-600"
                        />
                        <input 
                          type="range" 
                          min="0" 
                          max={maxAvailablePrice} 
                          value={maxPrice} 
                          onChange={(e) => setMaxPrice(Number(e.target.value))}
                          className="w-full accent-blue-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-black text-gray-900 text-sm flex items-center gap-2">
                        <Star className="w-4 h-4 text-blue-600" />
                        التقييم (على الأقل)
                      </h4>
                      <div className="flex gap-2">
                        {[0, 3, 4, 4.5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setMinRating(rating)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                              minRating === rating 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white border border-gray-100 text-gray-500'
                            }`}
                          >
                            {rating === 0 ? 'الكل' : `${rating}+ ★`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-black text-gray-900 text-sm flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        ترتيب حسب
                      </h4>
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="default">الافتراضي</option>
                        <option value="popularity">الأكثر شهرة</option>
                        <option value="rating-high">الأعلى تقييماً</option>
                        <option value="price-low">السعر: من الأقل</option>
                        <option value="price-high">السعر: من الأعلى</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button 
                        onClick={resetFilters}
                        className="w-full bg-white border border-gray-200 text-red-500 px-8 py-3 rounded-2xl font-black text-sm hover:bg-red-50 transition"
                      >
                        إعادة الضبط
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Features Row */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-10">
            {[
              { icon: Truck, title: "شحن سريع", desc: "لجميع المحافظات" },
              { icon: ShieldCheck, title: "ضمان حقيقي", desc: "استرجاع خلال 14 يوم" },
              { icon: Package, title: "تغليف آمن", desc: "يصلك المنتج سليماً" },
              { icon: Headphones, title: "دعم فني", desc: "متواجدون دائماً" }
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center p-8 rounded-[2rem] bg-gray-50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-blue-50">
                <f.icon className="w-12 h-12 text-blue-600 mb-6" />
                <h4 className="font-black text-gray-900 text-lg mb-2">{f.title}</h4>
                <p className="text-xs text-gray-400 font-bold">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Products Display */}
        <section id="products" className="py-24 bg-gray-50/50">
          <div className="container mx-auto px-4">
            <div className="mb-16">
              <h2 className="text-4xl font-black text-gray-900 mb-4">اكتشفي تشكيلتنا</h2>
              <div className="h-1.5 w-24 bg-blue-600 rounded-full" />
            </div>

            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map(product => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
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
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-40">
                <Package className="w-20 h-20 text-gray-200 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-gray-400">لا توجد نتائج تطابق بحثك</h3>
                <button onClick={resetFilters} className="mt-4 text-blue-600 font-bold">عرض جميع المنتجات</button>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 pt-24 pb-12 text-white">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-20 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Logo light />
            <p className="text-blue-100/50 mt-8 font-bold leading-relaxed">
              وجهتك الأولى للأدوات المنزلية العصرية في مصر. جودة، أناقة، وسعر مناسب.
            </p>
          </div>
          <div>
            <h4 className="font-black text-xl mb-8">روابط هامة</h4>
            <ul className="space-y-4 text-blue-100/70 font-bold">
              <li><a href="#" className="hover:text-blue-400">سياسة الخصوصية</a></li>
              <li><a href="#" className="hover:text-blue-400">الشروط والأحكام</a></li>
              <li><a href="#" className="hover:text-blue-400">الأسئلة الشائعة</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-xl mb-8">الفئات</h4>
            <ul className="space-y-4 text-blue-100/70 font-bold">
              {CATEGORIES.slice(1).map(c => <li key={c}><a href="#" className="hover:text-blue-400">{c}</a></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-black text-xl mb-8">تواصل معنا</h4>
            <p className="text-blue-100/70 font-bold mb-4">فرع القاهرة: 0123456789</p>
            <p className="text-blue-100/70 font-bold">البريد: support@asmaa.com</p>
          </div>
        </div>
        <div className="container mx-auto px-4 border-t border-white/5 pt-12 text-center text-sm text-gray-500 font-bold">
          © {new Date().getFullYear()} أسماء للأدوات المنزلية. جميع الحقوق محفوظة.
        </div>
      </footer>

      {/* Overlays */}
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
      />

      <AISearch />

      {/* Quick View Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => setSelectedProduct(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
              <div className="md:w-1/2 relative bg-gray-50">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 p-3 bg-white/80 rounded-full md:hidden">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="md:w-1/2 p-10 md:p-16 flex flex-col overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-blue-600/10 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black">
                    {selectedProduct.category}
                  </span>
                  <button onClick={() => setSelectedProduct(null)} className="hidden md:block p-2 hover:bg-gray-100 rounded-full transition">
                    <X className="w-8 h-8 text-gray-400" />
                  </button>
                </div>
                
                <h2 className="text-4xl font-black text-gray-900 mb-6">{selectedProduct.name}</h2>
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.floor(selectedProduct.rating) ? 'fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <span className="text-gray-400 font-bold">({selectedProduct.reviews} مراجعة)</span>
                </div>

                <p className="text-gray-600 leading-relaxed mb-10 text-lg font-bold">
                  {selectedProduct.description}
                </p>

                <div className="mt-auto pt-8 border-t">
                   <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-5xl font-black text-blue-600">
                      {selectedProduct.price.toLocaleString()}
                    </span>
                    <span className="text-gray-400 font-bold text-xl">جنيه</span>
                  </div>

                  <button 
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setSelectedProduct(null);
                      setIsCartOpen(true);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-2xl font-black text-xl transition-all shadow-xl flex items-center justify-center gap-4 active:scale-95"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    أضيفي للسلة
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;