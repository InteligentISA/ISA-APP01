import { supabase } from '@/integrations/supabase/client';
import {
  Order,
  OrderItem,
  Payment,
  Shipping,
  CartItem,
  WishlistItem,
  OrderStatusHistory,
  OrderWithDetails,
  CartItemWithProduct,
  WishlistItemWithProduct,
  CreateOrderRequest,
  CreatePaymentRequest,
  UpdateOrderStatusRequest,
  AddToCartRequest,
  UpdateCartItemRequest,
  CheckoutRequest,
  OrderSearchParams,
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
  Address
} from '@/types/order';
import { Product } from '@/types/product';

export class OrderService {
  // Cart Management
  static async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async addToCart(userId: string, request: AddToCartRequest): Promise<CartItem> {
    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', request.product_id)
      .single();

    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + request.quantity })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Add new item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: request.product_id,
          quantity: request.quantity
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  static async updateCartItem(cartItemId: string, quantity: number): Promise<CartItem> {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async removeFromCart(cartItemId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;
  }

  static async clearCart(userId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }

  // Wishlist Management
  static async getWishlistItems(userId: string): Promise<WishlistItemWithProduct[]> {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
    const { data, error } = await supabase
      .from('wishlist_items')
      .insert({
        user_id: userId,
        product_id: productId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async removeFromWishlist(wishlistItemId: string): Promise<void> {
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', wishlistItemId);

    if (error) throw error;
  }

  // Order Management
  static async createOrder(userId: string, request: CreateOrderRequest): Promise<OrderWithDetails> {
    // Start a transaction
    const { data: orderNumber } = await supabase.rpc('generate_order_number');
    
    // Get cart items for the user
    const cartItems = await this.getCartItems(userId);
    
    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    const taxAmount = subtotal * 0.08; // 8% tax
    const shippingAmount = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
    const totalAmount = subtotal + taxAmount + shippingAmount;

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
        shipping_address: request.shipping_address,
        billing_address: request.billing_address,
        customer_email: request.customer_email,
        customer_phone: request.customer_phone,
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
          unit_price: cartItem.product.price,
          total_price: cartItem.product.price * cartItem.quantity,
          product_name: cartItem.product.name,
          product_sku: cartItem.product.sku,
          product_image: cartItem.product.main_image,
          vendor_id: cartItem.product.vendor_id
        })
        .select()
        .single();

      if (itemError) throw itemError;
      orderItems.push(orderItem);
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        payment_method: request.payment_method,
        amount: totalAmount,
        status: 'pending'
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Create shipping record
    const { data: shipping, error: shippingError } = await supabase
      .from('shipping')
      .insert({
        order_id: order.id,
        carrier: 'standard',
        shipping_method: 'standard',
        status: 'pending'
      })
      .select()
      .single();

    if (shippingError) throw shippingError;

    // Create initial status history
    await supabase
      .from('order_status_history')
      .insert({
        order_id: order.id,
        status: 'pending',
        notes: 'Order created'
      });

    // Clear cart
    await this.clearCart(userId);

    // Return complete order with details
    return {
      ...order,
      items: orderItems,
      payment,
      shipping,
      status_history: []
    };
  }

  static async getOrders(userId: string, params?: OrderSearchParams): Promise<Order[]> {
    let query = supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId);

    if (params?.filters) {
      if (params.filters.status) {
        query = query.eq('status', params.filters.status);
      }
      if (params.filters.date_from) {
        query = query.gte('created_at', params.filters.date_from);
      }
      if (params.filters.date_to) {
        query = query.lte('created_at', params.filters.date_to);
      }
      if (params.filters.min_amount) {
        query = query.gte('total_amount', params.filters.min_amount);
      }
      if (params.filters.max_amount) {
        query = query.lte('total_amount', params.filters.max_amount);
      }
    }

    if (params?.sort) {
      query = query.order(params.sort.field, { ascending: params.sort.direction === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (params?.page && params?.limit) {
      const offset = (params.page - 1) * params.limit;
      query = query.range(offset, offset + params.limit - 1);
    }

    const { data, error } = await query;
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

    // Get payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (paymentError && paymentError.code !== 'PGRST116') throw paymentError;

    // Get shipping
    const { data: shipping, error: shippingError } = await supabase
      .from('shipping')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (shippingError && shippingError.code !== 'PGRST116') throw shippingError;

    // Get status history
    const { data: statusHistory, error: historyError } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (historyError) throw historyError;

    return {
      ...order,
      items: items || [],
      payment: payment || undefined,
      shipping: shipping || undefined,
      status_history: statusHistory || []
    };
  }

  static async updateOrderStatus(orderId: string, request: UpdateOrderStatusRequest): Promise<void> {
    // Update order status
    const { error: orderError } = await supabase
      .from('orders')
      .update({ status: request.status })
      .eq('id', orderId);

    if (orderError) throw orderError;

    // Add to status history
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        status: request.status,
        notes: request.notes
      });

    if (historyError) throw historyError;
  }

  // Payment Processing
  static async processPayment(orderId: string, request: CreatePaymentRequest): Promise<Payment> {
    // In a real implementation, this would integrate with Stripe, PayPal, etc.
    // For now, we'll simulate payment processing
    
    const { data: payment, error } = await supabase
      .from('payments')
      .update({
        status: 'succeeded',
        transaction_id: `txn_${Date.now()}`,
        gateway_response: {
          success: true,
          transaction_id: `txn_${Date.now()}`,
          processed_at: new Date().toISOString()
        }
      })
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) throw error;

    // Update order status to confirmed
    await this.updateOrderStatus(orderId, {
      order_id: orderId,
      status: 'confirmed',
      notes: 'Payment processed successfully'
    });

    return payment;
  }

  static async refundPayment(paymentId: string, amount: number): Promise<Payment> {
    const { data: payment, error } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        gateway_response: {
          refund_amount: amount,
          refunded_at: new Date().toISOString()
        }
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return payment;
  }

  // Shipping Management
  static async updateShippingInfo(orderId: string, trackingNumber: string, carrier: string): Promise<Shipping> {
    const { data, error } = await supabase
      .from('shipping')
      .update({
        tracking_number: trackingNumber,
        carrier,
        status: 'shipped',
        tracking_url: `https://tracking.${carrier}.com/${trackingNumber}`
      })
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) throw error;

    // Update order status to shipped
    await this.updateOrderStatus(orderId, {
      order_id: orderId,
      status: 'shipped',
      notes: `Shipped via ${carrier}, tracking: ${trackingNumber}`
    });

    return data;
  }

  // Vendor-specific methods
  static async getVendorOrders(vendorId: string): Promise<OrderWithDetails[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        payment:payments(*),
        shipping:shipping(*),
        status_history:order_status_history(*)
      `)
      .eq('items.product.vendor_id', vendorId);

    if (error) throw error;
    return data || [];
  }

  // Utility methods
  static async getOrderStats(userId: string): Promise<{
    total_orders: number;
    total_spent: number;
    pending_orders: number;
    delivered_orders: number;
  }> {
    const { data, error } = await supabase
      .from('orders')
      .select('status, total_amount')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = {
      total_orders: data.length,
      total_spent: data.reduce((sum, order) => sum + order.total_amount, 0),
      pending_orders: data.filter(order => ['pending', 'confirmed', 'processing'].includes(order.status)).length,
      delivered_orders: data.filter(order => order.status === 'delivered').length
    };

    return stats;
  }

  static formatOrderNumber(orderNumber: string): string {
    return orderNumber.replace(/(.{2})(.{6})(.{4})/, '$1-$2-$3');
  }

  static calculateEstimatedDelivery(): Date {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days from now
    return deliveryDate;
  }
} 