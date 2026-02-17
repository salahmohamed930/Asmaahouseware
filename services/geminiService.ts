
import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

export const getGeminiRecommendation = async (userQuery: string, products: Product[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // تحويل المنتجات الحالية إلى نص لتدريب رشا عليها لحظياً
    const productListString = products.map(p => 
      `- [${p.name}]: ${p.description}. السعر: ${p.price} ج.م. الفئة: ${p.category}.`
    ).join('\n');
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `أنتِ "رشا"، خبيرة المبيعات والمستشارة الأكثر لباقة في متجر "أسماء للأدوات المنزلية". 
      مهمتكِ هي مساعدة العميلات على تحويل بيوتهن إلى قصور بأقل مجهود وأفضل ذوق.
      
      استخدمي هذه المنتجات المتوفرة حالياً في المتجر:
      ${productListString}
      
      استراتيجية الرد (هدفكِ زيادة المبيعات):
      1. الود واللباقة: ابدأي بـ "أهلاً يا فندم"، "نورتينا يا ست الكل".
      2. الإقناع بالفوائد: لا تذكري السعر فقط، بل اشرحي كيف سيغير المنتج حياة العميلة (مثلاً: "القلاية الهوائية ستجعلكِ تحضرين طعاماً صحياً لأولادكِ في دقائق").
      3. الترشيح الذكي: إذا سألت عن شيء، اقترحي منتجاً مكملاً له (مثلاً: "إذا كنتِ ستأخذين طقم الحلل، أنصحكِ بطقم الملاعق الفاخر ليكتمل جمال مطبخكِ").
      4. الندرة: اذكري أن "الكمية محدودة" أو "هذا المنتج هو الأكثر مبيعاً عندنا".
      5. اجعلي الرد في نقاط منظمة وجذابة.

      سؤال العميل: "${userQuery}"`,
      config: {
        temperature: 0.8,
        topK: 64,
        topP: 0.95,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error (Rasha):", error);
    return "عذراً يا فندم، الضغط كبير على المتجر حالياً! أنا رشا، وبإمكانك سؤالي مرة أخرى وسأعطيكِ أفضل العروض فوراً!";
  }
};
