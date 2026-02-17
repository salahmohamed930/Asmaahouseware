
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, Plus, Trash2, Edit3,
  LogOut, Loader2, Palette, Lock, X, ClipboardList, CheckCircle, Truck, Clock, AlertCircle, Upload, Eye, EyeOff, Settings, Search
} from 'lucide-react';
import { Product, Order, SiteSettings } from '../types';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [session, setSession] = useState<any>(null);
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'settings'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    hero_title: 'بيت عصري بلمسة إبداع',
    hero_subtitle: 'اختاري من بين أرقى أطقم المائدة وأجهزة المطبخ العالمية بأسعار تنافسية وجودة مضمونة.',
    hero_image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=80'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '', category: 'أدوات المطبخ', price: 0, description: '', image: '', images: [], colors: [], is_visible: true
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    if (session) {
      loadAllData();
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchProducts(),
      fetchOrders(),
      fetchSettings()
    ]);
    setIsLoading(false);
  };

  const fetchSettings = async () => {
    try {
      // نحاول جلب الإعدادات (نفترض وجود سجل واحد بمعرف ثابت)
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
      if (data) setSiteSettings(data);
    } catch (e) {
      console.error("Error fetching settings:", e);
    }
  };

  const updateSettings = async () => {
    setIsLoading(true);
    try {
      // استخدام id=1 بشكل دائم لضمان تحديث نفس السجل
      const settingsToSave = { ...siteSettings, id: siteSettings.id || 1 };
      const { error } = await supabase.from('site_settings').upsert([settingsToSave]);
      if (error) throw error;
      alert('تم حفظ إعدادات الموقع بنجاح');
      fetchSettings();
    } catch (e: any) {
      alert('فشل حفظ الإعدادات: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (data) setProducts(data);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
    if (error) console.error("Error fetching orders:", error);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: authData.email,
      password: authData.password
    });
    if (!error) {
      setSession(data.session);
      loadAllData();
    } else {
      alert('بيانات الدخول غير صحيحة');
    }
    setIsLoading(false);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (!error) {
      fetchOrders();
    } else {
      alert('فشل تحديث حالة الطلب');
    }
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) return alert("يرجى ملء الاسم والسعر");
    
    setIsLoading(true);
    let error;
    if (editingProduct) {
      const { error: err } = await supabase.from('products').update(productForm).eq('id', editingProduct.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('products').insert([productForm]);
      error = err;
    }
    setIsLoading(false);
    if (!error) { 
      setIsModalOpen(false); 
      fetchProducts(); 
    } else {
      alert("خطأ أثناء الحفظ: " + error.message);
    }
  };

  const handleHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setSiteSettings({ ...siteSettings, hero_image: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  const toggleVisibility = async (p: Product) => {
    const newStatus = p.is_visible === false;
    const { error } = await supabase.from('products').update({ is_visible: newStatus }).eq('id', p.id);
    if (!error) fetchProducts();
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('هل أنتِ متأكدة من حذف هذا الصنف؟')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) fetchProducts();
  };

  const statusMap = {
    pending: { label: 'جديد', color: 'bg-orange-100 text-orange-600', icon: Clock },
    processing: { label: 'تجهيز', color: 'bg-blue-100 text-blue-600', icon: ClipboardList },
    shipped: { label: 'مشحون', color: 'bg-purple-100 text-purple-600', icon: Truck },
    delivered: { label: 'مستلم', color: 'bg-green-100 text-green-600', icon: CheckCircle },
    cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-600', icon: AlertCircle },
  };

  if (!session) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border">
        <Logo className="mb-8 justify-center" />
        <h2 className="text-2xl font-black text-center mb-8">تسجيل دخول الإدارة</h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <input type="email" placeholder="البريد الإلكتروني" className="w-full p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold" onChange={e => setAuthData({...authData, email: e.target.value})} />
          <input type="password" placeholder="كلمة المرور" className="w-full p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold" onChange={e => setAuthData({...authData, password: e.target.value})} />
          <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-xl shadow-blue-100">
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Lock className="w-5 h-5" />} دخول اللوحة
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 text-right font-['Tajawal']" dir="rtl">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-l shadow-sm hidden md:flex flex-col">
        <div className="p-8 border-b"><Logo /></div>
        <nav className="flex-1 p-6 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
            <LayoutDashboard className="w-5 h-5" /> <span className="font-bold">نظرة عامة</span>
          </button>
          <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition ${activeTab === 'products' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Package className="w-5 h-5" /> <span className="font-bold">المخزون</span>
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
            <ShoppingBag className="w-5 h-5" /> <span className="font-bold">الطلبات</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Settings className="w-5 h-5" /> <span className="font-bold">إعدادات الموقع</span>
          </button>
        </nav>
        <div className="p-6 border-t">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-red-500 font-bold hover:bg-red-50 transition">
            <LogOut className="w-5 h-5" /> خروج من الإدارة
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto h-screen no-scrollbar">
        <div className="flex justify-between items-center mb-10">
           <h2 className="text-3xl font-black">
             {activeTab === 'overview' ? 'إحصائيات المتجر' : activeTab === 'products' ? 'إدارة الأصناف' : activeTab === 'orders' ? 'الطلبات الواردة' : 'محتوى الواجهة'}
           </h2>
           {activeTab === 'products' && (
             <button onClick={() => { setEditingProduct(null); setProductForm({name: '', category: 'أدوات المطبخ', price: 0, description: '', images: [], is_visible: true}); setIsModalOpen(true); }} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg hover:bg-blue-700 transition">
               <Plus className="w-5 h-5" /> صنف جديد
             </button>
           )}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
              <p className="text-gray-400 font-bold mb-2">إجمالي المنتجات</p>
              <h4 className="text-5xl font-black text-blue-600">{products.length}</h4>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
              <p className="text-gray-400 font-bold mb-2">إجمالي الطلبات</p>
              <h4 className="text-5xl font-black text-blue-600">{orders.length}</h4>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border shadow-sm border-orange-100">
              <p className="text-gray-400 font-bold mb-2">طلبات بانتظار المراجعة</p>
              <h4 className="text-5xl font-black text-orange-500">{orders.filter(o => o.status === 'pending').length}</h4>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
             <table className="w-full text-right">
               <thead className="bg-gray-50 border-b">
                 <tr>
                   <th className="px-8 py-5 text-sm font-black text-gray-400">المنتج</th>
                   <th className="px-8 py-5 text-sm font-black text-gray-400">الفئة</th>
                   <th className="px-8 py-5 text-sm font-black text-gray-400">الحالة</th>
                   <th className="px-8 py-5 text-sm font-black text-gray-400 text-center">الإجراءات</th>
                 </tr>
               </thead>
               <tbody className="divide-y">
                 {products.map(p => (
                   <tr key={p.id} className={`hover:bg-gray-50 transition ${p.is_visible === false ? 'bg-gray-50/50' : ''}`}>
                     <td className="px-8 py-5 flex items-center gap-4 font-black">
                       <img src={p.image || 'https://via.placeholder.com/150'} className="w-14 h-14 rounded-2xl object-cover shadow-sm" alt="" />
                       <span>{p.name}</span>
                     </td>
                     <td className="px-8 py-5 text-sm font-bold text-gray-400">{p.category}</td>
                     <td className="px-8 py-5">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${p.is_visible === false ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                         {p.is_visible === false ? 'مخفي' : 'ظاهر'}
                       </span>
                     </td>
                     <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => { setEditingProduct(p); setProductForm(p); setIsModalOpen(true); }} className="p-3 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition"><Edit3 className="w-5 h-5" /></button>
                          <button onClick={() => toggleVisibility(p)} className={`p-3 rounded-xl transition ${p.is_visible === false ? 'text-gray-400 bg-gray-100' : 'text-blue-600 bg-blue-50'}`}>
                            {p.is_visible === false ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                          <button onClick={() => deleteProduct(p.id)} className="p-3 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition"><Trash2 className="w-5 h-5" /></button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-white p-20 rounded-[3rem] border text-center flex flex-col items-center gap-4">
                <Package className="w-12 h-12 text-gray-200" />
                <p className="text-gray-400 font-bold">لا توجد طلبات واردة حالياً</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white p-8 rounded-[2.5rem] border shadow-sm animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-black text-xl text-blue-600">طلب #{order.id.slice(0,8)}</h4>
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-2 ${statusMap[order.status as keyof typeof statusMap]?.color || 'bg-gray-100'}`}>
                          {statusMap[order.status as keyof typeof statusMap]?.label || order.status}
                        </span>
                      </div>
                      <p className="text-sm font-black text-gray-900">{order.customer_name} • <span className="text-blue-600">{order.customer_phone}</span></p>
                      <p className="text-xs text-gray-400 font-bold mt-1">{order.customer_address}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select 
                        value={order.status} 
                        onChange={e => updateOrderStatus(order.id, e.target.value)} 
                        className="bg-gray-50 border-none p-4 rounded-2xl text-xs font-black outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
                      >
                        {Object.keys(statusMap).map(s => <option key={s} value={s}>{statusMap[s as keyof typeof statusMap].label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-[2rem] space-y-3">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-sm font-bold">
                        <span className="text-gray-700">{item.product_name} <small className="text-blue-500 font-black mr-2">×{item.quantity}</small></span>
                        <span className="text-gray-900">{item.price.toLocaleString()} ج.م</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center font-black">
                      <span className="text-gray-900">إجمالي الطلب:</span>
                      <span className="text-2xl text-blue-600">{order.total_price.toLocaleString()} ج.م</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-500">عنوان الواجهة الرئيسي</label>
                  <textarea className="w-full p-4 border rounded-2xl font-bold bg-gray-50 h-24 focus:ring-2 focus:ring-blue-600 outline-none transition" value={siteSettings.hero_title} onChange={e => setSiteSettings({...siteSettings, hero_title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-500">وصف الواجهة الفرعي</label>
                  <textarea className="w-full p-4 border rounded-2xl font-bold bg-gray-50 h-32 focus:ring-2 focus:ring-blue-600 outline-none transition" value={siteSettings.hero_subtitle} onChange={e => setSiteSettings({...siteSettings, hero_subtitle: e.target.value})} />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-black text-gray-500">صورة الخلفية (Hero)</label>
                <div 
                  onClick={() => heroFileInputRef.current?.click()}
                  className="w-full h-64 border-2 border-dashed border-gray-200 rounded-[2.5rem] overflow-hidden cursor-pointer relative group flex items-center justify-center bg-gray-50"
                >
                  {siteSettings.hero_image ? (
                    <img src={siteSettings.hero_image} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="" />
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center"><Upload className="w-10 h-10 mb-2" /><span className="text-xs font-black">ارفعي صورة الواجهة</span></div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <Upload className="w-10 h-10" />
                  </div>
                  <input type="file" ref={heroFileInputRef} className="hidden" accept="image/*" onChange={handleHeroImageChange} />
                </div>
              </div>
            </div>
            <button onClick={updateSettings} disabled={isLoading} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-xl hover:bg-blue-700 active:scale-95 transition-all">
              {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <Settings className="w-6 h-6" />} تحديث محتوى المتجر
            </button>
          </div>
        )}
      </main>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-[3rem] p-10 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black mb-8 text-center">{editingProduct ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد'}</h3>
            <div className="space-y-5">
              <div className="space-y-1"><label className="text-xs font-black text-gray-400 mr-2">اسم المنتج</label><input type="text" placeholder="مثلاً: طقم حلل جرانيت" className="w-full p-4 border rounded-2xl font-bold bg-gray-50" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-xs font-black text-gray-400 mr-2">السعر</label><input type="number" placeholder="0.00" className="w-full p-4 border rounded-2xl font-bold bg-gray-50" value={productForm.price} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} /></div>
                <div className="space-y-1"><label className="text-xs font-black text-gray-400 mr-2">الفئة</label>
                  <select className="w-full p-4 border rounded-2xl font-bold bg-gray-50" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value as any})}>
                    <option>أدوات المطبخ</option><option>الأجهزة الكهربائية</option><option>الديكور</option><option>أواني التقديم</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1"><label className="text-xs font-black text-gray-400 mr-2">رابط الصورة (URL)</label><input type="text" placeholder="https://..." className="w-full p-4 border rounded-2xl font-bold bg-gray-50" value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} /></div>
              <div className="space-y-1"><label className="text-xs font-black text-gray-400 mr-2">وصف المنتج</label><textarea placeholder="اكتبي تفاصيل المنتج..." className="w-full p-4 border rounded-2xl font-bold h-28 bg-gray-50" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} /></div>
              <button onClick={handleSaveProduct} disabled={isLoading} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <Package className="w-6 h-6" />} {editingProduct ? 'حفظ التغييرات' : 'نشر المنتج'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
