
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, Plus, Trash2, Edit3,
  LogOut, Loader2, Palette, Lock, X, ClipboardList, CheckCircle, Truck, Clock, AlertCircle, Upload, Image as ImageIcon, Eye, EyeOff, Settings
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
    name: '', category: 'أدوات المطبخ', price: 0, description: '', image: '', images: [], colors: [], rating: 5, reviews: 0, is_visible: true
  });

  const [colorInput, setColorInput] = useState('#2563eb');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    if (session) {
      fetchProducts();
      fetchOrders();
      fetchSettings();
    }
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*').single();
    if (data) setSiteSettings(data);
  };

  const updateSettings = async () => {
    setIsLoading(true);
    const { error } = await supabase.from('site_settings').upsert([siteSettings]);
    setIsLoading(false);
    if (!error) alert('تم حفظ إعدادات الواجهة بنجاح');
    else alert('فشل الحفظ: ' + error.message);
  };

  const handleHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setSiteSettings({ ...siteSettings, hero_image: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (data) setProducts(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: authData.email,
      password: authData.password
    });
    if (error) alert('خطأ في الدخول: ' + error.message);
    else {
      setSession(data.session);
      fetchProducts();
      fetchOrders();
      fetchSettings();
    }
    setIsLoading(false);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setProductForm({
      name: '', category: 'أدوات المطبخ', price: 0, description: '', image: '', images: [], colors: [], rating: 5, reviews: 0, is_visible: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setProductForm(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.image && (!productForm.images || productForm.images.length === 0)) {
      alert('يرجى إضافة صورة واحدة على الأقل');
      return;
    }

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
    } else alert(error.message);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages: string[] = [...(productForm.images || [])];
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
      });
      reader.readAsDataURL(files[i]);
      const base64 = await base64Promise;
      newImages.push(base64);
    }
    setProductForm({ ...productForm, images: newImages, image: newImages[0] });
  };

  const toggleVisibility = async (product: Product) => {
    const newStatus = product.is_visible === false;
    const { error } = await supabase.from('products').update({ is_visible: newStatus }).eq('id', product.id);
    if (!error) fetchProducts();
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('هل أنتِ متأكدة من حذف هذا الصنف نهائياً؟')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) fetchProducts();
  };

  const statusMap = {
    pending: { label: 'جديد', color: 'bg-orange-100 text-orange-600', icon: Clock },
    processing: { label: 'قيد التجهيز', color: 'bg-blue-100 text-blue-600', icon: ClipboardList },
    shipped: { label: 'تم الشحن', color: 'bg-purple-100 text-purple-600', icon: Truck },
    delivered: { label: 'تم الاستلام', color: 'bg-green-100 text-green-600', icon: CheckCircle },
    cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-600', icon: AlertCircle },
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border">
          <div className="flex justify-center mb-8"><Logo /></div>
          <h2 className="text-2xl font-black text-center mb-8">تسجيل دخول الإدارة</h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <input type="email" placeholder="البريد الإلكتروني" className="w-full p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold" onChange={(e) => setAuthData({...authData, email: e.target.value})} />
            <input type="password" placeholder="كلمة المرور" className="w-full p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold" onChange={(e) => setAuthData({...authData, password: e.target.value})} />
            <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700">
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Lock className="w-5 h-5" />} دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-right font-['Tajawal']" dir="rtl">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-l shadow-sm hidden md:flex flex-col">
        <div className="p-8 border-b"><Logo /></div>
        <nav className="flex-1 p-6 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
            <LayoutDashboard className="w-5 h-5" /> <span className="font-bold">الإحصائيات</span>
          </button>
          <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition ${activeTab === 'products' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Package className="w-5 h-5" /> <span className="font-bold">المنتجات</span>
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
            <ShoppingBag className="w-5 h-5" /> <span className="font-bold">الطلبات</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Settings className="w-5 h-5" /> <span className="font-bold">إعدادات الموقع</span>
          </button>
        </nav>
        <div className="p-6 border-t">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-red-500 font-bold hover:bg-red-50">
            <LogOut className="w-5 h-5" /> خروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="flex justify-between items-center mb-10">
           <h2 className="text-3xl font-black">
             {activeTab === 'overview' ? 'نظرة عامة' : activeTab === 'products' ? 'إدارة المنتجات' : activeTab === 'orders' ? 'إدارة الطلبات' : 'إعدادات الصفحة الرئيسية'}
           </h2>
           {activeTab === 'products' && (
             <button onClick={handleOpenAdd} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg hover:bg-blue-700 transition">
               <Plus className="w-5 h-5" /> صنف جديد
             </button>
           )}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
              <p className="text-gray-500 font-bold mb-2">إجمالي المنتجات</p>
              <h4 className="text-4xl font-black text-blue-600">{products.length}</h4>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
              <p className="text-gray-500 font-bold mb-2">إجمالي الطلبات</p>
              <h4 className="text-4xl font-black text-blue-600">{orders.length}</h4>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border shadow-sm text-orange-500">
              <p className="text-gray-500 font-bold mb-2">طلبات بانتظار الشحن</p>
              <h4 className="text-4xl font-black">{orders.filter(o => o.status === 'pending').length}</h4>
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
                   <th className="px-8 py-5 text-sm font-black text-gray-400 text-center">الإجراءات</th>
                 </tr>
               </thead>
               <tbody className="divide-y">
                 {products.map(p => (
                   <tr key={p.id} className={`hover:bg-gray-50 transition ${p.is_visible === false ? 'opacity-40' : ''}`}>
                     <td className="px-8 py-5 flex items-center gap-4 font-black">
                       <img src={p.image} className="w-14 h-14 rounded-2xl object-cover shadow-sm" alt="" />
                       <span>{p.name}</span>
                     </td>
                     <td className="px-8 py-5 text-sm font-bold text-gray-400">{p.category}</td>
                     <td className="px-8 py-5 text-center flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenEdit(p)} className="p-3 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100"><Edit3 className="w-5 h-5" /></button>
                        <button onClick={() => toggleVisibility(p)} className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200">{p.is_visible === false ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                        <button onClick={() => deleteProduct(p.id)} className="p-3 text-red-500 bg-red-50 rounded-xl hover:bg-red-100"><Trash2 className="w-5 h-5" /></button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm max-w-4xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-500">عنوان الواجهة الرئيسي</label>
                  <input type="text" className="w-full p-4 border rounded-2xl font-bold bg-gray-50" value={siteSettings.hero_title} onChange={e => setSiteSettings({...siteSettings, hero_title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-500">وصف الواجهة</label>
                  <textarea className="w-full p-4 border rounded-2xl font-bold bg-gray-50 h-32" value={siteSettings.hero_subtitle} onChange={e => setSiteSettings({...siteSettings, hero_subtitle: e.target.value})} />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-black text-gray-500">صورة الخلفية</label>
                <div 
                  onClick={() => heroFileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-gray-200 rounded-3xl overflow-hidden cursor-pointer relative group"
                >
                  <img src={siteSettings.hero_image} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <Upload className="w-8 h-8" />
                  </div>
                  <input type="file" ref={heroFileInputRef} className="hidden" accept="image/*" onChange={handleHeroImageChange} />
                </div>
              </div>
            </div>
            <button onClick={updateSettings} disabled={isLoading} className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-3 shadow-xl hover:bg-blue-700 active:scale-95 transition-all">
              {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <Settings className="w-6 h-6" />} حفظ التغييرات على الموقع
            </button>
          </div>
        )}
      </main>

      {/* Product Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] p-10 max-h-[90vh] overflow-y-auto no-scrollbar">
            <h3 className="text-2xl font-black mb-8">{editingProduct ? 'تعديل الصنف' : 'إضافة صنف جديد'}</h3>
            <div className="space-y-6">
              <input type="text" placeholder="اسم المنتج" className="w-full p-4 border rounded-2xl font-bold bg-gray-50" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="السعر" className="w-full p-4 border rounded-2xl font-bold bg-gray-50" value={productForm.price} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} />
                <select className="w-full p-4 border rounded-2xl font-bold bg-gray-50" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value as any})}>
                  <option>أدوات المطبخ</option><option>الأجهزة الكهربائية</option><option>الديكور</option><option>أواني التقديم</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-500">صور المنتج</label>
                <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-blue-50 transition">
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="text-xs font-black">اضغطي لرفع الصور</span>
                  <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {productForm.images?.map((img, idx) => (
                    <div key={idx} className="relative aspect-square">
                      <img src={img} className="w-full h-full object-cover rounded-xl border" alt="" />
                      <button onClick={() => {
                        const next = [...(productForm.images || [])];
                        next.splice(idx, 1);
                        setProductForm({...productForm, images: next, image: next[0] || ''});
                      }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2 text-gray-500"><Palette className="w-4 h-4" /> الألوان</label>
                <div className="flex gap-2">
                  <input type="color" className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent" value={colorInput} onChange={e => setColorInput(e.target.value)} />
                  <button onClick={() => {
                    if (!productForm.colors?.includes(colorInput)) setProductForm({...productForm, colors: [...(productForm.colors || []), colorInput]});
                  }} className="bg-blue-600 text-white px-4 rounded-xl text-xs font-black">إضافة</button>
                  <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar">
                    {productForm.colors?.map(c => <div key={c} className="w-8 h-8 rounded-full border border-gray-200 flex-shrink-0 relative cursor-pointer" style={{backgroundColor: c}} onClick={() => setProductForm({...productForm, colors: productForm.colors?.filter(x => x !== c)})} />)}
                  </div>
                </div>
              </div>

              <textarea placeholder="الوصف..." className="w-full p-4 border rounded-2xl font-bold h-32 bg-gray-50" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
              
              <button onClick={handleSaveProduct} disabled={isLoading} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <Package className="w-6 h-6" />} {editingProduct ? 'حفظ التعديلات' : 'نشر في المتجر'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
