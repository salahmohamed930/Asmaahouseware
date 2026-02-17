
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Plus, 
  Pencil, 
  Trash2, 
  TrendingUp, 
  LogOut,
  CheckCircle,
  Clock,
  Search
} from 'lucide-react';
import { Product, Order } from '../types';
import { PRODUCTS } from '../constants';
import Logo from './Logo';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const orders: Order[] = [
    { id: '#ORD-1001', customerName: 'أحمد محمد', total: 4500, status: 'pending', date: '2023-10-25', items: 3 },
    { id: '#ORD-1002', customerName: 'سارة محمود', total: 1200, status: 'shipped', date: '2023-10-24', items: 1 },
    { id: '#ORD-1003', customerName: 'ياسين علي', total: 850, status: 'delivered', date: '2023-10-23', items: 2 },
  ];

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      setProducts(products.filter(p => p.id !== id));
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
            className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-bold">الإحصائيات</span>
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition ${activeTab === 'products' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Package className="w-5 h-5" />
            <span className="font-bold">المنتجات</span>
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="font-bold">الطلبات</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-gray-500 hover:bg-gray-100 transition">
            <Users className="w-5 h-5" />
            <span className="font-bold">العملاء</span>
          </button>
        </nav>

        <div className="p-6 border-t">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition font-bold"
          >
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
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <input 
                type="text" 
                placeholder="بحث..." 
                className="pr-10 pl-4 py-2 border border-gray-100 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 border border-blue-200 flex items-center justify-center font-bold text-white">
              أ
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-4">
                  <div className="bg-blue-100 p-4 rounded-2xl text-blue-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-bold">إجمالي المبيعات</p>
                    <h4 className="text-2xl font-black">124,500 ج.م</h4>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-4">
                  <div className="bg-green-100 p-4 rounded-2xl text-green-600">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-bold">عدد المنتجات</p>
                    <h4 className="text-2xl font-black">{products.length} منتج</h4>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-4">
                  <div className="bg-orange-100 p-4 rounded-2xl text-orange-600">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-bold">طلبات جديدة</p>
                    <h4 className="text-2xl font-black">12 طلب</h4>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-4">
                  <div className="bg-purple-100 p-4 rounded-2xl text-purple-600">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-bold">إجمالي العملاء</p>
                    <h4 className="text-2xl font-black">840 عميل</h4>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border shadow-sm">
                  <h3 className="font-black text-xl mb-6">آخر الطلبات</h3>
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                            {order.status === 'delivered' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-bold">{order.customerName}</p>
                            <p className="text-xs text-gray-400">{order.id} • {order.date}</p>
                          </div>
                        </div>
                        <p className="font-black text-blue-600">{order.total} ج.م</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-48 h-48 mb-6">
                    <img src="https://picsum.photos/seed/chart/400/400" className="w-full h-full object-contain opacity-50 grayscale" />
                  </div>
                  <h3 className="font-black text-xl mb-2">رسم بياني للمبيعات</h3>
                  <p className="text-gray-400">تحليل مفصل للمبيعات سيظهر هنا قريباً.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
              <div className="p-6 border-b flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="font-black text-xl text-gray-800">قائمة المخزون</h3>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                  <Plus className="w-5 h-5" />
                  إضافة منتج جديد
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-gray-50 text-gray-500 font-bold border-b">
                    <tr>
                      <th className="px-6 py-4">المنتج</th>
                      <th className="px-6 py-4">الفئة</th>
                      <th className="px-6 py-4">السعر</th>
                      <th className="px-6 py-4">التقييم</th>
                      <th className="px-6 py-4">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img src={product.image} className="w-12 h-12 rounded-lg object-cover" />
                            <span className="font-bold text-gray-800">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black">{product.price.toLocaleString()} ج.م</td>
                        <td className="px-6 py-4 text-yellow-400 font-bold">★ {product.rating}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="p-2 text-gray-400 hover:text-blue-600 transition">
                              <Pencil className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition"
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

          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
               <div className="p-6 border-b">
                <h3 className="font-black text-xl text-gray-800">إدارة الطلبات المباشرة</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-gray-50 text-gray-500 font-bold border-b">
                    <tr>
                      <th className="px-6 py-4">رقم الطلب</th>
                      <th className="px-6 py-4">العميل</th>
                      <th className="px-6 py-4">التاريخ</th>
                      <th className="px-6 py-4">القطع</th>
                      <th className="px-6 py-4">الإجمالي</th>
                      <th className="px-6 py-4">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-bold text-blue-600">{order.id}</td>
                        <td className="px-6 py-4 font-bold">{order.customerName}</td>
                        <td className="px-6 py-4 text-gray-500">{order.date}</td>
                        <td className="px-6 py-4">{order.items} قطع</td>
                        <td className="px-6 py-4 font-black">{order.total.toLocaleString()} ج.م</td>
                        <td className="px-6 py-4">
                          <select className={`px-3 py-1 rounded-full text-xs font-bold border-0 focus:ring-2 focus:ring-blue-500 ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-600' : 
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                          }`}>
                            <option value="pending">قيد الانتظار</option>
                            <option value="shipped">تم الشحن</option>
                            <option value="delivered">تم التوصيل</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-black mb-6">إضافة منتج جديد للمتجر</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">اسم المنتج</label>
                <input type="text" className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="مثلاً: طقم جرانيت" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">السعر (ج.م)</label>
                  <input type="number" className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">الفئة</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>أدوات المطبخ</option>
                    <option>الأجهزة الكهربائية</option>
                    <option>الديكور</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الوصف</label>
                <textarea rows={3} className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="اكتب وصفاً جذاباً للمنتج..."></textarea>
              </div>
              <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 mt-4">
                حفظ ونشر المنتج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
