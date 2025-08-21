export interface Category {
  id: number;
  title: string;
  desc: string;
  icon?: string; // Add this line to include the optional icon property
}

export interface Product {
  id: string;
  created_at: string;
  shop: string;
  title: string;
  desc: string;
  price: string;
  images: string[];
  category: number | null;
  shops?: { shop_name: string };
  categories?: Category;
  sale_price?: number | null;
  discount_type?: "percentage" | "fixed" | null;
  discount_value?: number | null;
  discount_start?: string | null;
  discount_end?: string | null;
  active: boolean;
  rating?: number;
  reviews?: number;
  view_count?: number; // عدد مشاهدات المنتج
  cart_count?: number; // عدد مرات إضافة المنتج للسلة
}

export interface Shop {
  id: string;
  shop_name: string;
  address: string;
  status: string;
  public: boolean;
  cover_image_url?: string;
  logo_url?: string;
  work_hours: string[];
  owner: string;
  profiles?: {
    full_name?: string;
  };
  created_at?: string;
  categories?: Category[]; // Added categories property
  productsCount?: string;
  latitude?: number | null;
  longitude?: number | null;
  phone_numbers?: string[];
  gallery?: string[];
  statusDropdownOpen?: boolean;
  visit_count?: number; // عدد زيارات المتجر
  // ...other properties
}

export interface WorkHours {
  day: string;
  open: boolean;
  startTime: string;
  endTime: string;
}
