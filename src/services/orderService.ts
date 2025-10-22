import { supabase } from '@/integrations/supabase/client';
import { CurrencyService } from './currencyService';
import { NotificationService } from './notificationService';
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
import { ProductService } from '@/services/productService';

export class OrderService {
  // Get checkout total with currency conversion
  static getCheckoutTotal(cartItems: any[], currencyCode?: string) {
    const totalKES = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return CurrencyService.getCheckoutAmount(totalKES, currencyCode);
  }
  // Cart Management
  static async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    const { data, error } = await supabase
      .from('user_cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async addToCart(userId: string, request: AddToCartRequest): Promise<CartItem> {
    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('user_cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', request.product_id)
      .maybeSingle();

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
      // Add new item
      const { data, error } = await supabase
        .from('user_cart_items')
        .insert({
          user_id: userId,
          product_id: request.product_id,
          product_name: request.product_name,
          product_category: request.product_category,
          quantity: request.quantity,
          price: request.price,
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
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;
  }

  static async clearCart(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }

  // Wishlist Management
  static async getWishlistItems(userId: string): Promise<WishlistItemWithProduct[]> {
    const { data, error } = await supabase
      .from('user_likes')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async addToWishlist(userId: string, product: { product_id: string, product_name: string, product_category: string }): Promise<WishlistItem> {
    const { data, error } = await supabase
      .from('user_likes')
      .upsert({
        user_id: userId,
        product_id: product.product_id,
        product_name: product.product_name,
        product_category: product.product_category,
        created_at: new Date().toISOString(),
      }, { onConflict: 'user_id,product_id' })
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
  static async createOrder(userId: string, request: CreateOrderRequest): Promise<OrderWithDetails> {
    // Start a transaction
    const { data: orderNumber, error: orderNumberError } = await supabase.rpc('generate_order_number');
    if (orderNumberError) throw orderNumberError;
    if (!orderNumber || typeof orderNumber !== 'string') {
      throw new Error('Failed to generate order number');
    }
    // Get cart items for the user
    const cartItems = await this.getCartItems(userId);
    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }
    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
    // Determine delivery method and fees
    const isPickup = request.notes?.includes('Pickup from vendor');
    const deliveryFee = isPickup ? 0 : (request.delivery_fee || 500); // Use provided delivery fee or default to 500 KES
    const taxAmount = subtotal * 0.16; // 16% VAT for Kenya
    const totalAmount = subtotal + taxAmount + deliveryFee;
    // Validate required fields
    if (!request.shipping_address || !request.billing_address || !request.customer_email) {
      throw new Error('Missing required order fields');
    }
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: userId,
        subtotal,
        tax_amount: taxAmount,
        shipping_amount: deliveryFee,
        total_amount: totalAmount,
        shipping_address: request.shipping_address,
        billing_address: request.billing_address,
        customer_email: request.customer_email,
        customer_phone: request.customer_phone,
        notes: request.notes,
        fulfillment_method: isPickup ? 'pickup' : 'delivery'
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

    // Decrement stock for each product
    await Promise.all(cartItems.map(async (cartItem) => {
      const newStock = (cartItem.product.stock_quantity || 0) - cartItem.quantity;
      // Ensure only the vendor can update their product
      await ProductService.updateProduct(cartItem.product_id, { stock_quantity: Math.max(0, newStock) }, userId);
    }));

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
        carrier: isPickup ? 'vendor_pickup' : 'isa_delivery',
        shipping_method: isPickup ? 'pickup' : 'delivery',
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

    // Award purchase points for order completion
    try {
      const { LoyaltyService } = await import('./loyaltyService');
      await LoyaltyService.awardSpendingPoints(userId, totalAmount);
    } catch (error) {
      console.error('Error awarding purchase points:', error);
      // Don't fail the order if points awarding fails
    }

    // Send push notifications
    try {
      // Notify customer about order creation
      await NotificationService.notifyOrderUpdate(userId, orderNumber, 'created');
      
      // Notify vendors about new orders
      const vendorIds = [...new Set(cartItems.map(item => item.product.vendor_id))];
      for (const vendorId of vendorIds) {
        const vendorOrderItems = cartItems.filter(item => item.product.vendor_id === vendorId);
        const vendorTotal = vendorOrderItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        await NotificationService.notifyVendorNewOrder(vendorId, orderNumber, vendorTotal);
      }
    } catch (error) {
      console.error('Error sending push notifications:', error);
      // Don't fail the order if notifications fail
    }

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

  // M-Pesa Payment Processing
  static async processMpesaPayment(orderId: string, phoneNumber: string, amount: number): Promise<Payment> {
    // Import MpesaService dynamically to avoid circular dependencies
    const { MpesaService } = await import('./mpesaService');
    
    try {
      // Get order details
      const order = await this.getOrderById(orderId);
      
      // Initiate M-Pesa payment
      const mpesaResponse = await MpesaService.initiatePayment({
        phoneNumber,
        amount,
        orderId,
        description: `Payment for order ${order.order_number}`
      });

      if (!mpesaResponse.success) {
        throw new Error(mpesaResponse.message);
      }

      // Update payment record with M-Pesa details
      const { data: payment, error } = await supabase
        .from('payments')
        .update({
          status: 'processing',
          transaction_id: mpesaResponse.transactionId,
          mpesa_phone_number: phoneNumber,
          mpesa_checkout_request_id: mpesaResponse.transactionId,
          gateway_response: {
            mpesa_checkout_request_id: mpesaResponse.transactionId,
            phone_number: phoneNumber,
            initiated_at: new Date().toISOString()
          }
        })
        .eq('order_id', orderId)
        .select()
        .single();

      if (error) throw error;

      return payment;
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      throw error;
    }
  }

  // Check M-Pesa payment status
  static async checkMpesaPaymentStatus(orderId: string): Promise<Payment> {
    const { MpesaService } = await import('./mpesaService');
    
    try {
      // Get payment record
      const { data: payment, error } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) throw error;

      if (!payment.gateway_response?.mpesa_checkout_request_id) {
        throw new Error('No M-Pesa checkout request found');
      }

      // Check payment status
      const statusResponse = await MpesaService.checkPaymentStatus(
        payment.gateway_response.mpesa_checkout_request_id
      );

      if (statusResponse.success) {
        // Payment successful
        const { data: updatedPayment, error: updateError } = await supabase
          .from('payments')
          .update({
            status: 'succeeded',
            transaction_id: statusResponse.transactionId,
            mpesa_transaction_id: statusResponse.transactionId,
            gateway_response: {
              ...payment.gateway_response,
              mpesa_transaction_id: statusResponse.transactionId,
              completed_at: new Date().toISOString()
            }
          })
          .eq('order_id', orderId)
          .select()
          .single();

        if (updateError) throw updateError;

        // Update order status
        await this.updateOrderStatus(orderId, {
          order_id: orderId,
          status: 'confirmed',
          notes: 'M-Pesa payment completed successfully'
        });

        return updatedPayment;
      } else {
        // Payment failed or pending
        const { data: updatedPayment, error: updateError } = await supabase
          .from('payments')
          .update({
            status: statusResponse.errorCode === '1' ? 'processing' : 'failed',
            gateway_response: {
              ...payment.gateway_response,
              last_check: new Date().toISOString(),
              status_message: statusResponse.message
            }
          })
          .eq('order_id', orderId)
          .select()
          .single();

        if (updateError) throw updateError;

        return updatedPayment;
      }
    } catch (error) {
      console.error('M-Pesa status check error:', error);
      throw error;
    }
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
    try {
      // Get orders that have items from this vendor
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          payment:payments(*),
          status_history:order_status_history(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter orders to only include those with items from this vendor
      const vendorOrders = (data || []).filter(order => 
        order.items?.some((item: any) => item.vendor_id === vendorId)
      );

      return vendorOrders;
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
      return [];
    }
  }

  // User-specific methods
  static async getUserOrders(userId: string): Promise<OrderWithDetails[]> {
    if (!userId) {
      console.warn('getUserOrders called with undefined userId');
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          payment:payments(*),
          status_history:order_status_history(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
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