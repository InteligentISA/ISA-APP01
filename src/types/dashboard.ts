export interface DashboardProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  main_image?: string;
  brand?: string;
  rating?: number;
  review_count?: number;
  stock_quantity?: number;
  description?: string;
  vendor_id?: string;
}

export interface DashboardJumiaProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  main_image?: string;
  brand?: string;
  rating?: number;
  review_count?: number;
  stock_quantity?: number;
  description?: string;
  link?: string;
  source?: 'jumia';
}

export interface AddToCartRequest {
  product_id: string;
  quantity: number;
  price: number;
  user_id: string;
  product_category?: string;
  product_name?: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product_category?: string;
  product_name?: string;
  added_at: string;
  removed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItemWithProduct extends CartItem {
  product: DashboardProduct;
}