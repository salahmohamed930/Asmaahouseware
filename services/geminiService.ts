
import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from "../constants";

export const getGeminiRecommendation = async (userQuery: string) => {
  try {
    // Initialize inside the function to be safer in different environments
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing");
    }
    
    const ai = new GoogleGenAI({ apiKey });
    const productListString = PRODUCTS.map(p => `${p.id}: ${p.name} (${p.category}) - ${p.price} EGP`).join('\n');
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `بناءً على طلب المستخدم التالي: "${userQuery}"، يرجى تقديم توصية من قائمة المنتجات المتوفرة لدينا:
      ${productListString}
      
      اجعل الرد ودوداً وباللغة العربية، واقترح أفضل 2-3 منتجات تناسب طلبه مع شرح بسيط لماذا اخترتها.`,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "عذراً، حدث خطأ أثناء محاولة الحصول على توصيات الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.";
  }
};
