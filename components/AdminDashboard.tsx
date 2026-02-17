
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
    try {
      const { data } = await supabase.from('site_settings').select('*').single();
      if (data) setSiteSettings(data);
    } catch (e) {}
  };

  const updateSettings = async () => {
    setIsLoading(true);
    const { error } = await supabase.from('site_settings').upsert([siteSettings]);
    setIsLoading(false);
    if (!error) alert('تم حفظ إعدادات الموقع');
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
      fetchProducts();
      fetchOrders();
      fetchSettings();
    } else alert('خطأ في البيانات');
    setIsLoading(false);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (!error) fetchOrders();
  };

  const handleSaveProduct = async () => {
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
  };

  const toggleVisibility = async (p: Product) => {
    const newStatus = p.is_visible === false;
    const { error } = await supabase.from('products').update({ is_visible: newStatus }).eq('id', p.id);
    if (!error) fetchProducts();
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('حذف نهائي؟')) return;
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
      <div className="bg-white w-full max-w-md rounded-[2rem] p-10 shadow-2xl border">
        <Logo className="mb-8 justify-center" />
        <h2 className="text-xl font-black text-center mb-6">دخول الإدارة</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="البريد" className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold" onChange={e => setAuthData({...authData, email: e.target.value})} />
          <input type="password" placeholder="كلمة المرور" className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold" onChange={e => setAuthData({...authData, password: e.target.value})} />
          <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-black">{isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'دخول'}</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 text-right font-['Tajawal']" dir="rtl">
      <aside className="w-64 bg-white border-l p-6 hidden md:flex flex-col gap-2">
        <Logo className="mb-10" />
        <button onClick={() => setActiveTab('overview')} className={`p-4 rounded-xl flex items-center gap-3 font-bold ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}><LayoutDashboard className="w-5 h-5" /> الإحصائيات</button>
        <button onClick={() => setActiveTab('products')} className={`p-4 rounded-xl flex items-center gap-3 font-bold ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}><Package className="w-5 h-5" /> المنتجات</button>
        <button onClick={() => setActiveTab('orders')} className={`p-4 rounded-xl flex items-center gap-3 font-bold ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}><ShoppingBag className="w-5 h-5" /> الطلبات</button>
        <button onClick={() => setActiveTab('settings')} className={`p-4 rounded-xl flex items-center gap-3 font-bold ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}><Settings className="w-5 h-5" /> الإعدادات</button>
        <div className="mt-auto pt-6 border-t"><button onClick={onLogout} className="text-red-500 font-bold flex items-center gap-2"><LogOut className="w-5 h-5" /> خروج</button></div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl border shadow-sm">
              <p className="text-gray-400 font-bold mb-2">إجمالي الطلبات</p>
              <h4 className="text-4xl font-black text-blue-600">{orders.length}</h4>
            </div>
            <div className="bg-white p-8 rounded-3xl border shadow-sm">
              <p className="text-gray-400 font-bold mb-2">المنتجات</p>
              <h4 className="text-4xl font-black text-blue-600">{products.length}</h4>
            </div>
            <div className="bg-white p-8 rounded-3xl border shadow-sm">
              <p className="text-gray-400 font-bold mb-2">طلبات جديدة</p>
              <h4 className="text-4xl font-black text-orange-500">{orders.filter(o => o.status === 'pending').length}</h4>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-black">إدارة المنتجات</h2><button onClick={() => { setEditingProduct(null); setProductForm({name: '', category: 'أدوات المطبخ', price: 0, description: '', images: [], is_visible: true}); setIsModalOpen(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">+ إضافة صنف</button></div>
            <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
              <table className="w-full text-right">
                <thead className="bg-gray-50 border-b">
                  <tr><th className="px-6 py-4">المنتج</th><th className="px-6 py-4">الفئة</th><th className="px-6 py-4">الحالة</th><th className="px-6 py-4 text-center">إجراءات</th></tr>
                </thead>
                <tbody className="divide-y">
                  {products.map(p => (
                    <tr key={p.id} className={p.is_visible === false ? 'opacity-50' : ''}>
                      <td className="px-6 py-4 flex items-center gap-3 font-bold"><img src={p.image} className="w-10 h-10 rounded-lg object-cover" /> {p.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{p.category}</td>
                      <td className="px-6 py-4"><span className={`text-[10px] px-2 py-1 rounded-full font-black ${p.is_visible === false ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{p.is_visible === false ? 'مخفي' : 'ظاهر'}</span></td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => { setEditingProduct(p); setProductForm(p); setIsModalOpen(true); }} className="p-2 text-blue-600"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => toggleVisibility(p)} className="p-2 text-gray-400">{p.is_visible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                        <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black">الطلبات الواردة</h2>
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-3xl border shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div><h4 className="font-black text-blue-600">#{order.id.slice(0,8)}</h4><p className="text-sm font-bold">{order.customer_name} - {order.customer_phone}</p><p className="text-xs text-gray-400">{order.customer_address}</p></div>
                    <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)} className="bg-gray-50 p-2 rounded-xl text-xs font-bold outline-none">
                      {Object.keys(statusMap).map(s => <option key={s} value={s}>{statusMap[s as keyof typeof statusMap].label}</option>)}
                    </select>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-xs font-bold"><span>{item.product_name} × {item.quantity}</span><span>{item.price} ج.م</span></div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-black"><span>الإجمالي:</span><span>{order.total_price} ج.م</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto no-scrollbar">
            <h3 className="text-xl font-black mb-6">{editingProduct ? 'تعديل' : 'إضافة'} منتج</h3>
            <div className="space-y-4">
              <input type="text" placeholder="الاسم" className="w-full p-4 bg-gray-50 rounded-xl font-bold" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
              <input type="number" placeholder="السعر" className="w-full p-4 bg-gray-50 rounded-xl font-bold" value={productForm.price} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} />
              <select className="w-full p-4 bg-gray-50 rounded-xl font-bold" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value as any})}>
                <option>أدوات المطبخ</option><option>الأجهزة الكهربائية</option><option>الديكور</option><option>أواني التقديم</option>
              </select>
              <textarea placeholder="الوصف" className="w-full p-4 bg-gray-50 rounded-xl font-bold h-24" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
              <button onClick={handleSaveProduct} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black">{isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'حفظ'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
