
export interface UserAccount {
  id: string;
  full_name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  user_type?: 'retail' | 'wholesale';
  updated_at?: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  wholesale_price?: number;
  description: string;
  image: string;
  images?: string[];
  colors?: string[];
  rating: number;
  reviews: number;
  is_visible?: boolean;
  created_at?: string;
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items?: OrderItem[];
  // order_items is added to match the Supabase response when joining with the order_items table
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

export type Category = 'الكل' | 'أدوات المطبخ' | 'الأجهزة الكهربائية' | 'الديكور' | 'أواني التقديم';
