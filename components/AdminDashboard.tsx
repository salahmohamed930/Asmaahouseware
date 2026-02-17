
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  TrendingUp, 
  LogOut,
  Loader2,
  Image as ImageIcon,
  Link as LinkIcon,
  Fingerprint
} from 'lucide-react';
import { Product, Order } from '../types';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    id: undefined,
    name: '',
    category: 'أدوات المطبخ',
    price: 0,
    description: '',
    image: '',
    rating: 5,
    reviews: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
    if (data) setProducts(data);
    setIsLoading(false);
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) fetchProducts();
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.id || !newProduct.name || !newProduct.price || !newProduct.image) {
      alert('برجاء ملء جميع الحقول الأساسية (ID المنتج، الاسم، السعر، ورابط الصورة)');
      return;
    }

    // التحقق من أن الـ ID غير مكرر محلياً قبل الإرسال
    if (products.some(p => p.id === newProduct.id)) {
      alert('هذا الـ ID موجود مسبقاً لمنتج آخر، يرجى اختيار رقم مختلف.');
      return;
    }

    const { error } = await supabase.from('products').insert([newProduct]);
    if (!error) {
      setIsAddModalOpen(false);
      setNewProduct({
        id: undefined,
        name: '',
        category: 'أدوات المطبخ',
        price: 0,
        description: '',
        image: '',
        rating: 5,
        reviews: 0
      });
      fetchProducts();
    } else {
      console.error(error);
      alert('حدث خطأ أثناء الإضافة: ' + error.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-right" dir="rtl">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-l shadow-sm hidden md:flex flex-col">
        <div className="p-8 border-b">
          <Logo />
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-bold">الإحصائيات</span>
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition ${activeTab === 'products' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Package className="w-5 h-5" />
            <span className="font-bold">المنتجات</span>
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="font-bold">الطلبات</span>
          </button>
        </nav>

        <div className="p-6 border-t">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition font-bold">
            <LogOut className="w-5 h-5" />
            خروج من الإدارة
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b p-6 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-2xl font-black text-gray-800">
            {activeTab === 'overview' && 'نظرة عامة'}
            {activeTab === 'products' && 'إدارة المنتجات'}
            {activeTab === 'orders' && 'سجل الطلبات'}
          </h2>
        </header>

        <div className="p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-blue-600">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-bold">جاري تحميل البيانات من Supabase...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-4">
                    <div className="bg-blue-100 p-4 rounded-2xl text-blue-600"><TrendingUp className="w-6 h-6" /></div>
                    <div>
                      <p className="text-gray-400 text-sm font-bold">إجمالي المنتجات</p>
                      <h4 className="text-2xl font-black">{products.length}</h4>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
                  <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                    <div>
                      <h3 className="font-black text-xl text-gray-800">إدارة المخزون</h3>
                      <p className="text-sm text-gray-500 font-bold mt-1">المعرفات (IDs) يتم إدخالها يدوياً الآن</p>
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95">
                      <Plus className="w-5 h-5" /> إضافة منتج جديد
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead className="bg-gray-50 text-gray-500 border-b">
                        <tr>
                          <th className="px-6 py-5 font-black">المعرف (ID)</th>
                          <th className="px-6 py-5 font-black">المنتج</th>
                          <th className="px-6 py-5 font-black">الفئة</th>
                          <th className="px-6 py-5 font-black">السعر</th>
                          <th className="px-6 py-5 font-black">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {products.map(product => (
                          <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-black text-gray-400 text-lg">
                              #{product.id}
                            </td>
                            <td className="px-6 py-4 flex items-center gap-4">
                              <img src={product.image} className="w-14 h-14 rounded-xl object-cover shadow-sm bg-gray-100" alt={product.name} />
                              <div>
                                <div className="font-black text-gray-800">{product.name}</div>
                                <div className="text-xs text-gray-400 font-bold mt-0.5">مضافة في: {new Date(product.created_at || '').toLocaleDateString('ar-EG')}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">
                                {product.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-black text-blue-600">{product.price.toLocaleString()} ج.م</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleDeleteProduct(product.id)} 
                                  className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                                  title="حذف المنتج"
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
            </>
          )}
        </div>
      </main>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900">إضافة منتج جديد (ID يدوي)</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1">
                  <label className="text-sm font-black text-gray-700 mr-2 flex items-center gap-1">
                    <Fingerprint className="w-4 h-4" /> المعرف (ID)
                  </label>
                  <input 
                    type="number" placeholder="مثلاً: 101" 
                    className="w-full px-5 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-black text-blue-600"
                    value={newProduct.id || ''}
                    onChange={(e) => setNewProduct({...newProduct, id: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-black text-gray-700 mr-2">اسم المنتج</label>
                  <input 
                    type="text" placeholder="مثال: طقم حلل جرانيت" 
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700 mr-2">السعر (جنيه)</label>
                  <input 
                    type="number" placeholder="0" 
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700 mr-2">الفئة</label>
                  <select 
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold appearance-none"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value as any})}
                  >
                    <option>أدوات المطبخ</option>
                    <option>الأجهزة الكهربائية</option>
                    <option>الديكور</option>
                    <option>أواني التقديم</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 mr-2 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" /> رابط صورة المنتج (URL)
                </label>
                <input 
                  type="text" placeholder="https://example.com/image.jpg" 
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 mr-2">وصف المنتج</label>
                <textarea 
                  placeholder="وصف تفصيلي للمنتج..." 
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold h-24 resize-none"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>

              <button 
                onClick={handleAddProduct} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 transition-all active:scale-95"
              >
                تأكيد الإضافة بالـ ID المحدد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
