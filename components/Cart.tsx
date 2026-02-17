
import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, CheckCircle2, LogIn, Loader2, Phone } from 'lucide-react';
import { CartItem } from '../types';
import { supabase } from '../lib/supabase';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, color: string | undefined, delta: number) => void;
  onRemove: (id: number, color: string | undefined) => void;
  onClear: () => void;
  onOpenLogin?: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, onUpdateQuantity, onRemove, onClear, onOpenLogin }) => {
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [customerData, setCustomerData] = useState({ name: '', phone: '', phone2: '', address: '' });
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        setCustomerData({
          name: data.user.user_metadata?.full_name || '',
          phone: data.user.user_metadata?.phone || '',
          phone2: '',
          address: data.user.user_metadata?.address || ''
        });
      }
    };
    if (isOpen) fetchUser();
  }, [isOpen]);

  const handleConfirmOrder = async () => {
    if (!user) return alert('يرجى تسجيل الدخول لإتمام الطلب');
    if (!customerData.name || !customerData.phone || !customerData.address) {
      alert('يرجى ملء البيانات الأساسية للتوصيل');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          customer_name: customerData.name,
          customer_phone: customerData.phone,
          customer_phone_2: customerData.phone2,
          customer_address: customerData.address,
          total_price: total,
          status: 'pending'
        }])
        .select().single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        selected_color: item.selectedColor
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      setIsSuccess(true);
      onClear();
      setTimeout(() => {
        setIsSuccess(false);
        setShowCheckoutForm(false);
        onClose();
      }, 4000);

    } catch (error: any) {
      alert('حدث خطأ في إرسال الطلب: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
              {isSuccess ? 'تم الطلب بنجاح' : showCheckoutForm ? 'بيانات التوصيل' : 'سلة المشتريات'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-6">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce"><CheckCircle2 className="w-12 h-12" /></div>
                <div><h3 className="text-2xl font-black text-gray-900 mb-2">طلبك قيد المراجعة!</h3><p className="text-gray-500 font-medium px-8 leading-relaxed text-sm">شكراً لثقتك بمتجر أسماء. سنتصل بكِ فوراً لتأكيد الموعد.</p></div>
              </div>
            ) : !user ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-6 p-8">
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600"><ShoppingBag className="w-10 h-10" /></div>
                <div><h3 className="text-xl font-black mb-2">تسجيل الدخول مطلوب</h3><p className="text-gray-500 text-sm mb-8">يجب تسجيل الدخول لتتمكني من إتمام الشراء.</p><button onClick={onOpenLogin} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all">دخول / إنشاء حساب</button></div>
              </div>
            ) : !showCheckoutForm ? (
              items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4"><ShoppingBag className="w-16 h-16 opacity-20" /><p className="text-lg">السلة فارغة حالياً</p></div>
              ) : (
                <div className="space-y-6">
                  {items.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex gap-4 border-b border-gray-50 pb-4">
                      <img src={item.image} className="w-20 h-20 object-cover rounded-xl shadow-sm" alt="" />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                        <p className="text-blue-600 font-black text-sm my-1">{item.price.toLocaleString()} ج.م</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-gray-50 rounded-xl px-2 border">
                            <button onClick={() => onUpdateQuantity(item.id, item.selectedColor, -1)} className="p-1.5 hover:text-blue-600 transition"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.id, item.selectedColor, 1)} className="p-1.5 hover:text-blue-600 transition"><Plus className="w-3.5 h-3.5" /></button>
                          </div>
                          <button onClick={() => onRemove(item.id, item.selectedColor)} className="text-gray-300 hover:text-red-500 transition"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="space-y-5 py-2">
                <div className="space-y-2"><label className="text-sm font-black text-gray-700">الاسم بالكامل</label><input type="text" className="w-full p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold" value={customerData.name} onChange={(e) => setCustomerData({...customerData, name: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-sm font-black text-gray-700">رقم الهاتف</label><input type="tel" className="w-full p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none text-left font-bold" value={customerData.phone} onChange={(e) => setCustomerData({...customerData, phone: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-sm font-black text-gray-700">العنوان بالتفصيل</label><textarea className="w-full p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none h-28 resize-none font-bold" value={customerData.address} onChange={(e) => setCustomerData({...customerData, address: e.target.value})} /></div>
              </div>
            )}
          </div>

          {items.length > 0 && !isSuccess && user && (
            <div className="p-6 border-t bg-gray-50/50 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4"><span className="text-gray-500 font-bold text-sm">المبلغ الإجمالي:</span><span className="text-2xl font-black text-blue-600">{total.toLocaleString()} ج.م</span></div>
              {!showCheckoutForm ? (
                <button onClick={() => setShowCheckoutForm(true)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-100">إتمام الطلب</button>
              ) : (
                <div className="flex gap-2">
                  <button disabled={isSubmitting} onClick={() => setShowCheckoutForm(false)} className="flex-1 bg-white border border-gray-200 text-gray-700 py-4 rounded-2xl font-black">رجوع</button>
                  <button disabled={isSubmitting} onClick={handleConfirmOrder} className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تأكيد وشراء'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
