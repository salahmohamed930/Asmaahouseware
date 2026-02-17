
import React, { useState } from 'react';
import { Sparkles, Send, X, Bot, MessageCircleHeart } from 'lucide-react';
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
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-40 flex items-center gap-2 group border-4 border-white"
      >
        <MessageCircleHeart className="w-6 h-6 animate-pulse" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold whitespace-nowrap">
          اسألي رشا
        </span>
      </button>

      {/* Rasha Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
          
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-blue-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-8 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black">رشا - مساعدتكِ الشخصية</h2>
                  <p className="text-blue-100 text-sm font-medium opacity-90">خبيرة الأدوات المنزلية في متجر أسماء</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                <X className="w-7 h-7" />
              </button>
            </div>

            <div className="p-8">
              {/* Query Form */}
              <form onSubmit={handleSubmit} className="mb-8">
                <div className="relative group">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="مثال: محتاجة طقم حلل عرايس ميزانيتي 5000 ج.م"
                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-lg transition-all"
                  />
                  <button 
                    disabled={isLoading || !query.trim()}
                    className="absolute left-3 top-3 bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 transition-all shadow-lg shadow-blue-200"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </form>

              {/* Chat Response Area */}
              <div className="min-h-[250px] max-h-[450px] overflow-y-auto bg-blue-50/30 rounded-[2rem] p-8 border border-blue-50">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-5 text-blue-600 py-10">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-blue-100 rounded-full" />
                      <div className="absolute inset-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="font-black text-lg animate-pulse">رشا تفكر في أفضل الخيارات لكِ...</p>
                  </div>
                ) : response ? (
                  <div className="prose prose-blue max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed font-medium text-lg">
                    {response}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-10">
                    <div className="bg-white p-5 rounded-full shadow-sm mb-4">
                      <Bot className="w-12 h-12 text-blue-600 opacity-80" />
                    </div>
                    <p className="text-gray-500 text-lg font-bold">
                      أهلاً بكِ! أنا <span className="text-blue-600">رشا</span>.<br/>
                      خبريني، كيف أقدر أساعدكِ اليوم في تجديد مطبخكِ أو منزلكِ؟
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="px-8 pb-10 flex flex-wrap gap-2.5">
              <span className="text-sm font-black text-gray-400 w-full mb-2 mr-2">اقتراحات سريعة:</span>
              {[
                'أفضل أواني غير لاصقة؟', 
                'طقم ملاعق فخم للهدايا', 
                'أجهزة مطبخ أساسية للعروسة'
              ].map((txt) => (
                <button 
                  key={txt}
                  onClick={() => setQuery(txt)}
                  className="text-sm bg-white hover:bg-blue-600 hover:text-white text-gray-600 px-5 py-2.5 rounded-2xl border border-gray-100 shadow-sm transition-all font-bold active:scale-95"
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
