
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import AISearch from './components/AISearch';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import { Product, CartItem, Category, Order, SiteSettings, UserProfile, CategoryData } from './types';
import { supabase } from './lib/supabase';
import { 
  X, ShoppingCart, Loader2, Settings, Package, Clock, CheckCircle, Truck, AlertCircle, Inbox
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'store' | 'admin' | 'my-orders'>('store');
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [heroContent, setHeroContent] = useState<SiteSettings>({
    hero_title: 'بيت عصري بلمسة إبداع',
    hero_subtitle: 'اختاري من بين أرقى أطقم المائدة وأجهزة المطبخ العالمية بأسعار تنافسية وجودة مضمونة.',
    hero_image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=80'
  });

  useEffect(() => {
    loadInitialData();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user.id);
        checkAdmin(session.user);
      } else {
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    await Promise.all([fetchProducts(), fetchCategories(), fetchHeroSettings(), checkUser()]);
    setIsLoading(false);
  };

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setUserProfile(data);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const fetchHeroSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*').single();
    if (data) setHeroContent(data);
  };

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      fetchUserProfile(user.id);
      checkAdmin(user);
    }
  };

  const checkAdmin = (user: any) => {
    if (user.email === 'admin@asmaa.com') setIsAdmin(true);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts(data);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const categoryMatch = activeCategory === 'الكل' || p.category === activeCategory;
      const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const visibilityMatch = p.is_visible !== false; 
      return categoryMatch && searchMatch && visibilityMatch;
    });
  }, [products, activeCategory, searchQuery]);

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

  if (view === 'admin') return <AdminDashboard onLogout={() => { setView('store'); loadInitialData(); }} />;

  return (
    <div className="min-h-screen flex flex-col font-['Tajawal'] text-right" dir="rtl">
      <Navbar 
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} 
        onCartClick={() => setIsCartOpen(true)} 
        user={user}
        isAdmin={isAdmin}
        onMyOrders={() => setView('my-orders')}
        onHome={() => { setView('store'); loadInitialData(); }}
        onLoginClick={() => setIsAuthModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1">
        {view === 'store' ? (
          <>
            <section className="bg-blue-900 text-white py-20 relative overflow-hidden">
              <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12 relative z-10">
                <div className="md:w-1/2 text-right">
                  <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight" dangerouslySetInnerHTML={{ __html: heroContent.hero_title.replace(/\n/g, '<br/>') }}></h2>
                  <p className="text-lg md:text-xl text-blue-100/80 mb-8 max-w-xl">{heroContent.hero_subtitle}</p>
                </div>
                <div className="md:w-1/2">
                  <img src={heroContent.hero_image} className="rounded-[3rem] shadow-2xl aspect-video object-cover" />
                </div>
              </div>
            </section>

            <section className="py-20 bg-gray-50/50">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                  <h3 className="text-2xl font-black text-gray-900">أقسام المتجر</h3>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => setActiveCategory('الكل')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeCategory === 'الكل' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500'}`}>الكل</button>
                    {categories.map(cat => (
                      <button key={cat.id} onClick={() => setActiveCategory(cat.name)} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeCategory === cat.name ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border'}`}>
                        {cat.name}
                        {cat.discount_percent > 0 && <span className="mr-2 text-[10px] bg-red-100 text-red-600 p-1 rounded">-{cat.discount_percent}%</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-32"><Loader2 className="animate-spin w-10 text-blue-600" /></div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredProducts.map(p => (
                      <ProductCard key={p.id} product={p} userProfile={userProfile} onAddToCart={(prod) => { handleAddToCart(prod); setIsCartOpen(true); }} onViewDetails={setSelectedProduct} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <div className="py-20 text-center font-black">جاري تحميل طلباتكِ...</div>
        )}
      </main>

      <Cart 
        isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        userProfile={userProfile}
        categories={categories}
        onUpdateQuantity={(id, color, delta) => setCartItems(items => items.map(i => (i.id === id && i.selectedColor === color) ? {...i, quantity: Math.max(1, i.quantity + delta)} : i))}
        onRemove={(id, color) => setCartItems(items => items.filter(i => !(i.id === id && i.selectedColor === color)))}
        onClear={() => setCartItems([])}
        onOpenLogin={() => { setIsCartOpen(false); setIsAuthModalOpen(true); }}
      />
      
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
