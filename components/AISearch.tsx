
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, MessageCircleHeart, User } from 'lucide-react';
import { getGeminiRecommendation } from '../services/geminiService';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const AISearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // التمرير التلقائي لآخر رسالة
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatHistory, isLoading]);

  const handleSubmit = async (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();
    
    const messageText = textOverride || query;
    if (!messageText.trim() || isLoading) return;

    // 1. إضافة رسالة المستخدم للمحادثة وتفريغ الصندوق
    const userMessage: Message = { role: 'user', text: messageText };
    setChatHistory(prev => [...prev, userMessage]);
    setQuery(''); // مسح صندوق الكتابة فوراً
    setIsLoading(true);

    try {
      // 2. جلب رد رشا
      const result = await getGeminiRecommendation(messageText);
      const botMessage: Message = { role: 'bot', text: result || "عذراً، لم أستطع فهم ذلك." };
      
      // 3. إضافة رد رشا للمحادثة
      setChatHistory(prev => [...prev, botMessage]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'bot', text: "حدث خطأ ما، يرجى المحاولة لاحقاً." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSuggestion = (text: string) => {
    handleSubmit(undefined, text);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-[120] flex items-center gap-2 group border-4 border-white"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircleHeart className="w-6 h-6 animate-pulse" />}
        {!isOpen && (
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold whitespace-nowrap">
            اسألي رشا
          </span>
        )}
      </button>

      {/* Rasha Floating Window */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-[120] w-[90vw] max-w-[380px] animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-blue-100 flex flex-col h-[550px] max-h-[70vh]">
            
            {/* Compact Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black leading-none">رشا</h2>
                  <p className="text-[10px] text-blue-100 font-medium opacity-80 mt-1">مساعدتكِ في متجر أسماء</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Content Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 bg-blue-50/20 space-y-6 no-scrollbar"
            >
              {/* Initial Bot Greeting */}
              {chatHistory.length === 0 && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tr-none shadow-sm border border-blue-50 max-w-[85%]">
                    <p className="text-sm font-bold text-gray-700 leading-relaxed">
                      أهلاً بكِ! أنا رشا، خبيرتكِ في الأدوات المنزلية. كيف يمكنني مساعدتكِ اليوم؟
                    </p>
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-white shadow-sm border border-blue-50'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[85%] shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tl-none' 
                      : 'bg-white text-gray-700 border border-blue-50 rounded-tr-none'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-white shadow-sm border border-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tr-none shadow-sm border border-blue-50">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions (Appear only if no conversation started or after an answer) */}
            {!isLoading && (
              <div className="px-4 py-2 flex flex-wrap gap-2 bg-white border-t border-gray-50 overflow-x-auto no-scrollbar">
                {['أطقم حلل', 'أجهزة مطبخ', 'هدايا عروسة'].map((txt) => (
                  <button 
                    key={txt}
                    onClick={() => handleQuickSuggestion(txt)}
                    className="text-[10px] bg-gray-50 hover:bg-blue-50 text-gray-600 px-3 py-1.5 rounded-full border border-gray-100 transition-all font-bold whitespace-nowrap"
                  >
                    {txt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="اسألي رشا..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold transition-all"
                />
                <button 
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="absolute left-2 top-2 bg-blue-600 text-white p-1.5 rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-all shadow-md shadow-blue-100"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AISearch;
