
import React, { useState } from 'react';
import { Sparkles, Send, X, Bot } from 'lucide-react';
import { getGeminiRecommendation } from '../services/geminiService';

const AISearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse(null);
    const result = await getGeminiRecommendation(query);
    setResponse(result || null);
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-40 flex items-center gap-2 group"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold whitespace-nowrap">
          مساعد أسماء للأدوات المنزلية
        </span>
      </button>

      {/* AI Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">مساعد أسماء الذكي</h2>
                  <p className="text-blue-100 text-sm">اسألني عما تحتاجه لمنزلك وسأقوم بترشيح الأفضل لك</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="مثال: أريد طقم أواني جرانيت لـ 4 أفراد ميزانيتي 4000 جنيه"
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  />
                  <button 
                    disabled={isLoading}
                    className="absolute left-3 top-3 bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </form>

              <div className="min-h-[200px] max-h-[400px] overflow-y-auto bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-blue-600">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="font-bold animate-pulse">جاري التفكير في أفضل الخيارات...</p>
                  </div>
                ) : response ? (
                  <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {response}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center gap-4">
                    <Bot className="w-12 h-12 opacity-20" />
                    <p>أهلاً بك! أنا مساعدك الذكي في متجر أسماء.<br/>كيف يمكنني مساعدتك اليوم؟</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-8 pb-8 flex flex-wrap gap-2">
              <span className="text-xs text-gray-400 w-full mb-1">اقتراحات سريعة:</span>
              {['أفضل قلاية هوائية؟', 'طقم تقديم للعرائس', 'أجهزة مطبخ اقتصادية'].map((txt) => (
                <button 
                  key={txt}
                  onClick={() => setQuery(txt)}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-full transition"
                >
                  {txt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AISearch;
