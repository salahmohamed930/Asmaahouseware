
import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from "../constants";

export const getGeminiRecommendation = async (userQuery: string) => {
  try {
    // Initializing the Gemini API client using the environment variable directly as per guidelines.
    // Assume process.env.API_KEY is pre-configured and valid.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const productListString = PRODUCTS.map(p => `${p.id}: ${p.name} (${p.category}) - ${p.price} EGP`).join('\n');
    
    // Using 'gemini-3-flash-preview' for basic text-based product recommendation tasks.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `بناءً على طلب المستخدم التالي: "${userQuery}"، يرجى تقديم توصية من قائمة المنتجات المتوفرة لدينا:
      ${productListString}
      
      اجعل الرد ودوداً وباللغة العربية، واقترح أفضل 2-3 منتجات تناسب طلبه مع شرح بسيط لماذا اخترتها.`,
      config: {
        temperature: 0.7,
        topK: 64,
        topP: 0.95,
      }
    });

    // Directly accessing the .text property from GenerateContentResponse (not a method).
    return response.text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "عذراً، حدث خطأ أثناء محاولة الحصول على توصيات الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.";
  }
};
