
import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from "../constants";

export const getGeminiRecommendation = async (userQuery: string) => {
  try {
    // التأكد من استخدام مفتاح API من البيئة المحيطة مباشرة
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // تحويل قائمة المنتجات لنص ليتمكن النموذج من فهم المخزون
    const productListString = PRODUCTS.map(p => `- [ID: ${p.id}] ${p.name} (${p.category}) بسعر ${p.price} ج.م`).join('\n');
    
    // بناء الطلب مع تعريف الهوية "رشا"
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `أنتِ "رشا"، المساعدة الذكية المتخصصة في متجر "أسماء للأدوات المنزلية". 
      مهمتك هي مساعدة العميلات والعملاء في اختيار أفضل الأدوات المنزلية وأجهزة المطبخ.
      
      قائمة المنتجات المتوفرة لدينا حالياً:
      ${productListString}
      
      بناءً على طلب العميل التالي: "${userQuery}"
      يرجى الرد بأسلوب ودي، لبق، واحترافي. اقترحي منتجين أو ثلاثة كحد أقصى مع توضيح سبب اختيارك لكل منها بناءً على الميزانية أو الاحتياج المذكور. 
      إذا لم تجدي منتجاً مطابقاً تماماً، اقترحي الأقرب له من فئته.`,
      config: {
        temperature: 0.8,
        topK: 40,
        topP: 0.9,
      }
    });

    // الوصول للرد النصي مباشرة وفقاً لإرشادات SDK
    return response.text;
  } catch (error) {
    console.error("Gemini API Error (Rasha):", error);
    return "عذراً، يبدو أنني أواجه صعوبة بسيطة في الاتصال بالخادم. أنا رشا، وسأكون معكِ فور استقرار الاتصال. يرجى المحاولة مرة أخرى.";
  }
};
