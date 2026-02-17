
import React, { useState } from 'react';
import { X, LogIn, UserPlus, Mail, Lock, Loader2, AlertCircle, Phone, MapPin, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setError('كلمات المرور غير متطابقة');
        return;
      }
      if (formData.password.length < 6) {
        setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (authError) throw authError;
        onClose();
        window.location.reload();
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              phone: formData.phone,
              address: formData.address,
            }
          }
        });

        if (authError) throw authError;
        
        // عند نجاح التسجيل، نقوم بإغلاق النافذة (عادة ما يرسل Supabase بريد تأكيد تلقائياً إذا كان مفعلاً)
        alert('تم إنشاء الحساب بنجاح! يمكنكِ الآن تسجيل الدخول.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'بيانات الدخول غير صحيحة' : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-xl rounded-[3rem] p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
        <button onClick={onClose} className="absolute left-8 top-8 p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
          <X className="w-6 h-6 text-gray-400" />
        </button>

        <div className="flex flex-col items-center mb-8 text-center">
          <Logo className="h-12 mb-6" />
          <h2 className="text-3xl font-black text-gray-900">{isLogin ? 'أهلاً بعودتكِ' : 'انضمي لعائلة أسماء'}</h2>
          <p className="text-gray-500 font-bold mt-2 text-sm max-w-xs leading-relaxed">
            {isLogin 
              ? 'سجلي دخولك لمتابعة طلباتكِ وأحدث عروضنا الحصرية' 
              : 'أنشئي حسابكِ الآن لتتمتعي بتجربة تسوق فريدة ومتابعة طلبياتكِ بسهولة'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-in shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="relative group">
                <User className="absolute right-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input type="text" name="fullName" required placeholder="الاسم بالكامل" className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold transition-all" value={formData.fullName} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <Phone className="absolute right-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input type="tel" name="phone" required placeholder="رقم الهاتف" className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold transition-all text-left" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="relative group">
                  <MapPin className="absolute right-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input type="text" name="address" required placeholder="العنوان بالتفصيل" className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold transition-all" value={formData.address} onChange={handleChange} />
                </div>
              </div>
            </>
          )}
          <div className="relative group">
            <Mail className="absolute right-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input type="email" name="email" required placeholder="البريد الإلكتروني" className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold transition-all" value={formData.email} onChange={handleChange} />
          </div>
          <div className="relative group">
            <Lock className="absolute right-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input type="password" name="password" required placeholder="كلمة المرور" className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold transition-all" value={formData.password} onChange={handleChange} />
          </div>
          {!isLogin && (
            <div className="relative group">
              <Lock className="absolute right-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input type="password" name="confirmPassword" required placeholder="تأكيد كلمة المرور" className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold transition-all" value={formData.confirmPassword} onChange={handleChange} />
            </div>
          )}
          <button disabled={isLoading} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all disabled:opacity-50 active:scale-95">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isLogin ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />)}
            {isLogin ? 'دخول للمتجر' : 'إنشاء حساب جديد'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="text-blue-600 font-black text-sm hover:underline">
            {isLogin ? 'ليس لديكِ حساب؟ انضمي إلينا الآن' : 'لديكِ حساب بالفعل؟ سجلي الدخول'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
