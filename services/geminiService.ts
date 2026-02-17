
import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from "../constants";

export const getGeminiRecommendation = async (userQuery: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // تحويل المنتجات مع الوصف الكامل لتعزيز قدرة رشا على البيع
    const productListString = PRODUCTS.map(p => 
      `- [${p.name}]: ${p.description}. السعر: ${p.price} ج.م. الفئة: ${p.category}.`
    ).join('\n');
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `أنتِ "رشا"، خبيرة المبيعات والمستشارة الأكثر لباقة في متجر "أسماء للأدوات المنزلية". 
      هدفك الأساسي هو مساعدة العميلات على اختيار الأدوات التي تجعل حياتهن أسهل وزيادة مبيعات المتجر من خلال إبراز جودة وفوائد المنتجات.
      
      استخدمي أوصاف المنتجات التالية للإقناع:
      ${productListString}
      
      تعليمات الرد:
      1. كوني ودودة جداً واستخدمي كلمات مثل "يا ست الكل"، "يا فندم"، "نورتي متجرنا".
      2. لا تكتفي بذكر اسم المنتج، بل اذكري كيف سيفيد العميل (مثلاً: "هذا الطقم سيوفر عليكي مجهود التنظيف لأنه غير لاصق").
      3. إذا سألت عن شيء غير موجود، حاولي تقديم بديل ذكي من المتوفر مع ذكر مميزاته.
      4. شجعي العميل على إضافة المنتج للسلة الآن لضمان توفر الكمية.
      5. اجعلي الرد مختصراً وجذاباً في شكل نقاط.

      سؤال العميل: "${userQuery}"`,
      config: {
        temperature: 0.85,
        topK: 64,
        topP: 0.95,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error (Rasha):", error);
    return "عذراً يا فندم، واجهت مشكلة بسيطة في الاتصال. أنا رشا، وبإمكانك سؤالي مرة أخرى وسأكون في خدمتك فوراً!";
  }
};
