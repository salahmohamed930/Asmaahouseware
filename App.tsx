
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import AISearch from './components/AISearch';
import AdminDashboard from './components/AdminDashboard';
import { CATEGORIES, PRODUCTS as LOCAL_PRODUCTS } from './constants';
import { Product, CartItem, Category } from './types';
import { supabase } from './lib/supabase';
import { 
  X, ShoppingCart, SlidersHorizontal, ArrowUpDown, Loader2, AlertCircle, Settings, ChevronRight
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'store' | 'admin'>('store');
  const [session, setSession] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('الكل');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<string>('default');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      if (data && data.length > 0) setProducts(data);
      else setProducts(LOCAL_PRODUCTS);
    } catch (error: any) {
      setProducts(LOCAL_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const catMatch = activeCategory === 'الكل' || p.category === activeCategory;
      const priceMatch = p.price <= maxPrice;
      return catMatch && priceMatch;
    });
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    return result;
  }, [products, activeCategory, maxPrice, sortBy]);

  const handleAddToCart = (product: Product, color?: string) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedColor === color);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.selectedColor === color) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedColor: color }];
    });
  };

  if (view === 'admin') return <AdminDashboard onLogout={() => { setView('store'); fetchProducts(); }} />;

  return (
    <div className="min-h-screen flex flex-col font-['Tajawal']">
      <Navbar cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} onCartClick={() => setIsCartOpen(true)} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-blue-900 text-white py-20 relative overflow-hidden">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="md:w-1/2 text-center md:text-right">
              <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight">بيت عصري <br/> بلمسة <span className="text-blue-400">أسماء</span></h2>
              <p className="text-xl text-blue-100 mb-8">تسوقي أفخم الأدوات المنزلية بكل سهولة واطلبيها عبر واتساب فوراً.</p>
              <button onClick={() => document.getElementById('products')?.scrollIntoView()} className="bg-white text-blue-900 px-10 py-4 rounded-2xl font-black text-xl hover:bg-blue-50 transition">تسوقي الآن</button>
            </div>
            <div className="md:w-1/2"><img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80" className="rounded-[3rem] shadow-2xl border-8 border-white/5" alt="" /></div>
          </div>
        </section>

        {/* Filters */}
        <section className="bg-white border-b sticky top-[88px] z-40">
          <div className="container mx-auto px-4 flex items-center justify-between py-4">
            <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat as Category)} className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap ${activeCategory === cat ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>{cat}</button>
              ))}
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="p-3 bg-gray-50 rounded-xl text-gray-500 hover:text-blue-600"><SlidersHorizontal className="w-6 h-6" /></button>
          </div>
        </section>

        {/* Grid */}
        <section id="products" className="py-20 bg-gray-50/50">
          <div className="container mx-auto px-4">
            {isLoading ? (
               <div className="flex flex-col items-center justify-center py-40"><Loader2 className="animate-spin w-12 h-12 text-blue-600" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map(p => (
                  <ProductCard key={p.id} product={p} onAddToCart={(prod) => setSelectedProduct(prod)} onViewDetails={setSelectedProduct} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Product Quick Details & Color Selection */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setSelectedProduct(null)} />
            <motion.div layout initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/2 bg-gray-100"><img src={selectedProduct.image} className="w-full h-full object-cover" alt="" /></div>
              <div className="md:w-1/2 p-10 flex flex-col">
                <button onClick={() => setSelectedProduct(null)} className="self-end p-2"><X className="w-8 h-8 text-gray-400" /></button>
                <h2 className="text-3xl font-black mb-4">{selectedProduct.name}</h2>
                <p className="text-gray-600 mb-6">{selectedProduct.description}</p>
                
                {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                  <div className="mb-8">
                    <p className="font-bold mb-3 text-sm">اختاري اللون:</p>
                    <div className="flex gap-3">
                      {selectedProduct.colors.map(color => (
                        <button 
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-10 h-10 rounded-full border-4 transition ${selectedColor === color ? 'border-blue-600 scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto">
                  <div className="text-4xl font-black text-blue-600 mb-6">{selectedProduct.price.toLocaleString()} ج.م</div>
                  <button 
                    disabled={selectedProduct.colors && selectedProduct.colors.length > 0 && !selectedColor}
                    onClick={() => { handleAddToCart(selectedProduct, selectedColor || undefined); setSelectedProduct(null); setSelectedColor(null); setIsCartOpen(true); }}
                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 disabled:bg-gray-300"
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
        isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} 
        items={cartItems} onUpdateQuantity={(id, delta) => setCartItems(items => items.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + delta)} : i))}
        onRemove={(id) => setCartItems(items => items.filter(i => i.id !== id))}
      />
      
      <AISearch />

      {/* Admin Button - Only visible if logged in */}
      {session && (
        <button onClick={() => setView('admin')} className="fixed top-24 right-6 p-4 bg-gray-900 text-white rounded-2xl shadow-xl z-50 hover:scale-110 transition flex items-center gap-2">
          <Settings className="w-6 h-6" />
          <span className="font-bold">لوحة التحكم</span>
        </button>
      )}

      {/* Hidden button to login if you know the route (for demo) */}
      {!session && (
        <button 
          onDoubleClick={() => setView('admin')} 
          className="fixed bottom-4 left-4 w-8 h-8 opacity-0 hover:opacity-10 cursor-default"
          title="Admin Area"
        />
      )}
    </div>
  );
};

export default App;
