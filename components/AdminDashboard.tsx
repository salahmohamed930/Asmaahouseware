
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, Plus, Trash2, 
  LogOut, Loader2, Palette, Lock, X, ClipboardList, CheckCircle, Truck, Clock, AlertCircle, Upload, Image as ImageIcon
} from 'lucide-react';
import { Product, Order } from '../types';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [session, setSession] = useState<any>(null);
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', 
    category: 'أدوات المطبخ', 
    price: 0, 
    description: '', 
    image: '', 
    images: [], 
    colors: [], 
    rating: 5, 
    reviews: 0
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
    }
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
    }
    setIsLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (data) setProducts(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) fetchOrders();
    else alert('فشل تحديث الحالة');
  };

  const handleAddProduct = async () => {
    if (!newProduct.image && (!newProduct.images || newProduct.images.length === 0)) {
      alert('يرجى إضافة صورة واحدة على الأقل للمنتج');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.from('products').insert([newProduct]);
    setIsLoading(false);
    
    if (!error) {
      setIsAddModalOpen(false);
      setNewProduct({
        name: '', category: 'أدوات المطبخ', price: 0, description: '', image: '', images: [], colors: [], rating: 5, reviews: 0
      });
      fetchProducts();
    } else alert(error.message);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [...(newProduct.images || [])];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
      });
      
      reader.readAsDataURL(file);
      const base64 = await base64Promise;
      newImages.push(base64);
    }

    setNewProduct({
      ...newProduct,
      images: newImages,
      image: newImages[0] // تعيين الصورة الأولى كصورة أساسية تلقائياً
    });
  };

  const removeImage = (index: number) => {
    const updatedImages = [...(newProduct.images || [])];
    updatedImages.splice(index, 1);
    setNewProduct({
      ...newProduct,
      images: updatedImages,
      image: updatedImages.length > 0 ? updatedImages[0] : ''
    });
  };

  const addColor = () => {
    if (!newProduct.colors?.includes(colorInput)) {
      setNewProduct({...newProduct, colors: [...(newProduct.colors || []), colorInput]});
    }
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
            <input 
              type="email" placeholder="البريد الإلكتروني" 
              className="w-full p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold"
              onChange={(e) => setAuthData({...authData, email: e.target.value})}
            />
            <input 
              type="password" placeholder="كلمة المرور" 
              className="w-full p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold"
              onChange={(e) => setAuthData({...authData, password: e.target.value})}
            />
            <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700">
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Lock className="w-5 h-5" />}
              دخول
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
           <h2 className="text-3xl font-black">{activeTab === 'overview' ? 'نظرة عامة' : activeTab === 'products' ? 'إدارة المنتجات' : 'إدارة الطلبات'}</h2>
           {activeTab === 'products' && (
             <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg hover:bg-blue-700 transition">
               <Plus className="w-5 h-5" /> منتج جديد
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
            <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
              <p className="text-gray-500 font-bold mb-2">طلبات بانتظار الشحن</p>
              <h4 className="text-4xl font-black text-orange-500">{orders.filter(o => o.status === 'pending').length}</h4>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
           <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
             <table className="w-full text-right">
               <thead className="bg-gray-50 border-b">
                 <tr>
                   <th className="px-8 py-5">المنتج</th>
                   <th className="px-8 py-5">الفئة</th>
                   <th className="px-8 py-5">السعر</th>
                   <th className="px-8 py-5">الألوان</th>
                   <th className="px-8 py-5 text-center">إجراءات</th>
                 </tr>
               </thead>
               <tbody className="divide-y">
                 {products.map(p => (
                   <tr key={p.id} className="hover:bg-gray-50 transition">
                     <td className="px-8 py-5 flex items-center gap-4">
                       <img src={p.image} className="w-14 h-14 rounded-2xl object-cover shadow-sm" alt="" />
                       <span className="font-black text-gray-800">{p.name}</span>
                     </td>
                     <td className="px-8 py-5 text-sm font-bold text-gray-500">{p.category}</td>
                     <td className="px-8 py-5 font-black text-blue-600">{p.price.toLocaleString()} ج.م</td>
                     <td className="px-8 py-5">
                       <div className="flex gap-1.5">
                         {p.colors?.map(c => <span key={c} className="w-4 h-4 rounded-full border border-gray-200" style={{backgroundColor: c}}></span>)}
                       </div>
                     </td>
                     <td className="px-8 py-5 text-center">
                        <button className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"><Trash2 className="w-5 h-5" /></button>
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
              <div className="bg-white p-20 rounded-[2rem] border text-center text-gray-400">لا يوجد طلبات حالياً</div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white p-8 rounded-[2.5rem] border shadow-sm hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-black mb-1">طلب #{order.id.slice(0, 8)}</h3>
                      <p className="text-gray-500 font-bold text-sm">التاريخ: {new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className={`px-5 py-2 rounded-2xl flex items-center gap-2 font-black text-sm ${statusMap[order.status].color}`}>
                          {React.createElement(statusMap[order.status].icon, { className: 'w-4 h-4' })}
                          {statusMap[order.status].label}
                       </div>
                       <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                        className="bg-gray-100 p-2 rounded-xl text-sm font-bold outline-none"
                       >
                         {Object.keys(statusMap).map(s => <option key={s} value={s}>{statusMap[s as keyof typeof statusMap].label}</option>)}
                       </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-6">
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase mb-3">بيانات العميل</p>
                      <p className="font-black text-gray-800">{order.customer_name}</p>
                      <p className="text-sm font-bold text-gray-600">{order.customer_phone}</p>
                      <p className="text-sm text-gray-500 mt-1">{order.customer_address}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase mb-3">تفاصيل المشتريات</p>
                      <div className="space-y-2">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm font-bold">
                            <span>{item.product_name} x {item.quantity}</span>
                            <span className="text-blue-600">{item.price.toLocaleString()} ج.م</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 flex justify-between font-black text-lg">
                          <span>الإجمالي:</span>
                          <span className="text-blue-600">{order.total_price.toLocaleString()} ج.م</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] p-10 max-h-[90vh] overflow-y-auto no-scrollbar">
            <h3 className="text-2xl font-black mb-8">إضافة منتج جديد للمتجر</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-500">معلومات المنتج</label>
                <input type="text" placeholder="اسم المنتج" className="w-full p-4 border rounded-2xl font-bold bg-gray-50" onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="السعر" className="w-full p-4 border rounded-2xl font-bold bg-gray-50" onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                  <select className="w-full p-4 border rounded-2xl font-bold bg-gray-50" onChange={e => setNewProduct({...newProduct, category: e.target.value as any})}>
                    <option>أدوات المطبخ</option><option>الأجهزة الكهربائية</option><option>الديكور</option><option>أواني التقديم</option>
                  </select>
                </div>
              </div>

              {/* Multiple Images Upload */}
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-500">صور المنتج (يمكنك رفع أكثر من صورة)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-40 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center gap-2 hover:bg-blue-50/50 hover:border-blue-200 cursor-pointer transition-all bg-gray-50/50"
                >
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600"><Upload className="w-6 h-6" /></div>
                  <p className="text-xs font-black text-gray-400">اسحبي الصور هنا أو اضغطي للرفع</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                {newProduct.images && newProduct.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {newProduct.images.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img src={img} className="w-full h-full object-cover rounded-2xl border" alt="" />
                        <button 
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {idx === 0 && (
                          <div className="absolute bottom-1 right-1 bg-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded-md font-bold">الأساسية</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Color Picker Section */}
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2 text-gray-500"><Palette className="w-4 h-4" /> الألوان المتوفرة</label>
                <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-2xl border">
                  <input 
                    type="color" 
                    className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent" 
                    value={colorInput} 
                    onChange={e => setColorInput(e.target.value)} 
                  />
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-xs font-black text-gray-400 dir-ltr">{colorInput.toUpperCase()}</span>
                    <button onClick={addColor} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">إضافة اللون</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newProduct.colors?.map(c => (
                    <span key={c} className="bg-white border border-gray-100 shadow-sm px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-gray-200" style={{backgroundColor: c}}></div>
                      <span className="dir-ltr">{c.toUpperCase()}</span>
                      <X className="w-3 h-3 cursor-pointer text-gray-300 hover:text-red-500" onClick={() => setNewProduct({...newProduct, colors: newProduct.colors?.filter(x => x !== c)})} />
                    </span>
                  ))}
                </div>
              </div>

              <textarea placeholder="وصف تفصيلي للمنتج..." className="w-full p-4 border rounded-2xl font-bold h-32 bg-gray-50" onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
              
              <button 
                onClick={handleAddProduct} 
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg mt-4 shadow-xl shadow-blue-100 flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <Package className="w-6 h-6" />}
                نشر المنتج في المتجر
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
