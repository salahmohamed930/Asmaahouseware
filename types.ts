
export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  rating: number;
  reviews: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  total: number;
  status: 'pending' | 'shipped' | 'delivered';
  date: string;
  items: number;
}

export type Category = 'الكل' | 'أدوات المطبخ' | 'الأجهزة الكهربائية' | 'الديكور' | 'أواني التقديم';
