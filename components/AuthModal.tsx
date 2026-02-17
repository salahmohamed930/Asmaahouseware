
import React, { useState } from 'react';
import { X, LogIn, UserPlus, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = isLogin 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (authError) throw authError;
      
      onClose();
      window.location.reload(); // لتحديث حالة المستخدم في التطبيق
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'خطأ في البريد الإلكتروني أو كلمة المرور' : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute left-6 top-6 p-2 hover:bg-gray-100 rounded-full">
          <X className="w-6 h-6 text-gray-400" />
        </button>

        <div className="flex flex-col items-center mb-10">
          <Logo className="h-12 mb-6" />
          <h2 className="text-2xl font-black">{isLogin ? 'أهلاً بعودتكِ' : 'انضمي لعائلة أسماء'}</h2>
          <p className="text-gray-500 font-bold mt-2 text-center text-sm">
            {isLogin ? 'سجلي دخولك لمتابعة طلباتكِ والتسوق بكل سهولة' : 'سجلي حساباً جديداً للتمتع بكافة مميزات المتجر'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute right-4 top-4 w-5 h-5 text-gray-400" />
            <input 
              type="email" 
              required
              placeholder="البريد الإلكتروني"
              className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute right-4 top-4 w-5 h-5 text-gray-400" />
            <input 
              type="password" 
              required
              placeholder="كلمة المرور"
              className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : isLogin ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
            {isLogin ? 'دخول' : 'إنشاء حساب'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-black text-sm hover:underline"
          >
            {isLogin ? 'ليس لديكِ حساب؟ سجلي الآن' : 'لديكِ حساب بالفعل؟ سجلي الدخول'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
