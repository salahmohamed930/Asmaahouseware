
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import AISearch from './components/AISearch';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import { CATEGORIES, PRODUCTS as LOCAL_PRODUCTS } from './constants';
import { Product, CartItem, Category, Order } from './types';
import { supabase } from './lib/supabase';
import { 
  X, ShoppingCart, SlidersHorizontal, Loader2, Settings, Package, Clock, CheckCircle, Truck, AlertCircle
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'store' | 'admin' | 'my-orders'>('store');
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('الكل');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<string>('default');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdmin(session.user);
      else setIsAdmin(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) checkAdmin(user);
  };

  const checkAdmin = (user: any) => {
    // حساب الأدمن المعتمد
    if (user.email === 'admin@asmaa.com') {
      setIsAdmin(true);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('products').select('*');
      if (data && data.length > 0) setProducts(data);
      else setProducts(LOCAL_PRODUCTS);
    } catch {
      setProducts(LOCAL_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setUserOrders(data);
  };

  useEffect(() => {
    if (view === 'my-orders') fetchUserOrders();
  }, [view]);

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

  const statusMap = {
    pending: { label: 'بانتظار المراجعة', color: 'text-orange-600 bg-orange-50', icon: Clock },
    processing: { label: 'قيد التجهيز', color: 'text-blue-600 bg-blue-50', icon: Package },
    shipped: { label: 'تم الشحن', color: 'text-purple-600 bg-purple-50', icon: Truck },
    delivered: { label: 'تم الاستلام', color: 'text-green-600 bg-green-50', icon: CheckCircle },
    cancelled: { label: 'ملغي', color: 'text-red-600 bg-red-50', icon: AlertCircle },
  };

  if (view === 'admin') return <AdminDashboard onLogout={() => { setView('store'); fetchProducts(); }} />;

  return (
    <div className="min-h-screen flex flex-col font-['Tajawal']">
      <Navbar 
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} 
        onCartClick={() => setIsCartOpen(true)} 
        user={user}
        isAdmin={isAdmin}
        onMyOrders={() => setView('my-orders')}
        onHome={() => setView('store')}
        onLoginClick={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1">
        {view === 'store' ? (
          <>
            <section className="bg-blue-900 text-white py-24 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-16 relative z-10">
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="md:w-1/2 text-center md:text-right"
                >
                  <h2 className="text-5xl md:text-8xl font-black mb-8 leading-[1.1]">بيت عصري <br/> بلمسة <span className="text-blue-400">إبداع</span></h2>
                  <p className="text-xl md:text-2xl text-blue-100/80 mb-10 max-w-xl md:ml-0 md:mr-auto">اختاري من بين أرقى أطقم المائدة وأجهزة المطبخ العالمية بأسعار تنافسية وجودة مضمونة.</p>
                  <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white text-blue-900 px-12 py-5 rounded-[2rem] font-black text-xl hover:bg-blue-50 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95">استكشفي الآن</button>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="md:w-1/2 relative"
                >
                  <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                  <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=80" className="rounded-[4rem] shadow-2xl border-[12px] border-white/10 relative z-10 hover:rotate-2 transition-transform duration-700" alt="Home Gadgets" />
                </motion.div>
              </div>
            </section>

            <section className="bg-white border-b sticky top-[88px] z-40 backdrop-blur-md bg-white/90">
              <div className="container mx-auto px-4 flex items-center justify-between py-5">
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat as Category)} className={`px-7 py-3 rounded-2xl font-black whitespace-nowrap transition-all duration-300 text-sm ${activeCategory === cat ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-gray-500 hover:bg-gray-100'}`}>{cat}</button>
                  ))}
                </div>
                <button onClick={() => setShowFilters(!showFilters)} className="p-3.5 bg-gray-50 rounded-2xl text-gray-500 hover:text-blue-600 border border-gray-100"><SlidersHorizontal className="w-6 h-6" /></button>
              </div>
            </section>

            <section id="products" className="py-24 bg-gray-50/30">
              <div className="container mx-auto px-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="animate-spin w-14 h-14 text-blue-600" />
                    <p className="font-black text-gray-400">جاري تحميل المنتجات الرائعة...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {filteredProducts.map(p => (
                      <ProductCard key={p.id} product={p} onAddToCart={(prod) => setSelectedProduct(prod)} onViewDetails={setSelectedProduct} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <section className="py-24 bg-gray-50 min-h-[80vh]">
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="flex items-center gap-6 mb-12">
                <button onClick={() => setView('store')} className="p-3 bg-white rounded-full shadow-lg text-gray-500 hover:text-blue-600 hover:scale-110 transition-all"><X className="w-7 h-7" /></button>
                <h2 className="text-4xl font-black">طلباتي السابقة</h2>
              </div>
              
              <div className="space-y-8">
                {userOrders.length === 0 ? (
                  <div className="bg-white p-24 rounded-[3rem] border border-gray-100 text-center flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                      <Package className="w-10 h-10" />
                    </div>
                    <p className="text-gray-400 font-black text-xl">لم تقومي بأي طلبيات بعد. تسوقي الآن لتظهر طلباتكِ هنا!</p>
                  </div>
                ) : (
                  userOrders.map(order => (
                    <div key={order.id} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                        <div>
                          <p className="text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">رقم الطلب: #{order.id.slice(0,8)}</p>
                          <p className="font-black text-2xl text-blue-600">{order.total_price.toLocaleString()} ج.م</p>
                        </div>
                        <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 text-sm font-black shadow-sm ${statusMap[order.status].color}`}>
                          {React.createElement(statusMap[order.status].icon, { className: 'w-5 h-5' })}
                          {statusMap[order.status].label}
                        </div>
                      </div>
                      <div className="border-t border-gray-50 pt-6 space-y-3">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-base py-1 font-bold text-gray-700">
                            <span>{item.product_name} <span className="text-blue-400 font-medium">x {item.quantity}</span></span>
                            <span>{item.price.toLocaleString()} ج.م</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setSelectedProduct(null)} />
            <motion.div layout initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-5xl rounded-[3.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">
              <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-12">
                <img src={selectedProduct.image} className="max-w-full max-h-[500px] object-contain rounded-3xl shadow-2xl" alt={selectedProduct.name} />
              </div>
              <div className="md:w-1/2 p-12 flex flex-col">
                <button onClick={() => setSelectedProduct(null)} className="self-end p-3 hover:bg-gray-100 rounded-full transition-colors mb-4"><X className="w-8 h-8 text-gray-400" /></button>
                <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-xl text-[10px] font-black w-fit mb-4">{selectedProduct.category}</div>
                <h2 className="text-4xl font-black mb-6 leading-tight">{selectedProduct.name}</h2>
                <p className="text-gray-500 mb-10 leading-relaxed font-bold text-lg">{selectedProduct.description}</p>
                
                {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                  <div className="mb-10">
                    <p className="font-black mb-4 text-sm text-gray-400 uppercase tracking-widest">اختاري اللون المفضل:</p>
                    <div className="flex gap-4">
                      {selectedProduct.colors.map(color => (
                        <button 
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-12 h-12 rounded-full border-[5px] transition-all transform hover:scale-110 ${selectedColor === color ? 'border-blue-600 shadow-2xl scale-110' : 'border-white shadow-md opacity-60 hover:opacity-100'}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto">
                  <div className="flex items-end gap-2 mb-8">
                    <span className="text-5xl font-black text-blue-600">{selectedProduct.price.toLocaleString()}</span>
                    <span className="text-lg font-black text-gray-400 pb-1.5">ج.م</span>
                  </div>
                  <button 
                    disabled={selectedProduct.colors && selectedProduct.colors.length > 0 && !selectedColor}
                    onClick={() => { handleAddToCart(selectedProduct, selectedColor || undefined); setSelectedProduct(null); setSelectedColor(null); setIsCartOpen(true); }}
                    className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 disabled:bg-gray-200 disabled:text-gray-400 transition-all hover:bg-blue-700 shadow-2xl shadow-blue-100 active:scale-95"
                  >
                    <ShoppingCart className="w-7 h-7" /> أضيفي للسلة الآن
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Cart 
        isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        onUpdateQuantity={(id, delta) => setCartItems(items => items.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + delta)} : i))}
        onRemove={(id) => setCartItems(items => items.filter(i => i.id !== id))}
        onClear={() => setCartItems([])}
        onOpenLogin={() => { setIsCartOpen(false); setIsAuthModalOpen(true); }}
      />
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      <AISearch />

      {/* Admin Quick Entry */}
      {isAdmin && (
        <button onClick={() => setView('admin')} className="fixed top-28 right-8 p-5 bg-gray-900 text-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[70] hover:scale-110 transition-all flex items-center gap-3 border-2 border-blue-500/50 group">
          <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
          <span className="font-black text-sm">لوحة الإدارة</span>
        </button>
      )}
    </div>
  );
};

export default App;
