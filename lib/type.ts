export interface Category {
id: number;
title: string;
desc: string;
image_url?: string;
created_at: string;
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
  owner_name: string;
  id: string;
  shop_name: string;
  address: string;
  status: string;
  public: boolean;
  desc?: string; // <-- العمود الصحيح من قاعدة البيانات
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


export interface Profile {
  idx: number;
  id: string;
  full_name: string | null;
  profession: string | null;
  country: string | null;
  address: string | null;
  location: string | null;
  phone: string | null;
  website: string | null;
  is_default_address: boolean;
  linkedin_username: string | null;
  twitter_username: string | null;
  facebook_username: string | null;
  github_username: string | null;
  theme: 'light' | 'dark';
  public_profile: boolean;
  show_email: boolean;
  enable_shortcuts: boolean;
  hide_navigation: boolean;
  show_advertisements: boolean;
  enable_social: boolean;
  updated_at: string;
  email: string | null;
  avatar_url: string | null;
  registration_date: string | null;
  status: string | null;
  username: string | null;
  role: string | null;
}


// New: Order JSON subtypes
export interface ShippingMethodJson {
  type: string;
  duration: string;
  cost: number;
}

export interface ShippingAddressJson {
  name: string;
  address: string;
  city: string;
  zip: string;
  district: string;
  phone: string;
  email: string;
}

export interface PaymentMethodJson {
  type: string;
  name_on_card?: string;
  card_number?: string;
  expiration_date?: string;
  provider?: string;
}

export interface OrderData {
    id: string;
    created_at: string;
    buyer_id: string;
    status: string;
    product_id: number;
    shipping_method: any;
    shipping_address: any;
    payment_method: any;
    // Joined data
    products?: {
        id: number;
        title: string;
        price: number;
        images: any[];
        shop: number;
        shops?: {
            shop_name: string;
        };
    };
    profiles?: {
        id: string;
        full_name: string;
        email: string;
    };
}