
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, Plus, Trash2, 
  TrendingUp, LogOut, Loader2, Image as ImageIcon, 
  Link as LinkIcon, Fingerprint, Palette, Lock, X
} from 'lucide-react';
import { Product } from '../types';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [session, setSession] = useState<any>(null);
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [activeTab, setActiveTab] = useState<'overview' | 'products'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', category: 'أدوات المطبخ', price: 0, description: '', image: '', colors: [], rating: 5, reviews: 0
  });
  const [colorInput, setColorInput] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    if (session) fetchProducts();
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
    }
    setIsLoading(false);
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (data) setProducts(data);
    setIsLoading(false);
  };

  const handleAddProduct = async () => {
    const { error } = await supabase.from('products').insert([newProduct]);
    if (!error) {
      setIsAddModalOpen(false);
      fetchProducts();
    } else alert(error.message);
  };

  const addColor = () => {
    if (colorInput.trim() && !newProduct.colors?.includes(colorInput.trim())) {
      setNewProduct({...newProduct, colors: [...(newProduct.colors || []), colorInput.trim()]});
      setColorInput('');
    }
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
    <div className="flex min-h-screen bg-gray-50 text-right" dir="rtl">
      <aside className="w-72 bg-white border-l shadow-sm hidden md:flex flex-col">
        <div className="p-8 border-b"><Logo /></div>
        <nav className="flex-1 p-6 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
            <LayoutDashboard className="w-5 h-5" /> <span className="font-bold">الإحصائيات</span>
          </button>
          <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
            <Package className="w-5 h-5" /> <span className="font-bold">المنتجات</span>
          </button>
        </nav>
        <div className="p-6 border-t">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-red-500 font-bold hover:bg-red-50">
            <LogOut className="w-5 h-5" /> خروج
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-2xl font-black">{activeTab === 'overview' ? 'نظرة عامة' : 'إدارة المنتجات'}</h2>
           {activeTab === 'products' && (
             <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2">
               <Plus className="w-5 h-5" /> منتج جديد
             </button>
           )}
        </div>

        {activeTab === 'products' && (
           <div className="bg-white rounded-3xl border overflow-hidden">
             <table className="w-full">
               <thead className="bg-gray-50 border-b">
                 <tr>
                   <th className="px-6 py-4">المنتج</th>
                   <th className="px-6 py-4">الفئة</th>
                   <th className="px-6 py-4">السعر</th>
                   <th className="px-6 py-4">الألوان</th>
                   <th className="px-6 py-4">حذف</th>
                 </tr>
               </thead>
               <tbody className="divide-y">
                 {products.map(p => (
                   <tr key={p.id} className="hover:bg-gray-50">
                     <td className="px-6 py-4 flex items-center gap-3">
                       <img src={p.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
                       <span className="font-bold">{p.name}</span>
                     </td>
                     <td className="px-6 py-4 text-sm font-bold">{p.category}</td>
                     <td className="px-6 py-4 font-black text-blue-600">{p.price} ج.م</td>
                     <td className="px-6 py-4">
                       <div className="flex gap-1">
                         {p.colors?.map(c => <span key={c} className="w-3 h-3 rounded-full border" style={{backgroundColor: c}}></span>)}
                       </div>
                     </td>
                     <td className="px-6 py-4">
                        <button className="text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}
      </main>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] p-10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black mb-8">إضافة منتج جديد</h3>
            <div className="space-y-4">
              <input type="text" placeholder="اسم المنتج" className="w-full p-4 border rounded-2xl font-bold" onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="السعر" className="w-full p-4 border rounded-2xl font-bold" onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                <select className="w-full p-4 border rounded-2xl font-bold" onChange={e => setNewProduct({...newProduct, category: e.target.value as any})}>
                  <option>أدوات المطبخ</option><option>الأجهزة الكهربائية</option><option>الديكور</option><option>أواني التقديم</option>
                </select>
              </div>
              <input type="text" placeholder="رابط الصورة الأساسية" className="w-full p-4 border rounded-2xl font-bold" onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
              
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2"><Palette className="w-4 h-4" /> الألوان المتوفرة</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="اسم اللون أو كود (مثل: أحمر)" className="flex-1 p-4 border rounded-2xl font-bold" value={colorInput} onChange={e => setColorInput(e.target.value)} />
                  <button onClick={addColor} className="bg-gray-100 px-6 rounded-2xl font-bold hover:bg-gray-200">إضافة لون</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newProduct.colors?.map(c => (
                    <span key={c} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                      {c} <X className="w-3 h-3 cursor-pointer" onClick={() => setNewProduct({...newProduct, colors: newProduct.colors?.filter(x => x !== c)})} />
                    </span>
                  ))}
                </div>
              </div>

              <textarea placeholder="وصف المنتج" className="w-full p-4 border rounded-2xl font-bold h-32" onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
              <button onClick={handleAddProduct} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg mt-4">إضافة المنتج للمتجر</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
