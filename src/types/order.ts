
export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  apartment?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  fulfillment_method: 'pickup' | 'delivery';
  shipping_address?: Address;
  pickup_location?: string;
  pickup_phone?: string;
  customer_email: string;
  customer_phone?: string;
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  mpesa_transaction_id?: string;
  notes?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name: string;
  product_sku?: string;
  product_image?: string;
  vendor_id?: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
  product_name?: string;
  product_category?: string;
  price?: number;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface OrderWithDetails extends Order {
  items: OrderItem[];
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
  product_name: string;
  product_category: string;
  price: number;
}

export interface WishlistItemWithProduct extends WishlistItem {
  product: Product;
}

// Enums
export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 
  | 'mpesa'
  | 'pay_after_pickup'
  | 'pay_after_delivery';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed';

// Request/Response types
export interface AddToCartRequest {
  product_id: string;
  quantity: number;
  product_name?: string;
  product_category?: string;
}

export interface UpdateCartItemRequest {
  cart_item_id: string;
  quantity: number;
}

export interface CheckoutRequest {
  fulfillment_method: 'pickup' | 'delivery';
  shipping_address?: Address;
  customer_email: string;
  customer_phone?: string;
  notes?: string;
  payment_method: PaymentMethod;
}

export interface MpesaPaymentRequest {
  phone_number: string;
  amount: number;
  order_id: string;
}

// Import Product type
import { Product } from './product';
