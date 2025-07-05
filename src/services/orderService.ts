
import { supabase } from '@/integrations/supabase/client';
import {
  Order,
  OrderItem,
  CartItem,
  WishlistItem,
  OrderWithDetails,
  CartItemWithProduct,
  WishlistItemWithProduct,
  AddToCartRequest,
  UpdateCartItemRequest,
  CheckoutRequest,
  OrderStatus,
  PaymentStatus,
  Address
} from '@/types/order';
import { Product } from '@/types/product';

export class OrderService {
  // Cart Management
  static async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    const { data, error } = await supabase
      .from('user_cart_items')
      .select('*')
      .eq('user_id', userId)
      .is('removed_at', null)
      .order('added_at', { ascending: false });

    if (error) throw error;
    
    // Get product details for each cart item
    const cartItemsWithProducts = await Promise.all(
      (data || []).map(async (item) => {
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.product_id)
          .single();
        
        return {
          ...item,
          product: product || null
        };
      })
    );

    return cartItemsWithProducts.filter(item => item.product) as CartItemWithProduct[];
  }

  static async addToCart(userId: string, request: AddToCartRequest): Promise<CartItem> {
    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('user_cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', request.product_id)
      .is('removed_at', null)
      .single();

    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        .from('user_cart_items')
        .update({ quantity: existingItem.quantity + request.quantity })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Get product details for price
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', request.product_id)
        .single();

      if (!product) throw new Error('Product not found');

      // Add new item
      const { data, error } = await supabase
        .from('user_cart_items')
        .insert({
          user_id: userId,
          product_id: request.product_id,
          product_name: request.product_name || product.name,
          product_category: request.product_category || product.category,
          quantity: request.quantity,
          price: product.price,
          added_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  static async updateCartItem(cartItemId: string, quantity: number): Promise<CartItem> {
    const { data, error } = await supabase
      .from('user_cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async removeFromCart(cartItemId: string): Promise<void> {
    const { error } = await supabase
      .from('user_cart_items')
      .update({ removed_at: new Date().toISOString() })
      .eq('id', cartItemId);

    if (error) throw error;
  }

  static async clearCart(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_cart_items')
      .update({ removed_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('removed_at', null);

    if (error) throw error;
  }

  // Wishlist Management
  static async getWishlistItems(userId: string): Promise<WishlistItemWithProduct[]> {
    const { data, error } = await supabase
      .from('user_likes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Get product details for each wishlist item
    const wishlistItemsWithProducts = await Promise.all(
      (data || []).map(async (item) => {
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.product_id)
          .single();
        
        return {
          ...item,
          product: product || null
        };
      })
    );

    return wishlistItemsWithProducts.filter(item => item.product) as WishlistItemWithProduct[];
  }

  static async addToWishlist(userId: string, product: { product_id: string, product_name: string, product_category: string }): Promise<WishlistItem> {
    const { data, error } = await supabase
      .from('user_likes')
      .insert({
        user_id: userId,
        product_id: product.product_id,
        product_name: product.product_name,
        product_category: product.product_category,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('user_likes')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
  }

  // Order Management
  static async createOrder(userId: string, request: CheckoutRequest, cartItems: any[]): Promise<OrderWithDetails> {
    // Generate order number
    const { data: orderNumber } = await supabase.rpc('generate_order_number');
    
    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = 0; // No tax for now
    const shippingAmount = request.fulfillment_method === 'delivery' ? 200 : 0; // KES 200 delivery fee
    const totalAmount = subtotal + taxAmount + shippingAmount;

    // Get user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const userEmail = profile?.id ? `user_${profile.id}@example.com` : request.customer_email;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: userId,
        subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        total_amount: totalAmount,
        currency: 'KES',
        fulfillment_method: request.fulfillment_method,
        shipping_address: request.shipping_address,
        pickup_location: request.fulfillment_method === 'pickup' ? cartItems[0]?.pickup_location : null,
        pickup_phone: request.fulfillment_method === 'pickup' ? cartItems[0]?.pickup_phone : null,
        customer_email: userEmail,
        customer_phone: request.customer_phone,
        payment_method: request.payment_method,
        payment_status: request.payment_method === 'mpesa' ? 'pending' : 'pending',
        notes: request.notes
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems: OrderItem[] = [];
    for (const cartItem of cartItems) {
      const { data: orderItem, error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: cartItem.product_id,
          quantity: cartItem.quantity,
          unit_price: cartItem.price,
          total_price: cartItem.price * cartItem.quantity,
          product_name: cartItem.product_name || cartItem.name,
          product_sku: cartItem.sku,
          product_image: cartItem.main_image,
          vendor_id: cartItem.vendor_id
        })
        .select()
        .single();

      if (itemError) throw itemError;
      orderItems.push(orderItem);
    }

    // Update product stock quantities
    await Promise.all(cartItems.map(async (cartItem) => {
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', cartItem.product_id)
        .single();
      
      if (product) {
        const newStock = Math.max(0, (product.stock_quantity || 0) - cartItem.quantity);
        await supabase
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', cartItem.product_id);
      }
    }));

    // Clear cart
    await this.clearCart(userId);

    // Return complete order with details
    return {
      ...order,
      items: orderItems
    };
  }

  static async getOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getOrderById(orderId: string): Promise<OrderWithDetails> {
    // Get order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    return {
      ...order,
      items: items || []
    };
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
  }

  static async updatePaymentStatus(orderId: string, status: PaymentStatus, transactionId?: string): Promise<void> {
    const updateData: any = { payment_status: status };
    if (transactionId) {
      updateData.mpesa_transaction_id = transactionId;
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) throw error;
  }
}
