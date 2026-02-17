
export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  images?: string[]; // صور إضافية
  colors?: string[]; // ألوان المنتج
  rating: number;
  reviews: number;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string; // اللون الذي اختاره العميل
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  total: number;
  status: 'pending' | 'shipped' | 'delivered';
  date: string;
  items: CartItem[];
}

export type Category = 'الكل' | 'أدوات المطبخ' | 'الأجهزة الكهربائية' | 'الديكور' | 'أواني التقديم';
