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
  shipping_address: Address;
  billing_address: Address;
  customer_email: string;
  customer_phone?: string;
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

export interface Payment {
  id: string;
  order_id: string;
  payment_method: PaymentMethod;
  payment_intent_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  transaction_id?: string;
  gateway_response?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Shipping {
  id: string;
  order_id: string;
  carrier: string;
  tracking_number?: string;
  tracking_url?: string;
  status: ShippingStatus;
  shipping_method: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  // Joined with product data
  product?: Product;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  // Joined with product data
  product?: Product;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface OrderWithDetails extends Order {
  items: OrderItem[];
  order_items?: OrderItem[];
  payment?: Payment;
  shipping?: Shipping;
  status_history: OrderStatusHistory[];
  product_rating?: number;
  delivery_rating?: number;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
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
  | 'airtel_money'
  | 'card'
  | 'bank'
  | 'dpo_pay'
  | 'myplug_pay'
  | 'cash_on_delivery'
  | 'cash_on_pickup';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type ShippingStatus = 
  | 'pending'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'failed';

export type DeliveryMethod = 
  | 'delivery'
  | 'pickup';

// Request/Response types
export interface CreateOrderRequest {
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
  shipping_address: Address;
  billing_address: Address;
  customer_email: string;
  customer_phone?: string;
  notes?: string;
  payment_method: PaymentMethod;
  delivery_fee?: number; // Optional delivery fee for new cost system
}

export interface CreatePaymentRequest {
  order_id: string;
  payment_method: PaymentMethod;
  amount: number;
  currency?: string;
}

export interface UpdateOrderStatusRequest {
  order_id: string;
  status: OrderStatus;
  notes?: string;
}

export interface AddToCartRequest {
  product_id: string;
  quantity: number;
  product_name?: string;
  product_category?: string;
  price?: number;
}

export interface UpdateCartItemRequest {
  cart_item_id: string;
  quantity: number;
}

export interface CheckoutRequest {
  shipping_address: Address;
  billing_address: Address;
  customer_email: string;
  customer_phone?: string;
  notes?: string;
  payment_method: PaymentMethod;
}

// Filter and search types
export interface OrderFilters {
  status?: OrderStatus;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface OrderSortOption {
  field: 'created_at' | 'total_amount' | 'status';
  direction: 'asc' | 'desc';
}

export interface OrderSearchParams {
  filters?: OrderFilters;
  sort?: OrderSortOption;
  page?: number;
  limit?: number;
}

// Import Product type
import { Product } from './product';

export interface DeliveryDetails {
  method: DeliveryMethod;
  pickup_location?: string;
  pickup_phone?: string;
  delivery_address?: Address;
  delivery_fee?: number;
}

// Return request types
export interface ReturnRequest {
  id: string;
  order_id: string;
  user_id: string;
  product_id: string;
  vendor_id: string;
  reason: string;
  message?: string;
  return_type: 'replacement' | 'exchange' | 'refund';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  admin_notes?: string;
  vendor_notes?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  order?: {
    order_number: string;
    total_amount: number;
    [key: string]: any;
  };
  product?: {
    name: string;
    main_image?: string;
    [key: string]: any;
  };
  user?: {
    first_name?: string;
    last_name?: string;
    [key: string]: any;
  };
  vendor?: {
    first_name?: string;
    last_name?: string;
    [key: string]: any;
  };
}

export interface CreateReturnRequestRequest {
  order_id: string;
  product_id: string;
  reason: string;
  message?: string;
  return_type: 'replacement' | 'exchange' | 'refund';
}

export interface UpdateReturnRequestRequest {
  return_request_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  admin_notes?: string;
  vendor_notes?: string;
} 