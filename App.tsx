
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import AISearch from './components/AISearch';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import { CATEGORIES, PRODUCTS as LOCAL_PRODUCTS } from './constants';
import { Product, CartItem, Category, Order, SiteSettings } from './types';
import { supabase } from './lib/supabase';
import { 
  X, ShoppingCart, Loader2, Settings, Package, Clock, CheckCircle, Truck, AlertCircle, ChevronRight, ChevronLeft, Inbox
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'store' | 'admin' | 'my-orders'>('store');
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  
  const [heroContent, setHeroContent] = useState<SiteSettings>({
    hero_title: 'بيت عصري بلمسة إبداع',
    hero_subtitle: 'اختاري من بين أرقى أطقم المائدة وأجهزة المطبخ العالمية بأسعار تنافسية وجودة مضمونة.',
    hero_image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=80'
  });

  useEffect(() => {
    fetchProducts();
    fetchHeroSettings();
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        checkAdmin(session.user);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchHeroSettings = async () => {
    try {
      const { data } = await supabase.from('site_settings').select('*').single();
      if (data) setHeroContent(data);
    } catch (e) {
      console.log('Using default hero settings');
    }
  };

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      checkAdmin(user);
    }
  };

  const checkAdmin = (user: any) => {
    if (user.email === 'admin@asmaa.com') setIsAdmin(true);
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data: dbProducts } = await supabase.from('products').select('*');
      
      // نعتمد استراتيجية: المنتجات من الداتابيز أولاً، وإذا كان الاسم مكرر مع المنتجات المحلية نأخذ نسخة الداتابيز
      const dbItems = dbProducts || [];
      const merged = [...dbItems];
      
      LOCAL_PRODUCTS.forEach(lp => {
        if (!merged.find(p => p.name === lp.name)) {
          merged.push(lp);
        }
      });

      setProducts(merged);
    } catch (err) {
      setProducts(LOCAL_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    if (!user) return;
    setIsOrdersLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) setUserOrders(data);
    setIsOrdersLoading(false);
  };

  useEffect(() => {
    if (view === 'my-orders') fetchUserOrders();
  }, [view, user]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const categoryMatch = activeCategory === 'الكل' || p.category === activeCategory;
      const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const visibilityMatch = p.is_visible !== false; 
      return categoryMatch && searchMatch && visibilityMatch;
    });
  }, [products, activeCategory, searchQuery]);

  const handleAddToCart = (product: Product, color?: string) => {
    setCartItems(prev => {
      const existing = prev.find(item => String(item.id) === String(product.id) && item.selectedColor === color);
      if (existing) {
        return prev.map(item => 
          (String(item.id) === String(product.id) && item.selectedColor === color) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedColor: color }];
    });
  };

  const statusMap = {
    pending: { label: 'جديد', color: 'text-orange-600 bg-orange-50', icon: Clock },
    processing: { label: 'قيد التجهيز', color: 'text-blue-600 bg-blue-50', icon: Package },
    shipped: { label: 'تم الشحن', color: 'text-purple-600 bg-purple-50', icon: Truck },
    delivered: { label: 'تم الاستلام', color: 'text-green-600 bg-green-50', icon: CheckCircle },
    cancelled: { label: 'ملغي', color: 'text-red-600 bg-red-50', icon: AlertCircle },
  };

  if (view === 'admin') return <AdminDashboard onLogout={() => { setView('store'); fetchProducts(); fetchHeroSettings(); }} />;

  return (
    <div className="min-h-screen flex flex-col font-['Tajawal'] text-right" dir="rtl">
      <Navbar 
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} 
        onCartClick={() => setIsCartOpen(true)} 
        user={user}
        isAdmin={isAdmin}
        onMyOrders={() => setView('my-orders')}
        onHome={() => { setView('store'); fetchProducts(); }}
        onLoginClick={() => setIsAuthModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1">
        {view === 'store' ? (
          <>
            <section className="bg-blue-900 text-white py-20 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12 relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:w-1/2 text-right">
                  <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight" dangerouslySetInnerHTML={{ __html: heroContent.hero_title.replace(/\n/g, '<br/>') }}></h2>
                  <p className="text-lg md:text-xl text-blue-100/80 mb-8 max-w-xl">{heroContent.hero_subtitle}</p>
                  <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white text-blue-900 px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all shadow-xl">تسوقي الآن</button>
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="md:w-1/2">
                  <img src={heroContent.hero_image} className="rounded-[3rem] shadow-2xl border-8 border-white/10 aspect-video object-cover" alt="Home Decor" />
                </motion.div>
              </div>
            </section>

            <section id="products" className="py-20 bg-gray-50/50">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                  <h3 className="text-2xl font-black text-gray-900">أقسام المتجر</h3>
                  <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setActiveCategory(cat as any)}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-gray-500 hover:bg-gray-100 border'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-32 gap-4"><Loader2 className="animate-spin w-10 h-10 text-blue-600" /><p className="font-bold text-gray-400">تحميل المنتجات...</p></div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredProducts.map(p => (
                      <ProductCard key={p.id} product={p} onAddToCart={(prod) => {
                        if (prod.colors && prod.colors.length > 0) { setSelectedProduct(prod); setSelectedColor(null); }
                        else { handleAddToCart(prod); setIsCartOpen(true); }
                      }} onViewDetails={(prod) => { setSelectedProduct(prod); setSelectedColor(null); }} />
                    ))}
                    {filteredProducts.length === 0 && (
                      <div className="col-span-full py-20 text-center">
                        <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold">لا توجد منتجات تطابق بحثكِ حالياً</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <section className="py-20 bg-gray-50 min-h-[80vh]">
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black text-gray-900">قائمة طلباتي</h2>
                <button onClick={() => setView('store')} className="text-blue-600 font-bold text-sm">العودة للتسوق</button>
              </div>

              {isOrdersLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>
              ) : userOrders.length === 0 ? (
                <div className="bg-white p-20 rounded-[2.5rem] border text-center flex flex-col items-center gap-4">
                  <Package className="w-12 h-12 text-gray-200" />
                  <p className="text-gray-400 font-bold">لا توجد طلبات سابقة لهذا الحساب</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {userOrders.map(order => (
                    <div key={order.id} className="bg-white p-8 rounded-[2rem] border shadow-sm">
                      <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-50">
                        <div>
                          <p className="text-xs font-black text-gray-400 mb-1">رقم الطلب: #{order.id.slice(0,8)}</p>
                          <p className="text-sm font-bold text-gray-500">التاريخ: {new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-2 ${statusMap[order.status as keyof typeof statusMap]?.color || 'bg-gray-100'}`}>
                          {statusMap[order.status as keyof typeof statusMap]?.label || order.status}
                        </div>
                      </div>
                      <div className="space-y-3">
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm font-bold text-gray-600">
                            <span>{item.product_name} × {item.quantity} {item.selected_color && <span className="text-[10px] text-gray-400">(لون: {item.selected_color})</span>}</span>
                            <span>{item.price.toLocaleString()} ج.م</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                        <span className="font-black text-gray-900">الإجمالي الشامل:</span>
                        <span className="text-xl font-black text-blue-600">{order.total_price.toLocaleString()} ج.م</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <Cart 
        isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        onUpdateQuantity={(id, color, delta) => setCartItems(items => items.map(i => (i.id === id && i.selectedColor === color) ? {...i, quantity: Math.max(1, i.quantity + delta)} : i))}
        onRemove={(id, color) => setCartItems(items => items.filter(i => !(i.id === id && i.selectedColor === color)))}
        onClear={() => setCartItems([])}
        onOpenLogin={() => { setIsCartOpen(false); setIsAuthModalOpen(true); }}
      />
      
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedProduct(null)} />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
              <div className="md:w-1/2 bg-gray-50 p-8 flex flex-col justify-center">
                <img src={selectedProduct.images?.[activeImageIndex] || selectedProduct.image} className="w-full h-auto object-contain max-h-[400px]" alt="" />
              </div>
              <div className="md:w-1/2 p-10 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase">{selectedProduct.category}</span>
                  <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-400" /></button>
                </div>
                <h2 className="text-3xl font-black mb-4">{selectedProduct.name}</h2>
                <p className="text-gray-500 font-bold mb-8 leading-relaxed">{selectedProduct.description}</p>
                {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                  <div className="mb-8">
                    <p className="text-sm font-black text-gray-400 mb-3">اختاري اللون:</p>
                    <div className="flex gap-3">
                      {selectedProduct.colors.map(c => (
                        <button key={c} onClick={() => setSelectedColor(c)} className={`w-10 h-10 rounded-full border-4 ${selectedColor === c ? 'border-blue-600 scale-110 shadow-lg' : 'border-white shadow-sm'}`} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex flex-col"><span className="text-gray-400 text-xs font-black">السعر</span><span className="text-3xl font-black text-blue-600">{selectedProduct.price.toLocaleString()} <small className="text-xs">ج.م</small></span></div>
                  <button 
                    disabled={selectedProduct.colors && selectedProduct.colors.length > 0 && !selectedColor}
                    onClick={() => { handleAddToCart(selectedProduct, selectedColor || undefined); setSelectedProduct(null); setIsCartOpen(true); }}
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    أضيفي للسلة
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <AISearch products={products} />
      {isAdmin && (
        <button onClick={() => setView('admin')} className="fixed top-28 left-8 p-4 bg-gray-900 text-white rounded-2xl shadow-2xl z-[70] hover:scale-105 transition-all flex items-center gap-2 border border-white/20">
          <Settings className="w-5 h-5" />
          <span className="font-black text-sm">لوحة الإدارة</span>
        </button>
      )}
    </div>
  );
};

export default App;
