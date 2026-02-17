
import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "طقم أواني طهي جرانيت 10 قطع",
    category: "أدوات المطبخ",
    price: 3500,
    description: "طقم جرانيت كوري عالي الجودة، غير لاصق وسهل التنظيف.",
    image: "https://picsum.photos/seed/pots/600/600",
    rating: 4.8,
    reviews: 124
  },
  {
    id: 2,
    name: "خلاط كهربائي تورنيدو 500 واط",
    category: "الأجهزة الكهربائية",
    price: 1200,
    description: "خلاط قوي مع مطحنة مدمجة وسرعات متعددة.",
    image: "https://picsum.photos/seed/blender/600/600",
    rating: 4.5,
    reviews: 89
  },
  {
    id: 3,
    name: "طقم ملاعق وسكاكين فاخر 24 قطعة",
    category: "أواني التقديم",
    price: 850,
    description: "ستانلس ستيل عيار 18/10 بتصميم عصري وأنيق.",
    image: "https://picsum.photos/seed/cutlery/600/600",
    rating: 4.9,
    reviews: 56
  },
  {
    id: 4,
    name: "قلاية هوائية فيليبس XL",
    category: "الأجهزة الكهربائية",
    price: 4800,
    description: "قلاية هوائية بدون زيت لطهي صحي ومقرمش.",
    image: "https://picsum.photos/seed/airfryer/600/600",
    rating: 4.7,
    reviews: 210
  },
  {
    id: 5,
    name: "طقم عشاء بورسلين 60 قطعة",
    category: "أواني التقديم",
    price: 5500,
    description: "طقم بورسلين فاخر مناسب للعزائم والمناسبات الخاصة.",
    image: "https://picsum.photos/seed/plates/600/600",
    rating: 4.6,
    reviews: 45
  },
  {
    id: 6,
    name: "ميزان مطبخ رقمي دقيق",
    category: "أدوات المطبخ",
    price: 250,
    description: "ميزان حساس يصل إلى 5 كيلو جرام مع شاشة LCD.",
    image: "https://picsum.photos/seed/scale/600/600",
    rating: 4.4,
    reviews: 112
  },
  {
    id: 7,
    name: "محضرة طعام كينوود المتكاملة",
    category: "الأجهزة الكهربائية",
    price: 3200,
    description: "جهاز واحد للفرم، العجن، والخلط بكل سهولة.",
    image: "https://picsum.photos/seed/foodprocessor/600/600",
    rating: 4.8,
    reviews: 78
  },
  {
    id: 8,
    name: "فازة كريستال إيطالي",
    category: "الديكور",
    price: 450,
    description: "فازة يدوية الصنع تضفي لمسة جمالية على منزلك.",
    image: "https://picsum.photos/seed/vase/600/600",
    rating: 4.3,
    reviews: 32
  }
];

export const CATEGORIES = ['الكل', 'أدوات المطبخ', 'الأجهزة الكهربائية', 'الديكور', 'أواني التقديم'];
