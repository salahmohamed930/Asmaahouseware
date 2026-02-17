
import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, CheckCircle2, Loader2, Tag, Banknote } from 'lucide-react';
import { CartItem, UserProfile, CategoryData } from '../types';
import { supabase } from '../lib/supabase';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  userProfile?: UserProfile | null;
  categories: CategoryData[];
  onUpdateQuantity: (id: number, color: string | undefined, delta: number) => void;
  onRemove: (id: number, color: string | undefined) => void;
  onClear: () => void;
  onOpenLogin?: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, userProfile, categories, onUpdateQuantity, onRemove, onClear, onOpenLogin }) => {
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [customerData, setCustomerData] = useState({ name: '', phone: '', phone2: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // احتساب الإجمالي مع سعر الجملة وخصومات الأقسام
  const subTotal = items.reduce((sum, item) => {
    const priceToUse = (userProfile?.is_wholesale && item.wholesale_price) ? item.wholesale_price : item.price;
    const categoryInfo = categories.find(c => c.name === item.category);
    const categoryDiscount = categoryInfo?.discount_percent || 0;
    const itemTotal = priceToUse * item.quantity;
    const discountedItemTotal = itemTotal - (itemTotal * (categoryDiscount / 100));
    return sum + discountedItemTotal;
  }, 0);

  // احتساب خصم المستخدم الخاص للطلب القادم
  let finalTotal = subTotal;
  let userDiscountAmount = 0;
  if (userProfile && userProfile.next_order_discount_value > 0) {
    if (userProfile.next_order_discount_type === 'percent') {
      userDiscountAmount = (subTotal * (userProfile.next_order_discount_value / 100));
    } else {
      userDiscountAmount = userProfile.next_order_discount_value;
    }
    finalTotal = Math.max(0, subTotal - userDiscountAmount);
  }

  useEffect(() => {
    if (userProfile) {
      setCustomerData({
        name: userProfile.full_name,
        phone: userProfile.phone,
        phone2: '',
        address: userProfile.address
      });
    }
  }, [userProfile]);

  const handleConfirmOrder = async () => {
    if (!userProfile) return alert('يرجى تسجيل الدخول');
    setIsSubmitting(true);
    try {
      const { data: order, error: orderError } = await supabase.from('orders').insert([{
        user_id: userProfile.id,
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        customer_phone_2: customerData.phone2,
        customer_address: customerData.address,
        total_price: finalTotal,
        discount_applied: userDiscountAmount,
        status: 'pending'
      }]).select().single();

      if (orderError) throw orderError;

      // تصفير خصم المستخدم بعد استخدامه
      if (userDiscountAmount > 0) {
        await supabase.from('profiles').update({ 
          next_order_discount_value: 0, 
          next_order_discount_type: 'fixed' 
        }).eq('id', userProfile.id);
      }

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_name: item.name,
        quantity: item.quantity,
        price: (userProfile?.is_wholesale && item.wholesale_price) ? item.wholesale_price : item.price,
        selected_color: item.selectedColor
      }));

      await supabase.from('order_items').insert(orderItems);
      setIsSuccess(true);
      onClear();
      setTimeout(() => { setIsSuccess(false); onClose(); }, 3000);
    } catch (e: any) { alert(e.message); }
    finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-black flex items-center gap-2"><ShoppingBag className="text-blue-600"/> سلة المشتريات</h2>
          <button onClick={onClose}><X/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.map((item, idx) => {
            const priceToUse = (userProfile?.is_wholesale && item.wholesale_price) ? item.wholesale_price : item.price;
            const catDiscount = categories.find(c => c.name === item.category)?.discount_percent || 0;
            return (
              <div key={idx} className="flex gap-4 border-b pb-4">
                <img src={item.image} className="w-16 h-16 object-cover rounded-xl" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-blue-600 font-black">{priceToUse.toLocaleString()} ج.م</span>
                    {catDiscount > 0 && <span className="text-[9px] bg-red-50 text-red-500 p-1 rounded font-black">خصم قسم -{catDiscount}%</span>}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-gray-50 px-2 py-1 rounded-lg">
                      <button onClick={() => onUpdateQuantity(item.id, item.selectedColor, -1)}><Minus className="w-3 h-3"/></button>
                      <span className="font-black text-xs">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, item.selectedColor, 1)}><Plus className="w-3 h-3"/></button>
                    </div>
                    <button onClick={() => onRemove(item.id, item.selectedColor)} className="text-red-400"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-gray-50 space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>الإجمالي قبل الخصم:</span>
              <span>{subTotal.toLocaleString()} ج.م</span>
            </div>
            {userDiscountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600 font-bold">
                <span className="flex items-center gap-1"><Tag className="w-3 h-3"/> خصمك الخاص:</span>
                <span>-{userDiscountAmount.toLocaleString()} ج.م</span>
              </div>
            )}
            <div className="flex justify-between text-2xl font-black text-blue-600 border-t pt-3">
              <span>المجموع:</span>
              <span>{finalTotal.toLocaleString()} ج.م</span>
            </div>
            {!showCheckoutForm ? (
              <button onClick={() => setShowCheckoutForm(true)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg">إتمام الطلب</button>
            ) : (
              <button disabled={isSubmitting} onClick={handleConfirmOrder} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin"/> : 'تأكيد الطلب'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
