
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, Plus, Trash2, Edit3,
  LogOut, Loader2, Palette, Lock, X, ClipboardList, CheckCircle, Truck, Clock, AlertCircle, Upload, Eye, EyeOff, Settings, Search, Printer, Users, Briefcase, User
} from 'lucide-react';
import { Product, Order, SiteSettings, UserAccount } from '../types';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

interface AdminDashboardProps {
  user: UserAccount | null;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user: initialUser, onLogout }) => {
  const [session, setSession] = useState<any>(initialUser ? { user: initialUser } : null);
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'users' | 'settings'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
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
    name: '', code: '', category: 'أدوات المطبخ', price: 0, wholesale_price: 0, description: '', image: '', images: [], colors: [], is_visible: true
  });

  useEffect(() => {
    if (initialUser) {
      setSession({ user: initialUser });
      loadAllData();
    } else {
      checkUser();
    }
  }, [initialUser]);

  const checkUser = async () => {
    const savedUser = localStorage.getItem('asmaa_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        if (userData.role === 'admin') {
          setSession({ user: userData });
          loadAllData();
        } else {
          setSession(null);
        }
      } catch (e) {
        setSession(null);
      }
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchOrders(),
        fetchUsers(),
        fetchSettings()
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
      if (data) setSiteSettings(data);
    } catch (e) {
      console.error("Error fetching settings:", e);
    }
  };

  const updateSettings = async () => {
    setIsLoading(true);
    try {
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
    try {
      const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (e) {
      console.error("Error fetching products:", e);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (e) {
      console.error("Error fetching users:", e);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (e) {
      console.error("Error fetching orders:", e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', authData.email)
        .eq('password', authData.password)
        .eq('role', 'admin')
        .single();

      if (user && !error) {
        localStorage.setItem('asmaa_user', JSON.stringify(user));
        setSession({ user });
        loadAllData();
      } else {
        alert('بيانات الدخول غير صحيحة أو ليس لديكِ صلاحية الإدارة');
      }
    } catch (err) {
      alert('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as any } : o));
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) throw error;
      fetchOrders();
    } catch (err: any) {
      console.error("Error updating order status:", err);
      alert('فشل تحديث حالة الطلب: ' + (err.message || ''));
      fetchOrders();
    }
  };

  const handlePrint = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // التأكد من جلب الأصناف من order_items أو items
    const orderItems = order.order_items || order.items || [];

    const itemsHtml = orderItems.map(item => `
      <tr>
        <td style="padding: 5px; border-bottom: 1px solid #eee;">#${item.id || 'N/A'}</td>
        <td style="padding: 5px; border-bottom: 1px solid #eee;">
          <div style="font-weight: bold;">${item.product_name}</div>
          ${item.selected_color ? `<div style="font-size: 10px; color: #666;">اللون: ${item.selected_color}</div>` : ''}
        </td>
        <td style="padding: 5px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 5px; border-bottom: 1px solid #eee; text-align: left;">${item.price.toLocaleString()}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>فاتورة طلب #${order.id.slice(0,8)}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap');
            body { font-family: 'Tajawal', sans-serif; width: 80mm; margin: 0 auto; padding: 10px; color: #333; line-height: 1.4; }
            .header { text-align: center; border-bottom: 2px dashed #333; padding-bottom: 10px; margin-bottom: 10px; }
            .store-name { font-size: 22px; font-weight: 900; color: #2563eb; margin-bottom: 5px; }
            .customer-info { margin-bottom: 15px; font-size: 14px; border: 1px solid #eee; padding: 10px; border-radius: 5px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .info-label { font-weight: 700; color: #666; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 15px; }
            th { text-align: right; border-bottom: 1px solid #333; padding: 5px; background: #f9f9f9; }
            .total-section { border-top: 2px dashed #333; padding-top: 10px; font-weight: 900; font-size: 18px; display: flex; justify-content: space-between; color: #2563eb; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 10px; }
            @media print { body { width: 80mm; margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="store-name">أسماء للأدوات المنزلية</div>
            <div style="font-size: 14px; font-weight: 700;">إيصال تسليم طلبية</div>
            <div style="font-size: 11px; margin-top: 5px;">تاريخ الطلب: ${new Date(order.created_at).toLocaleDateString('ar-EG')}</div>
          </div>
          
          <div class="customer-info">
            <div class="info-row"><span class="info-label">رقم الطلب:</span> <span style="font-weight: 900;">#${order.id.slice(0,8)}</span></div>
            <div class="info-row"><span class="info-label">اسم العميل:</span> <span>${order.customer_name}</span></div>
            <div class="info-row"><span class="info-label">الهاتف:</span> <span dir="ltr">${order.customer_phone}</span></div>
            ${order.customer_phone_2 ? `<div class="info-row"><span class="info-label">هاتف بديل:</span> <span dir="ltr">${order.customer_phone_2}</span></div>` : ''}
            <div class="info-row"><span class="info-label">العنوان:</span> <span style="text-align: left;">${order.customer_address}</span></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>كود</th>
                <th>الصنف</th>
                <th style="text-align: center;">كمية</th>
                <th style="text-align: left;">سعر</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="total-section">
            <span>المبلغ الإجمالي:</span>
            <span>${order.total_price.toLocaleString()} ج.م</span>
          </div>

          <div class="footer">
            شكراً لثقتكم بمتجر أسماء للأدوات المنزلية<br/>
            نسعد بخدمتكم دائماً • www.asmaa-store.com
          </div>

          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || productForm.price === undefined || productForm.price === null) {
      return alert("يرجى ملء الاسم والسعر");
    }
    
    setIsLoading(true);
    let error;

    // Prepare data for saving - remove metadata fields that shouldn't be updated
    const { id, created_at, ...dataToSave } = productForm as any;
    
    // Ensure numeric fields are valid numbers and not NaN
    const price = Number(dataToSave.price);
    const wholesalePrice = dataToSave.wholesale_price !== undefined && dataToSave.wholesale_price !== null && dataToSave.wholesale_price !== '' 
      ? Number(dataToSave.wholesale_price) 
      : null;

    dataToSave.price = isNaN(price) ? 0 : price;
    dataToSave.wholesale_price = (wholesalePrice === null || isNaN(wholesalePrice)) ? null : wholesalePrice;

    try {
      if (editingProduct) {
        const { error: err } = await supabase.from('products').update(dataToSave).eq('id', editingProduct.id);
        error = err;
      } else {
        const { error: err } = await supabase.from('products').insert([dataToSave]);
        error = err;
      }
      
      if (!error) { 
        setIsModalOpen(false); 
        fetchProducts(); 
        setEditingProduct(null);
        setProductForm({
          name: '', code: '', category: 'أدوات المطبخ', price: 0, wholesale_price: 0, description: '', image: '', images: [], colors: [], is_visible: true
        });
      } else {
        alert("خطأ أثناء الحفظ: " + error.message);
      }
    } catch (err: any) {
      alert("حدث خطأ غير متوقع: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const convertToJpg = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            reject(new Error('Could not get canvas context'));
          }
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const jpgDataUrl = await convertToJpg(file);
      setSiteSettings({ ...siteSettings, hero_image: jpgDataUrl });
    } catch (err) {
      console.error('Error converting image:', err);
      alert('فشل في معالجة الصورة');
    }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean, index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const jpgDataUrl = await convertToJpg(file);
      if (isMain) {
        setProductForm({ ...productForm, image: jpgDataUrl });
      } else if (index !== undefined) {
        const newImages = [...(productForm.images || [])];
        newImages[index] = jpgDataUrl;
        setProductForm({ ...productForm, images: newImages });
      } else {
        setProductForm({ ...productForm, images: [...(productForm.images || []), jpgDataUrl] });
      }
    } catch (err) {
      console.error('Error converting image:', err);
      alert('فشل في معالجة الصورة');
    }
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

  const deleteUser = async (id: string) => {
    if (!confirm('هل أنتِ متأكدة من حذف هذا المستخدم؟')) return;
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (!error) fetchUsers();
  };

  const toggleUserRole = async (user: UserAccount) => {
    if (!user.id) return;
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    
    try {
      const { error } = await supabase.from('users').update({ role: newRole }).eq('id', user.id);
      if (error) throw error;
      await fetchUsers();
    } catch (error: any) {
      console.error('Error toggling user role:', error);
      alert('فشل تغيير صلاحية المستخدم: ' + (error.message || 'خطأ غير معروف'));
    }
  };

  const toggleUserType = async (user: UserAccount) => {
    if (!user.id) return;
    // Handle case where user_type might be null/undefined
    const currentType = user.user_type || 'retail';
    const newType = currentType === 'wholesale' ? 'retail' : 'wholesale';
    
    try {
      const { error } = await supabase.from('users').update({ user_type: newType }).eq('id', user.id);
      if (error) throw error;
      await fetchUsers();
    } catch (error: any) {
      console.error('Error toggling user type:', error);
      alert('فشل تغيير نوع العميل: ' + (error.message || 'خطأ غير معروف'));
    }
  };

  const statusMap = {
    pending: { label: 'جديد', color: 'bg-orange-100 text-orange-600', icon: Clock },
    processing: { label: 'تجهيز', color: 'bg-blue-100 text-blue-600', icon: ClipboardList },
    shipped: { label: 'مشحون', color: 'bg-purple-100 text-purple-600', icon: Truck },
    delivered: { label: 'مستلم', color: 'bg-green-100 text-green-600', icon: CheckCircle },
    cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-600', icon: AlertCircle },
  };

  const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;

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
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-right font-['Tajawal']" dir="rtl">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Logo className="h-7" />
        <button onClick={onLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white border-l shadow-sm hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b"><Logo /></div>
        <nav className="flex-1 p-6 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
            <LayoutDashboard className="w-5 h-5" /> <span className="font-bold">نظرة عامة</span>
          </button>
          <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition ${activeTab === 'products' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Package className="w-5 h-5" /> <span className="font-bold">المخزون</span>
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5" /> <span className="font-bold">الطلبات</span>
            </div>
            {pendingOrdersCount > 0 && (
              <span className={`px-2 py-0.5 text-xs font-black rounded-full ${activeTab === 'orders' ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>
                {pendingOrdersCount}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Users className="w-5 h-5" /> <span className="font-bold">المستخدمين</span>
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

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen no-scrollbar pb-24 md:pb-8 relative">
        {pendingOrdersCount > 0 && activeTab !== 'orders' && (
          <div className="mb-6 bg-orange-50 border border-orange-200 text-orange-800 px-6 py-4 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-xl">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-black text-sm">تنبيه: طلبات جديدة!</h4>
                <p className="text-xs font-bold text-orange-600/80 mt-0.5">يوجد {pendingOrdersCount} طلب قيد الانتظار أو التجهيز بحاجة لمراجعتك.</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('orders')}
              className="px-4 py-2 bg-orange-600 text-white text-xs font-black rounded-xl hover:bg-orange-700 transition shadow-sm"
            >
              عرض الطلبات
            </button>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-[100] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="font-black text-gray-500">جاري تحميل البيانات...</p>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
           <h2 className="text-2xl md:text-3xl font-black">
             {activeTab === 'overview' ? 'إحصائيات المتجر' : activeTab === 'products' ? 'إدارة الأصناف' : activeTab === 'orders' ? 'الطلبات الواردة' : activeTab === 'users' ? 'إدارة المستخدمين' : 'محتوى الواجهة'}
           </h2>
           {activeTab === 'products' && (
             <button onClick={() => { setEditingProduct(null); setProductForm({name: '', code: '', category: 'أدوات المطبخ', price: 0, wholesale_price: 0, description: '', image: '', images: [], colors: [], is_visible: true}); setIsModalOpen(true); }} className="bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg hover:bg-blue-700 transition text-sm md:text-base w-full sm:w-auto justify-center">
               <Plus className="w-5 h-5" /> صنف جديد
             </button>
           )}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border shadow-sm">
              <p className="text-gray-400 font-bold mb-2 text-sm">إجمالي المنتجات</p>
              <h4 className="text-4xl md:text-5xl font-black text-blue-600">{products.length}</h4>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border shadow-sm">
              <p className="text-gray-400 font-bold mb-2 text-sm">إجمالي الطلبات</p>
              <h4 className="text-4xl md:text-5xl font-black text-blue-600">{orders.length}</h4>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border shadow-sm border-orange-100">
              <p className="text-gray-400 font-bold mb-2 text-sm">طلبات بانتظار المراجعة</p>
              <h4 className="text-4xl md:text-5xl font-black text-orange-500">{orders.filter(o => o.status === 'pending').length}</h4>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="ابحثي عن منتج بالاسم أو الوصف..." 
                  className="w-full pl-4 pr-11 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 font-bold transition-all text-sm"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                />
                <Search className="absolute right-4 top-3 text-gray-400 w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border shadow-sm overflow-x-auto no-scrollbar">
               <table className="w-full text-right min-w-[600px]">
                 <thead className="bg-gray-50 border-b">
                   <tr>
                     <th className="px-8 py-5 text-sm font-black text-gray-400">المنتج</th>
                     <th className="px-8 py-5 text-sm font-black text-gray-400">الكود</th>
                     <th className="px-8 py-5 text-sm font-black text-gray-400">الفئة</th>
                     <th className="px-8 py-5 text-sm font-black text-gray-400">سعر القطاعي</th>
                     <th className="px-8 py-5 text-sm font-black text-gray-400">سعر الجملة</th>
                     <th className="px-8 py-5 text-sm font-black text-gray-400">الحالة</th>
                     <th className="px-8 py-5 text-sm font-black text-gray-400 text-center">الإجراءات</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y">
                   {(products || []).filter(p => 
                     (p.name || '').toLowerCase().includes(productSearchQuery.toLowerCase()) || 
                     (p.code || '').toLowerCase().includes(productSearchQuery.toLowerCase()) || 
                     (p.description || '').toLowerCase().includes(productSearchQuery.toLowerCase())
                   ).map(p => (
                     <tr key={p.id} className={`hover:bg-gray-50 transition ${p.is_visible === false ? 'bg-gray-50/50' : ''}`}>
                     <td className="px-8 py-5 flex items-center gap-4 font-black">
                       <img src={p.image || 'https://via.placeholder.com/150'} className="w-14 h-14 rounded-2xl object-cover shadow-sm" alt="" />
                       <span>{p.name}</span>
                     </td>
                     <td className="px-8 py-5 text-sm font-bold text-blue-600">{p.code || '---'}</td>
                     <td className="px-8 py-5 text-sm font-bold text-gray-400">{p.category}</td>
                     <td className="px-8 py-5 text-sm font-black text-blue-600">{p.price.toLocaleString()} ج.م</td>
                     <td className="px-8 py-5 text-sm font-black text-orange-600">{p.wholesale_price?.toLocaleString() || '---'} ج.م</td>
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
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="ابحثي عن طلب بالاسم، الهاتف، أو رقم الطلب..." 
                  className="w-full pl-4 pr-11 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 font-bold transition-all text-sm"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                />
                <Search className="absolute right-4 top-3 text-gray-400 w-5 h-5" />
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white p-20 rounded-[3rem] border text-center flex flex-col items-center gap-4">
                <Package className="w-12 h-12 text-gray-200" />
                <p className="text-gray-400 font-bold">لا توجد طلبات واردة حالياً</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.filter(order => 
                  (order.customer_name || '').toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                  (order.customer_phone || '').includes(orderSearchQuery) ||
                  (order.id || '').toLowerCase().includes(orderSearchQuery.toLowerCase())
                ).length === 0 ? (
                  <div className="bg-white p-10 rounded-[2rem] border text-center">
                    <p className="text-gray-400 font-bold">لا توجد نتائج تطابق بحثك</p>
                  </div>
                ) : (
                  orders.filter(order => 
                    (order.customer_name || '').toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                    (order.customer_phone || '').includes(orderSearchQuery) ||
                    (order.id || '').toLowerCase().includes(orderSearchQuery.toLowerCase())
                  ).map(order => (
                    <div key={order.id} className="bg-white p-8 rounded-[2.5rem] border shadow-sm animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-black text-xl text-blue-600">طلب #{order.id.slice(0,8)}</h4>
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-2 ${statusMap[order.status as keyof typeof statusMap]?.color || 'bg-gray-100'}`}>
                              {statusMap[order.status as keyof typeof statusMap]?.label || order.status}
                            </span>
                          </div>
                          <p className="text-sm font-black text-gray-900">{order.customer_name} • <span className="text-blue-600" dir="ltr">{order.customer_phone}</span></p>
                          {order.customer_phone_2 && <p className="text-xs font-bold text-gray-500 mt-1">رقم بديل: <span dir="ltr">{order.customer_phone_2}</span></p>}
                          <p className="text-xs text-gray-400 font-bold mt-1">{order.customer_address}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handlePrint(order)}
                            className="bg-white border border-gray-200 p-3 rounded-xl text-gray-600 hover:bg-gray-50 transition shadow-sm flex items-center gap-2"
                            title="طباعة الفاتورة"
                          >
                            <Printer className="w-5 h-5" />
                            <span className="text-xs font-bold">طباعة</span>
                          </button>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-gray-400 whitespace-nowrap">تغيير الحالة:</span>
                            <select 
                              value={order.status} 
                              onChange={e => updateOrderStatus(order.id, e.target.value)} 
                              className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer min-w-[120px]"
                            >
                              {Object.keys(statusMap).map(s => <option key={s} value={s}>{statusMap[s as keyof typeof statusMap].label}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                  <div className="bg-gray-50 p-6 rounded-[2rem] space-y-3">
                    {(order.order_items || order.items || []).map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-sm font-bold">
                        <span className="text-gray-700">
                          {item.product_name} 
                          {item.selected_color && <span className="text-[10px] text-blue-500 mr-2">(${item.selected_color})</span>} 
                          <small className="text-blue-500 font-black mr-2">×{item.quantity}</small>
                        </span>
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
      </div>
    )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="ابحثي عن مستخدم بالاسم، البريد، أو الهاتف..." 
                  className="w-full pl-4 pr-11 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 font-bold transition-all text-sm"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                />
                <Search className="absolute right-4 top-3 text-gray-400 w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border shadow-sm overflow-x-auto no-scrollbar">
               <table className="w-full text-right min-w-[800px]">
                 <thead className="bg-gray-50 border-b">
                   <tr>
                     <th className="px-8 py-5 text-sm font-black text-gray-400">المستخدم</th>
                     <th className="px-8 py-5 text-sm font-black text-gray-400">البريد الإلكتروني</th>
                     <th className="px-8 py-5 text-sm font-black text-gray-400">الهاتف</th>
                     <th className="px-8 py-5 text-sm font-black text-gray-400">نوع العميل</th>
                     <th className="px-8 py-5 text-sm font-black text-gray-400">الصلاحية</th>
                     <th className="px-8 py-5 text-sm font-black text-gray-400 text-center">الإجراءات</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y">
                   {(users || []).filter(u => 
                     (u.full_name || '').toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                     (u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                     (u.phone && u.phone.includes(userSearchQuery))
                   ).map(u => (
                     <tr key={u.id} className="hover:bg-gray-50 transition">
                       <td className="px-8 py-5 font-black text-gray-900">{u.full_name}</td>
                       <td className="px-8 py-5 text-sm font-bold text-gray-500">{u.email}</td>
                       <td className="px-8 py-5 text-sm font-bold text-gray-500" dir="ltr">{u.phone || '---'}</td>
                       <td className="px-8 py-5">
                         <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${u.user_type === 'wholesale' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                           {u.user_type === 'wholesale' ? 'جملة' : 'قطاعي'}
                         </span>
                       </td>
                       <td className="px-8 py-5">
                         <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${u.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                           {u.role === 'admin' ? 'مدير' : 'مستخدم'}
                         </span>
                       </td>
                       <td className="px-8 py-5 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button 
                              onClick={() => toggleUserType(u)} 
                              className={`p-3 rounded-xl transition ${u.user_type === 'wholesale' ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}
                              title={u.user_type === 'wholesale' ? 'تغيير لقطاعي' : 'تحويل لجملة'}
                            >
                              {u.user_type === 'wholesale' ? <User className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                            </button>
                            <button 
                              onClick={() => toggleUserRole(u)} 
                              className={`p-3 rounded-xl transition ${u.role === 'admin' ? 'text-purple-600 bg-purple-50 hover:bg-purple-100' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'}`}
                              title={u.role === 'admin' ? 'تغيير لمستخدم' : 'ترقية لمدير'}
                            >
                              <Lock className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => deleteUser(u.id)} 
                              className="p-3 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition"
                              title="حذف المستخدم"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-500">عنوان الواجهة الرئيسي</label>
                  <textarea className="w-full p-4 border rounded-2xl font-bold bg-gray-50 h-24 focus:ring-2 focus:ring-blue-600 outline-none transition" value={siteSettings.hero_title || ''} onChange={e => setSiteSettings({...siteSettings, hero_title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-500">وصف الواجهة الفرعي</label>
                  <textarea className="w-full p-4 border rounded-2xl font-bold bg-gray-50 h-32 focus:ring-2 focus:ring-blue-600 outline-none transition" value={siteSettings.hero_subtitle || ''} onChange={e => setSiteSettings({...siteSettings, hero_subtitle: e.target.value})} />
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
                  <input type="file" ref={heroFileInputRef} className="hidden" accept=".jpg,.jpeg" onChange={handleHeroImageChange} />
                </div>
              </div>
            </div>
            <button onClick={updateSettings} disabled={isLoading} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-xl hover:bg-blue-700 active:scale-95 transition-all">
              {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <Settings className="w-6 h-6" />} تحديث محتوى المتجر
            </button>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t px-2 py-2 flex items-center justify-around z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${activeTab === 'overview' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>
        <button 
          onClick={() => setActiveTab('products')} 
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${activeTab === 'products' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] font-bold">المخزون</span>
        </button>
        <button 
          onClick={() => setActiveTab('orders')} 
          className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition ${activeTab === 'orders' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {pendingOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">الطلبات</span>
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${activeTab === 'users' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-bold">المستخدمين</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')} 
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${activeTab === 'settings' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-bold">الإعدادات</span>
        </button>
      </nav>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-[3rem] p-10 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black mb-8 text-center">{editingProduct ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد'}</h3>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-xs font-black text-gray-400 mr-2">اسم المنتج</label><input type="text" placeholder="مثلاً: طقم حلل جرانيت" className="w-full p-4 border rounded-2xl font-bold bg-gray-50" value={productForm.name || ''} onChange={e => setProductForm({...productForm, name: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-xs font-black text-gray-400 mr-2">كود المنتج</label><input type="text" placeholder="مثلاً: AS-100" className="w-full p-4 border rounded-2xl font-bold bg-gray-50" value={productForm.code || ''} onChange={e => setProductForm({...productForm, code: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-xs font-black text-gray-400 mr-2">سعر القطاعي</label><input type="number" step="0.01" placeholder="0.00" className="w-full p-4 border rounded-2xl font-bold bg-gray-50" value={productForm.price || 0} onChange={e => setProductForm({...productForm, price: e.target.value === '' ? 0 : Number(e.target.value)})} /></div>
                <div className="space-y-1"><label className="text-xs font-black text-gray-400 mr-2">سعر الجملة</label><input type="number" step="0.01" placeholder="0.00" className="w-full p-4 border rounded-2xl font-bold bg-gray-50" value={productForm.wholesale_price || 0} onChange={e => setProductForm({...productForm, wholesale_price: e.target.value === '' ? 0 : Number(e.target.value)})} /></div>
              </div>
              <div className="space-y-1"><label className="text-xs font-black text-gray-400 mr-2">الفئة</label>
                <select className="w-full p-4 border rounded-2xl font-bold bg-gray-50" value={productForm.category || 'أدوات المطبخ'} onChange={e => setProductForm({...productForm, category: e.target.value as any})}>
                  <option>أدوات المطبخ</option><option>الأجهزة الكهربائية</option><option>الديكور</option><option>أواني التقديم</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 mr-2">الصورة الأساسية</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="رابط الصورة..." className="flex-1 p-4 border rounded-2xl font-bold bg-gray-50" value={productForm.image || ''} onChange={e => setProductForm({...productForm, image: e.target.value})} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition"><Upload className="w-6 h-6" /></button>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".jpg,.jpeg" onChange={(e) => handleProductImageUpload(e, true)} />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 mr-2">صور إضافية للمنتج</label>
                <div className="space-y-2">
                  {(productForm.images || []).map((img, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="رابط صورة إضافية..." 
                        className="flex-1 p-3 border rounded-xl font-bold bg-gray-50 text-sm" 
                        value={img || ''} 
                        onChange={e => {
                          const newImages = [...(productForm.images || [])];
                          newImages[idx] = e.target.value;
                          setProductForm({...productForm, images: newImages});
                        }} 
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const newImages = (productForm.images || []).filter((_, i) => i !== idx);
                          setProductForm({...productForm, images: newImages});
                        }}
                        className="p-3 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setProductForm({...productForm, images: [...(productForm.images || []), '']})}
                      className="flex-1 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold text-xs hover:bg-gray-50 transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> إضافة رابط صورة
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.jpg,.jpeg';
                        input.onchange = (e) => handleProductImageUpload(e as any, false);
                        input.click();
                      }}
                      className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition flex items-center justify-center gap-2 font-bold text-xs"
                    >
                      <Upload className="w-4 h-4" /> رفع JPG
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-1"><label className="text-xs font-black text-gray-400 mr-2">وصف المنتج</label><textarea placeholder="اكتبي تفاصيل المنتج..." className="w-full p-4 border rounded-2xl font-bold h-28 bg-gray-50" value={productForm.description || ''} onChange={e => setProductForm({...productForm, description: e.target.value})} /></div>
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
