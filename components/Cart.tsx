
import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, MessageSquare } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, onUpdateQuantity, onRemove }) => {
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [customerData, setCustomerData] = useState({ name: '', phone: '', address: '' });
  
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleWhatsAppCheckout = () => {
    if (!customerData.name || !customerData.phone || !customerData.address) {
      alert('يرجى ملء كافة البيانات لإتمام الطلب');
      return;
    }

    const storePhone = "201000000000"; // استبدل برقم هاتفك الحقيقي
    let message = `*طلب جديد من متجر أسماء*%0A%0A`;
    message += `*الاسم:* ${customerData.name}%0A`;
    message += `*الهاتف:* ${customerData.phone}%0A`;
    message += `*العنوان:* ${customerData.address}%0A%0A`;
    message += `*المنتجات:*%0A`;
    
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name} ${item.selectedColor ? `(لون: ${item.selectedColor})` : ''} x ${item.quantity} = ${(item.price * item.quantity).toLocaleString()} ج.م%0A`;
    });

    message += `%0A*الإجمالي النهائي: ${total.toLocaleString()} ج.م*%0A%0Aشكراً لاختياركم متجر أسماء للأدوات المنزلية.`;
    
    window.open(`https://wa.me/${storePhone}?text=${message}`, '_blank');
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
              {showCheckoutForm ? 'بيانات التوصيل' : 'سلة المشتريات'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!showCheckoutForm ? (
              items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <p className="text-lg">السلة فارغة حالياً</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.selectedColor}`} className="flex gap-4 border-b border-gray-50 pb-4">
                      <img src={item.image} className="w-20 h-20 object-cover rounded-xl" alt="" />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{item.name}</h3>
                        {item.selectedColor && <p className="text-xs text-gray-400 font-bold mb-1">اللون: {item.selectedColor}</p>}
                        <p className="text-blue-600 font-bold mb-2">{item.price.toLocaleString()} ج.م</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center bg-gray-100 rounded-lg px-2">
                            <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 hover:text-blue-600"><Minus className="w-4 h-4" /></button>
                            <span className="w-8 text-center font-bold">{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 hover:text-blue-600"><Plus className="w-4 h-4" /></button>
                          </div>
                          <button onClick={() => onRemove(item.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">الاسم الكامل</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none" 
                    placeholder="مثال: أسماء محمد"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">رقم الهاتف (واتساب)</label>
                  <input 
                    type="tel" 
                    className="w-full p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none text-left" 
                    placeholder="01xxxxxxxxx"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">عنوان التوصيل بالتفصيل</label>
                  <textarea 
                    className="w-full p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none h-32 resize-none" 
                    placeholder="المحافظة، المدينة، اسم الشارع، رقم العقار..."
                    value={customerData.address}
                    onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                  />
                </div>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 border-t bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 font-medium">الإجمالي:</span>
                <span className="text-2xl font-black text-gray-900">{total.toLocaleString()} ج.م</span>
              </div>
              {!showCheckoutForm ? (
                <button 
                  onClick={() => setShowCheckoutForm(true)}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-lg"
                >
                  الاستمرار لبيانات الشحن
                </button>
              ) : (
                <div className="flex gap-2">
                   <button 
                    onClick={() => setShowCheckoutForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-2xl font-bold"
                  >
                    رجوع
                  </button>
                  <button 
                    onClick={handleWhatsAppCheckout}
                    className="flex-[2] bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg"
                  >
                    <MessageSquare className="w-5 h-5" />
                    طلب عبر واتساب
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
