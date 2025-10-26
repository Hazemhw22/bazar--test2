// (file replaced with user-provided schema) -- kept exact content from the user's attachment
// ========================================
// USER TYPES
// ========================================

export interface UserRole {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export type UserRoleId = UserRole["id"];

export interface UserProfile {
  id: string;
  user_id: string;
  role_id: number;
  email: string;
  name?: string;
  phone?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Legacy / compatibility
  avatar_url?: string;
  full_name?: string;
  registration_date?: string;
  address?: string;
}

export interface UserProfileWithRole extends UserProfile {
  role: UserRole;
}

export interface CreateUserProfileData {
  user_id: string;
  role_id: number;
  email: string;
  name?: string;
  phone?: string;
  image_url?: string;
}

export interface UpdateUserProfileData {
  role_id?: number;
  email?: string;
  name?: string;
  phone?: string;
  image_url?: string;
  is_active?: boolean;
  shops?: number[]; // Array of shop IDs for shop assignments
  deliveryCompanies?: number[]; // Array of delivery company IDs for driver assignments
}

// ========================================
// DELIVERY TYPES
// ========================================

export interface DeliveryLocation {
  id: number;
  location_name: string;
  price_addition: number;
  company_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DeliveryLocationMethod {
  id: number;
  location_name: string;
  price_addition: number;
  company_id: number;
  method_id: number;
  created_at: string;
  updated_at: string;
  delivery_methods?: {
    id: number;
    method: string;
    delivery_time: string;
  };
}

export interface DeliveryMethod {
  id: number;
  method: string;
  delivery_time: string;
  price_addition: number;
  image_url?: string;
  company_id?: number;
  created_at?: string;
  updated_at?: string;
  delivery_locations_methods?: DeliveryLocation[] | DeliveryLocationMethod[];
}

export interface DeliveryCompany {
  id: number;
  name: string;
  company_number?: string;
  phone_number?: string;
  address?: string;
  image_url?: string;
  cover_url?: string;
  created_at?: string;
  updated_at?: string;
  delivery_methods?: DeliveryMethod[];
}

export interface DeliveryCar {
  id: number;
  company_id: number;
  image_url?: string;
  plate_number: string;
  brand?: string;
  car_model?: string;
  color?: string;
  capacity?: number;
  created_at?: string;
  updated_at?: string;
  delivery_companies?: {
    id: number;
    name: string;
  };
}

export interface DeliveryDriver {
  id: string;
  delivery_company_id: number;
  user_id: string;
  role_type: string;
  assigned_at: string;
  assigned_by?: string;
  user_profiles?: {
    id: string;
    name?: string;
    email: string;
    phone?: string;
    image_url?: string;
  };
  delivery_companies?: {
    id: number;
    name: string;
  };
}

export interface CreateDeliveryMethodData {
  method: string;
  delivery_time: string;
  price_addition: number;
  image_url?: string;
  company_id?: number;
}

export interface CreateDeliveryLocationMethodData {
  location_name: string;
  price_addition: number;
  company_id: number;
  method_id: number;
}

// ========================================
// SHOP TYPES
// ========================================

export interface ShopCategory {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  // compatibility
  title?: string;
}

export interface ShopSubCategory {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  category_id: number;
  // compatibility
  title?: string;
}

export interface Shop {
  id: number;
  name: string;
  logo_url?: string;
  cover_url?: string;
  description?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  work_hours?: Record<string, any>;
  phone_nb?: Record<string, any>;
  gallery?: string;
  category_id?: number;
  sub_category_id?: number;
  // Legacy / compatibility fields (some components expect these names)
  shop_name?: string;
  category_shop_id?: number;
  // Additional compatibility fields
  category_sub_shop_id?: number;
  categoryTitle?: string;
  categoryName?: string;
  productsCount?: number;
}

export interface ShopWithDetails extends Shop {
  category?: ShopCategory;
  sub_category?: ShopSubCategory;
  delivery_company?: {
    id: number;
    name: string;
    logo_url?: string;
  };
}

export interface HomepageShop {
  id: number;
  shop_id: number;
  banner1_title?: string;
  banner1_slogan?: string;
  banner1_image_url?: string;
  banner1_link?: string;
  banner2_title?: string;
  banner2_slogan?: string;
  banner2_image_url?: string;
  banner2_link?: string;
  featured_offers: number[];
  featured_products: number[];
  created_at: string;
  updated_at: string;
}

export interface CreateHomepageShopData {
  shop_id: number;
  banner1_title?: string | null;
  banner1_slogan?: string | null;
  banner1_image_url?: string | null;
  banner1_link?: string | null;
  banner2_title?: string | null;
  banner2_slogan?: string | null;
  banner2_image_url?: string | null;
  banner2_link?: string | null;
  featured_offers?: number[];
  featured_products?: number[];
}

export interface UpdateHomepageShopData {
  banner1_title?: string | null;
  banner1_slogan?: string | null;
  banner1_image_url?: string | null;
  banner1_link?: string | null;
  banner2_title?: string | null;
  banner2_slogan?: string | null;
  banner2_image_url?: string | null;
  banner2_link?: string | null;
  featured_offers?: number[];
  featured_products?: number[];
}

export interface CreateShopData {
  name: string;
  logo_url?: string | null;
  cover_url?: string | null;
  description?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  work_hours?: Record<string, any>;
  phone_nb?: Record<string, any>;
  gallery?: string;
  category_id?: number;
  sub_category_id?: number;
  delivery_company_id?: number;
  // Homepage banners
  banner1_title?: string;
  banner1_slogan?: string;
  banner1_image_url?: string;
  banner2_title?: string;
  banner2_slogan?: string;
  banner2_image_url?: string;
  banner3_title?: string;
  banner3_slogan?: string;
  banner3_image_url?: string;
}

export interface UpdateShopData {
  name?: string;
  logo_url?: string | null;
  cover_url?: string | null;
  description?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  work_hours?: Record<string, any>;
  phone_nb?: Record<string, any>;
  gallery?: string;
  category_id?: number;
  sub_category_id?: number;
}

export interface CreateShopCategoryData {
  name: string;
  description?: string;
  image_url?: string;
}

export interface UpdateShopCategoryData {
  name?: string;
  description?: string;
  image_url?: string | null;
}

export interface CreateShopSubCategoryData {
  name: string;
  description?: string;
  image_url?: string;
  category_id: number;
}

export interface UpdateShopSubCategoryData {
  name?: string;
  description?: string;
  image_url?: string | null;
  category_id?: number;
}

// ========================================
// PRODUCT CATEGORY TYPES
// ========================================

export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  shop_id: number;
  created_at: string;
  updated_at: string;
  shops?: {
    id: number;
    name: string;
    logo_url?: string;
  };
}

export interface ProductSubCategory {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  shop_id: number;
  product_category_id: number;
  created_at: string;
  updated_at: string;
  products_categories?: {
    id: number;
    name: string;
  };
  shops?: {
    id: number;
    name: string;
    logo_url?: string;
  };
}

export interface ProductBrand {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  shop_id: number;
  created_at: string;
  updated_at: string;
  shops?: {
    id: number;
    name: string;
    logo_url?: string;
  };
  // compatibility
  brand?: string;
}

export interface CreateProductCategoryData {
  name: string;
  description?: string;
  image_url?: string;
  shop_id: number;
}

export interface UpdateProductCategoryData {
  name?: string;
  description?: string;
  image_url?: string | null;
  shop_id?: number;
}

export interface CreateProductSubCategoryData {
  name: string;
  description?: string;
  image_url?: string;
  shop_id: number;
  product_category_id: number;
}

export interface UpdateProductSubCategoryData {
  name?: string;
  description?: string;
  image_url?: string | null;
  shop_id?: number;
  product_category_id?: number;
}

export interface CreateProductBrandData {
  name: string;
  description?: string;
  image_url?: string;
  shop_id: number;
}

export interface UpdateProductBrandData {
  name?: string;
  description?: string;
  image_url?: string | null;
  shop_id?: number;
}

// ========================================
// PRODUCT TYPES
// ========================================

export interface Product {
  id: number;
  name: string;
  description?: string;
  shop_id: number;
  category_id?: number;
  sub_category_id?: number;
  brand_id?: number;
  price: number;
  sale_price?: number;
  sale_percentage?: number;
  onsale: boolean;
  image_url?: string;
  images?: string[]; // JSONB for multiple images (array of URLs)
  created_at: string;
  updated_at: string;
  shops?: {
    id: number;
    name: string;
    logo_url?: string;
  };
  products_categories?: {
    id: number;
    name: string;
  };
  products_sub_categories?: {
    id: number;
    name: string;
  };
  products_brands?: {
    id: number;
    name: string;
  };
 
}

export interface CreateProductData {
  name: string;
  description?: string;
  shop_id: number;
  category_id?: number;
  sub_category_id?: number;
  brand_id?: number;
  price: number;
  sale_price?: number;
  sale_percentage?: number;
  onsale?: boolean;
  image_url?: string;
  images?: string[];
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  shop_id?: number;
  category_id?: number;
  sub_category_id?: number;
  brand_id?: number;
  price?: number;
  sale_price?: number;
  sale_percentage?: number;
  onsale?: boolean;
  image_url?: string | null;
  images?: string[];
}

// Small helper types used across components (compatibility aliases)
export type Profile = UserProfile;
export type OrderData = Order;
export type CategoryShop = ShopCategory;
export type CategorySubShop = ShopSubCategory;
export type Category = ProductCategory;
export type CategoryBrand = ProductBrand;
export type ProductFeatureLabel = { id: number; name?: string; label?: string; values?: ProductFeatureValue[] };
export type ProductFeatureValue = { id: number; name?: string; label?: string; price_addition?: number };
export type WorkHours = any;


// ========================================
// OFFER TYPES
// ========================================

export interface Offer {
  id: number;
  name: string;
  description?: string;
  shop_id: number;
  image_url?: string;
  price: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  shops?: {
    id: number;
    name: string;
    logo_url?: string;
  };
  offers_products?: Array<{
    product_id: number;
    products: {
      id: number;
      name: string;
      price: number;
      image_url?: string;
    };
  }>;
  products?: Product[];
}

export interface CreateOfferData {
  name: string;
  description?: string;
  shop_id: number;
  image_url?: string;
  price: number;
  start_date: string;
  end_date: string;
  is_active?: boolean;
  product_ids: number[];
}

export interface UpdateOfferData {
  name?: string;
  description?: string;
  shop_id?: number;
  image_url?: string;
  price?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  product_ids?: number[];
}

// ========================================
// ORDER TYPES
// ========================================

export interface Order {
  id: number;
  order_number: string;
  shop_id: number;
  delivery_company_id?: number;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  order_type: "pickup" | "delivery";
  status:
    | "pending"
    | "ready"
    | "waiting_assignment"
    | "on_the_way"
    | "completed";
  payment_method: "cash" | "card" | "bank_transfer";
  subtotal: number;
  delivery_cost: number;
  discount_percentage: number;
  total_amount: number;
  assigned_driver_id?: string;
  assigned_car_id?: number;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  completed_at?: string;
  shops?: {
    id: number;
    name: string;
    logo_url?: string;
  };
  delivery_companies?: {
    id: number;
    name: string;
    logo_url?: string;
  };
  assigned_driver?: {
    id: string;
    name: string;
    image_url?: string;
  };
  assigned_car?: {
    id: number;
    plate_number: string;
    brand: string;
    car_model: string;
    image_url?: string;
  };
  orders_products?: OrderProduct[];
  orders_delivery?: OrderDelivery;
  orders_status?: OrderStatus[];
  // Compatibility fields
  products?: any;
  shipping_method?: any;
}

export interface OrderProduct {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  sale_price?: number;
  final_unit_price: number;
  selected_features: Array<{
    feature_id: number;
    feature_name: string;
    value_id: number;
    value_name: string;
    price_addition: number;
  }>;
  features_total: number;
  item_total: number;
  created_at: string;
  products?: {
    id: number;
    name: string;
    image_url?: string;
  };
}

export interface OrderDelivery {
  id: number;
  order_id: number;
  delivery_company_id: number;
  delivery_method_id: number;
  delivery_location_method_id?: number;
  method_price: number;
  location_price: number;
  total_delivery_cost: number;
  delivery_address?: string;
  delivery_notes?: string;
  created_at: string;
  delivery_companies?: {
    id: number;
    name: string;
    logo_url?: string;
  };
  delivery_methods?: {
    id: number;
    method: string;
    delivery_time: string;
  };
  delivery_locations_methods?: {
    id: number;
    location_name: string;
  };
}

export interface OrderStatus {
  id: number;
  order_id: number;
  status: string;
  changed_by?: string;
  changed_at: string;
  notes?: string;
  user_profiles?: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface CreateOrderData {
  shop_id: number;
  delivery_company_id?: number;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  order_type: "pickup" | "delivery";
  payment_method: "cash" | "card" | "bank_transfer";
  discount_percentage?: number;
  products: Array<{
    product_id: number;
    selected_features: Array<{
      feature_id: number;
      value_id: number;
    }>;
  }>;
  delivery_method_id?: number;
  delivery_location_method_id?: number;
  delivery_notes?: string;
}

export interface UpdateOrderData {
  status?:
    | "pending"
    | "ready"
    | "waiting_assignment"
    | "on_the_way"
    | "completed";
  assigned_driver_id?: string;
  assigned_car_id?: number;
  notes?: string;
}
