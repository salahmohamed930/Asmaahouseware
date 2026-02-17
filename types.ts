
export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  wholesale_price?: number; // سعر الجملة الجديد
  description: string;
  image: string;
  images?: string[];
  colors?: string[];
  rating: number;
  reviews: number;
  is_visible?: boolean;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  is_wholesale: boolean;
  next_order_discount_value: number;
  next_order_discount_type: 'fixed' | 'percent';
  created_at: string;
}

export interface CategoryData {
  id: number;
  name: string;
  discount_percent: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
}

export interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  customer_phone_2?: string;
  customer_address: string;
  total_price: number;
  discount_applied?: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items?: OrderItem[];
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: string;
  product_name: string;
  quantity: number;
  price: number;
  selected_color?: string;
}

export interface SiteSettings {
  id?: number;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
}

export type Category = string; // تم تحويلها لديناميكية
