
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, Plus, Trash2, Edit3,
  LogOut, Loader2, Palette, Lock, X, ClipboardList, CheckCircle, Truck, Clock, AlertCircle, Upload, Eye, EyeOff, Settings, Search, Printer, Users, Tags, Percent, Banknote
} from 'lucide-react';
import { Product, Order, SiteSettings, UserProfile, CategoryData } from '../types';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [session, setSession] = useState<any>(null);
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'users' | 'categories' | 'settings'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    hero_title: 'بيت عصري بلمسة إبداع',
    hero_subtitle: 'اختاري من بين أرقى أطقم المائدة وأجهزة المطبخ العالمية بأسعار تنافسية وجودة مضمونة.',
    hero_image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=80'
  });

  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '', category: 'أدوات المطبخ', price: 0, wholesale_price: 0, description: '', image: '', images: [], colors: [], is_visible: true
  });

  const heroFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    if (session) loadAllData();
  };

  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchProducts(),
      fetchOrders(),
      fetchSettings(),
      fetchUsers(),
      fetchCategories()
    ]);
    setIsLoading(false);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (data) setProducts(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
    if (data) setSiteSettings(data);
  };

  const handleToggleWholesale = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_wholesale: !currentStatus }).eq('id', userId);
    if (!error) fetchUsers();
  };

  const handleSetUserDiscount = async (userId: string) => {
    const value = prompt('أدخل قيمة الخصم (رقم):');
    if (!value) return;
    const type = confirm('هل الخصم نسبة مئوية؟ (نعم للنسبة، لا للمبلغ الثابت)') ? 'percent' : 'fixed';
    
    const { error } = await supabase.from('profiles').update({ 
      next_order_discount_value: Number(value),
      next_order_discount_type: type 
    }).eq('id', userId);
    if (!error) {
      alert('تم تحديث الخصم بنجاح');
      fetchUsers();
    }
  };

  const handleAddCategory = async () => {
    const name = prompt('اسم التصنيف الجديد:');
    if (!name) return;
    const { error } = await supabase.from('categories').insert([{ name, discount_percent: 0 }]);
    if (!error) fetchCategories();
  };

  const handleUpdateCategoryDiscount = async (catId: number, currentDiscount: number) => {
    const value = prompt('نسبة الخصم لهذا القسم (0-100):', currentDiscount.toString());
    if (value === null) return;
    const { error } = await supabase.from('categories').update({ discount_percent: Number(value) }).eq('id', catId);
    if (!error) fetchCategories();
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('سيتم حذف التصنيف، هل أنت متأكد؟')) return;
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
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
    if (!error) fetchOrders();
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
    if (!error) { setIsModalOpen(false); fetchProducts(); }
    else alert("خطأ: " + error.message);
  };

  const statusMap = {
    pending: { label: 'جديد', color: 'bg-orange-100 text-orange-600' },
    processing: { label: 'تجهيز', color: 'bg-blue-100 text-blue-600' },
    shipped: { label: 'مشحون', color: 'bg-purple-100 text-purple-600' },
    delivered: { label: 'مستلم', color: 'bg-green-100 text-green-600' },
    cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-600' },
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
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Users className="w-5 h-5" /> <span className="font-bold">العملاء</span>
          </button>
          <button onClick={() => setActiveTab('categories')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition ${activeTab === 'categories' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Tags className="w-5 h-5" /> <span className="font-bold">الأقسام</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Settings className="w-5 h-5" /> <span className="font-bold">الإعدادات</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto h-screen no-scrollbar">
        <div className="flex justify-between items-center mb-10">
           <h2 className="text-3xl font-black">
             {activeTab === 'overview' && 'إحصائيات المتجر'}
             {activeTab === 'products' && 'إدارة المنتجات'}
             {activeTab === 'orders' && 'الطلبات'}
             {activeTab === 'users' && 'إدارة العملاء'}
             {activeTab === 'categories' && 'إدارة الأقسام والخصومات'}
             {activeTab === 'settings' && 'إعدادات الموقع'}
           </h2>
           {activeTab === 'products' && (
             <button onClick={() => { setEditingProduct(null); setProductForm({name: '', category: 'أدوات المطبخ', price: 0, wholesale_price: 0, description: '', images: [], is_visible: true}); setIsModalOpen(true); }} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg">
               <Plus className="w-5 h-5" /> صنف جديد
             </button>
           )}
           {activeTab === 'categories' && (
             <button onClick={handleAddCategory} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg">
               <Plus className="w-5 h-5" /> إضافة قسم
             </button>
           )}
        </div>

        {activeTab === 'users' && (
          <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-8 py-5 font-black">الاسم</th>
                  <th className="px-8 py-5 font-black">الحالة</th>
                  <th className="px-8 py-5 font-black">خصم الطلب القادم</th>
                  <th className="px-8 py-5 font-black text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="px-8 py-5 font-bold">{u.full_name}<br/><span className="text-xs text-gray-400">{u.email}</span></td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${u.is_wholesale ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                        {u.is_wholesale ? 'تاجر جملة' : 'عميل عادي'}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-bold text-blue-600">
                      {u.next_order_discount_value > 0 ? (
                        `${u.next_order_discount_value} ${u.next_order_discount_type === 'percent' ? '%' : 'ج.م'}`
                      ) : 'لا يوجد'}
                    </td>
                    <td className="px-8 py-5 text-center flex items-center justify-center gap-3">
                      <button onClick={() => handleToggleWholesale(u.id, u.is_wholesale)} className="p-3 bg-purple-50 text-purple-600 rounded-xl" title="تبديل الجملة"><Banknote className="w-5 h-5"/></button>
                      <button onClick={() => handleSetUserDiscount(u.id)} className="p-3 bg-blue-50 text-blue-600 rounded-xl" title="تعديل الخصم"><Percent className="w-5 h-5"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white p-6 rounded-[2rem] border shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-black text-gray-800">{cat.name}</h4>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-400 p-2"><Trash2 className="w-5 h-5"/></button>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-gray-400">خصم القسم</p>
                    <p className="text-2xl font-black text-blue-600">{cat.discount_percent}%</p>
                  </div>
                  <button onClick={() => handleUpdateCategoryDiscount(cat.id, cat.discount_percent)} className="bg-white p-3 rounded-xl shadow-sm text-blue-600 hover:scale-105 transition"><Edit3 className="w-5 h-5"/></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
             <table className="w-full text-right">
               <thead className="bg-gray-50 border-b">
                 <tr>
                   <th className="px-8 py-5 font-black">المنتج</th>
                   <th className="px-8 py-5 font-black">السعر</th>
                   <th className="px-8 py-5 font-black">الجملة</th>
                   <th className="px-8 py-5 font-black text-center">الإجراءات</th>
                 </tr>
               </thead>
               <tbody className="divide-y">
                 {products.map(p => (
                   <tr key={p.id}>
                     <td className="px-8 py-5 font-black flex items-center gap-3">
                        <img src={p.image} className="w-10 h-10 rounded-lg object-cover" />
                        {p.name}
                     </td>
                     <td className="px-8 py-5 font-bold">{p.price.toLocaleString()} ج.م</td>
                     <td className="px-8 py-5 font-bold text-purple-600">{p.wholesale_price?.toLocaleString() || '0'} ج.م</td>
                     <td className="px-8 py-5 text-center flex justify-center gap-2">
                        <button onClick={() => { setEditingProduct(p); setProductForm(p); setIsModalOpen(true); }} className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => supabase.from('products').delete().eq('id', p.id).then(() => fetchProducts())} className="p-3 bg-red-50 text-red-500 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}

        {/* Modal المنتج المعدل ليشمل حقل سعر الجملة */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <div className="relative bg-white w-full max-w-xl rounded-[3rem] p-10 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
              <h3 className="text-2xl font-black mb-8 text-center">{editingProduct ? 'تعديل الصنف' : 'إضافة صنف جديد'}</h3>
              <div className="space-y-5">
                <input type="text" placeholder="اسم المنتج" className="w-full p-4 border rounded-2xl font-bold bg-gray-50" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="السعر العادي" className="w-full p-4 border rounded-2xl font-bold bg-gray-50" value={productForm.price} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} />
                  <input type="number" placeholder="سعر الجملة" className="w-full p-4 border rounded-2xl font-bold bg-purple-50 border-purple-100" value={productForm.wholesale_price} onChange={e => setProductForm({...productForm, wholesale_price: Number(e.target.value)})} />
                </div>
                <select className="w-full p-4 border rounded-2xl font-bold bg-gray-50" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <textarea placeholder="وصف المنتج" className="w-full p-4 border rounded-2xl font-bold h-28 bg-gray-50" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                <input type="text" placeholder="رابط الصورة" className="w-full p-4 border rounded-2xl font-bold bg-gray-50" value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} />
                <button onClick={handleSaveProduct} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl hover:bg-blue-700 transition">
                  {isLoading ? <Loader2 className="animate-spin w-6 h-6 mx-auto" /> : 'حفظ البيانات'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
