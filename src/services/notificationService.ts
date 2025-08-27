import { supabase } from "@/integrations/supabase/client";
import { pushNotificationService, PushNotificationData } from "./pushNotificationService";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  action_url?: string;
  action_text?: string;
}

export class NotificationService {
  // Get user notifications
  static async getUserNotifications(userId: string, limit = 20) {
    try {
      // For now, return empty array since user_notifications table doesn't exist
      // TODO: Create user_notifications table and implement this functionality
      console.warn('user_notifications table not implemented yet');
      return [];
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  // Get unread notification count
  static async getUnreadCount(userId: string) {
    try {
      // For now, return 0 since user_notifications table doesn't exist
      // TODO: Create user_notifications table and implement this functionality
      console.warn('user_notifications table not implemented yet');
      return 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string) {
    try {
      // For now, return true since user_notifications table doesn't exist
      // TODO: Create user_notifications table and implement this functionality
      console.warn('user_notifications table not implemented yet');
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(userId: string) {
    try {
      // For now, return true since user_notifications table doesn't exist
      // TODO: Create user_notifications table and implement this functionality
      console.warn('user_notifications table not implemented yet');
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Create notification
  static async createNotification(notification: Omit<Notification, 'id' | 'created_at'>) {
    try {
      // For now, just log the notification since user_notifications table doesn't exist
      // TODO: Create user_notifications table and implement this functionality
      console.warn('user_notifications table not implemented yet');
      console.log('Notification would be created:', notification);
      return { id: 'temp', created_at: new Date().toISOString(), ...notification };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Notify points earned
  static async notifyPointsEarned(userId: string, points: number, reason: string) {
    try {
      await this.createNotification({
        user_id: userId,
        title: 'Points Earned! 🎉',
        message: `You earned ${points} points for ${reason}. Keep earning to unlock rewards!`,
        type: 'success',
        is_read: false
      });
    } catch (error) {
      console.error('Error notifying points earned:', error);
    }
  }

  // Notify milestone reached
  static async notifyMilestoneReached(userId: string, milestone: string, reward?: string) {
    try {
      const message = reward 
        ? `Congratulations! You've reached ${milestone}! Your reward: ${reward}`
        : `Congratulations! You've reached ${milestone}!`;

      await this.createNotification({
        user_id: userId,
        title: 'Milestone Reached! 🏆',
        message,
        type: 'success',
        is_read: false
      });
    } catch (error) {
      console.error('Error notifying milestone:', error);
    }
  }

  // Notify redemption available
  static async notifyRedemptionAvailable(userId: string) {
    try {
      await this.createNotification({
        user_id: userId,
        title: 'Points Redemption Now Available! 🎁',
        message: 'Great news! You can now redeem your points for rewards. Check your wallet to get started!',
        type: 'info',
        is_read: false,
        action_url: '/wallet',
        action_text: 'View Wallet'
      });
    } catch (error) {
      console.error('Error notifying redemption available:', error);
    }
  }

  // Notify vendor subscription available
  static async notifyVendorSubscriptionAvailable(vendorId: string) {
    try {
      await this.createNotification({
        user_id: vendorId,
        title: 'Vendor Subscriptions Now Available! 💼',
        message: 'Upgrade to Premium to unlock advanced features, lower commission rates, and priority support!',
        type: 'info',
        is_read: false,
        action_url: '/vendor-subscription',
        action_text: 'Upgrade Now'
      });
    } catch (error) {
      console.error('Error notifying vendor subscription available:', error);
    }
  }

  // Notify customer premium available
  static async notifyCustomerPremiumAvailable(userId: string) {
    try {
      await this.createNotification({
        user_id: userId,
        title: 'Premium Plans Now Available! ⭐',
        message: 'Unlock exclusive benefits with our premium membership plans. Get early access to sales, exclusive products, and more!',
        type: 'info',
        is_read: false,
        action_url: '/premium',
        action_text: 'View Plans'
      });
    } catch (error) {
      console.error('Error notifying customer premium available:', error);
    }
  }

  // Notify vendor about commission changes
  static async notifyVendorCommissionUpdate(vendorId: string, category: string, newRate: number) {
    try {
      await this.createNotification({
        user_id: vendorId,
        title: 'Commission Rate Updated 📊',
        message: `Commission rate for ${category} has been updated to ${newRate}%. Check your product management section for details.`,
        type: 'info',
        is_read: false,
        action_url: '/vendor-dashboard?section=products',
        action_text: 'View Products'
      });
    } catch (error) {
      console.error('Error notifying commission update:', error);
    }
  }

  // Notify vendor about subscription benefits
  static async notifyVendorSubscriptionBenefits(vendorId: string, planType: string) {
    try {
      const benefits = planType !== 'freemium' 
        ? 'lower commission rates, priority support, and advanced analytics'
        : 'basic features with standard commission rates';

      await this.createNotification({
        user_id: vendorId,
        title: `Welcome to ${planType.replace('_', ' ').toUpperCase()}! 🎉`,
        message: `You now have access to ${benefits}. Enjoy your enhanced experience!`,
        type: 'success',
        is_read: false
      });
    } catch (error) {
      console.error('Error notifying subscription benefits:', error);
    }
  }

  // Send push notification to user
  static async sendPushNotification(userId: string, notification: PushNotificationData) {
    try {
      // Create in-app notification
      await this.createNotification({
        user_id: userId,
        title: notification.title,
        message: notification.body,
        type: 'info',
        is_read: false,
        action_url: notification.click_action
      });

      // Send push notification
      await pushNotificationService.sendToUser(userId, notification);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  // Send order update notification
  static async notifyOrderUpdate(userId: string, orderNumber: string, status: string) {
    const notification: PushNotificationData = {
      title: 'Order Update 📦',
      body: `Your order #${orderNumber} has been ${status.toLowerCase()}`,
      data: {
        action_type: 'order_update',
        order_number: orderNumber,
        status: status
      },
      click_action: '/orders'
    };

    await this.sendPushNotification(userId, notification);
  }

  // Send payment success notification
  static async notifyPaymentSuccess(userId: string, amount: number, method: string) {
    const notification: PushNotificationData = {
      title: 'Payment Successful! 💰',
      body: `Your ${method} payment of ${amount} KES was successful`,
      data: {
        action_type: 'payment_success',
        amount: amount,
        method: method
      },
      click_action: '/wallet'
    };

    await this.sendPushNotification(userId, notification);
  }

  // Send new message notification
  static async notifyNewMessage(userId: string, senderName: string) {
    const notification: PushNotificationData = {
      title: 'New Message 💬',
      body: `${senderName} sent you a message`,
      data: {
        action_type: 'new_message',
        sender_name: senderName
      },
      click_action: '/chat'
    };

    await this.sendPushNotification(userId, notification);
  }

  // Send points earned notification
  static async notifyPointsEarnedPush(userId: string, points: number, reason: string) {
    const notification: PushNotificationData = {
      title: 'Points Earned! 🎉',
      body: `You earned ${points} points for ${reason}. Keep earning to unlock rewards!`,
      data: {
        action_type: 'points_earned',
        points: points,
        reason: reason
      },
      click_action: '/wallet'
    };

    await this.sendPushNotification(userId, notification);
  }

  // Send vendor order notification
  static async notifyVendorNewOrder(vendorId: string, orderNumber: string, total: number) {
    const notification: PushNotificationData = {
      title: 'New Order! 🛍️',
      body: `You received a new order #${orderNumber} worth ${total} KES`,
      data: {
        action_type: 'vendor_order',
        order_number: orderNumber,
        total: total
      },
      click_action: '/vendor-dashboard?section=orders'
    };

    await this.sendPushNotification(vendorId, notification);
  }

  // Send promotional notification
  static async sendPromotionalNotification(userIds: string[], title: string, message: string, actionUrl?: string) {
    const notification: PushNotificationData = {
      title,
      body: message,
      data: {
        action_type: 'promotional',
        action_url: actionUrl
      },
      click_action: actionUrl || '/'
    };

    // Use the new sendToUsers method for better performance
    await pushNotificationService.sendToUsers(userIds, notification);
  }

  // ===== NEW FLEXIBLE NOTIFICATION METHODS =====

  // Send custom notification with full control
  static async sendCustomNotification(
    userId: string, 
    notification: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      image?: string;
      tag?: string;
      requireInteraction?: boolean;
      silent?: boolean;
      data?: Record<string, any>;
      click_action?: string;
    }
  ) {
    const pushNotification: PushNotificationData = {
      title: notification.title,
      body: notification.body,
      icon: notification.icon,
      badge: notification.badge,
      image: notification.image,
      tag: notification.tag,
      requireInteraction: notification.requireInteraction,
      silent: notification.silent,
      data: notification.data,
      click_action: notification.click_action
    };

    await this.sendPushNotification(userId, pushNotification);
  }

  // Send notification to multiple users with filtering
  static async sendBulkNotification(
    userIds: string[],
    notification: PushNotificationData,
    options?: {
      excludeInactiveUsers?: boolean;
      excludeUnsubscribedUsers?: boolean;
      userFilter?: (userId: string) => Promise<boolean>;
    }
  ) {
    let filteredUserIds = userIds;

    // Apply filters if provided
    if (options?.excludeInactiveUsers) {
      // You can implement logic to filter out inactive users
      // filteredUserIds = await this.filterActiveUsers(userIds);
    }

    if (options?.userFilter) {
      const validUsers = [];
      for (const userId of filteredUserIds) {
        if (await options.userFilter(userId)) {
          validUsers.push(userId);
        }
      }
      filteredUserIds = validUsers;
    }

    await pushNotificationService.sendToUsers(filteredUserIds, notification);
  }

  // Send scheduled notification (basic implementation)
  static async scheduleNotification(
    userId: string,
    notification: PushNotificationData,
    scheduledTime: Date
  ) {
    // Store in database for later processing
    await this.createNotification({
      user_id: userId,
      title: `Scheduled: ${notification.title}`,
      message: notification.body,
      type: 'info',
      is_read: false,
      action_url: notification.click_action
    });

    // You can implement a cron job or scheduled function to process these
    console.log(`Notification scheduled for ${scheduledTime} to user ${userId}`);
  }

  // Send notification based on user preferences
  static async sendPreferenceBasedNotification(
    userId: string,
    notification: PushNotificationData,
    category: 'marketing' | 'order' | 'payment' | 'chat' | 'system'
  ) {
    // Check user preferences (you'll need to implement this)
    const userPrefs = await this.getUserNotificationPreferences(userId);
    
    if (userPrefs[category]) {
      await this.sendPushNotification(userId, notification);
    } else {
      // Only send in-app notification if push is disabled
      await this.createNotification({
        user_id: userId,
        title: notification.title,
        message: notification.body,
        type: 'info',
        is_read: false,
        action_url: notification.click_action
      });
    }
  }

  // Get user notification preferences (placeholder)
  static async getUserNotificationPreferences(userId: string) {
    // This should query your user preferences table
    // For now, return default preferences
    return {
      marketing: true,
      order: true,
      payment: true,
      chat: true,
      system: true
    };
  }

  // Send notification with rich content
  static async sendRichNotification(
    userId: string,
    notification: {
      title: string;
      body: string;
      image?: string;
      actions?: Array<{
        action: string;
        title: string;
        icon?: string;
      }>;
      data?: Record<string, any>;
    }
  ) {
    const pushNotification: PushNotificationData = {
      title: notification.title,
      body: notification.body,
      image: notification.image,
      data: {
        ...notification.data,
        actions: notification.actions
      }
    };

    await this.sendPushNotification(userId, pushNotification);
  }

  // Send notification with different priorities
  static async sendPriorityNotification(
    userId: string,
    notification: PushNotificationData,
    priority: 'low' | 'normal' | 'high' | 'urgent'
  ) {
    const priorityNotification: PushNotificationData = {
      ...notification,
      data: {
        ...notification.data,
        priority: priority
      },
      requireInteraction: priority === 'urgent',
      silent: priority === 'low'
    };

    await this.sendPushNotification(userId, priorityNotification);
  }

  // Send notification to users based on criteria
  static async sendTargetedNotification(
    criteria: {
      userType?: 'customer' | 'vendor' | 'admin';
      location?: string;
      lastActive?: Date;
      subscriptionType?: string;
      customFilter?: (userId: string) => Promise<boolean>;
    },
    notification: PushNotificationData
  ) {
    // Get users based on criteria
    let userIds = await this.getUsersByCriteria(criteria);
    
    if (criteria.customFilter) {
      const filteredUsers = [];
      for (const userId of userIds) {
        if (await criteria.customFilter(userId)) {
          filteredUsers.push(userId);
        }
      }
      userIds = filteredUsers;
    }

    await pushNotificationService.sendToUsers(userIds, notification);
  }

  // Get users by criteria (placeholder)
  static async getUsersByCriteria(criteria: any): Promise<string[]> {
    // This should query your users table based on criteria
    // For now, return empty array
    return [];
  }

  // Send notification with A/B testing
  static async sendABTestNotification(
    userIds: string[],
    variantA: PushNotificationData,
    variantB: PushNotificationData,
    splitRatio: number = 0.5
  ) {
    const groupA = userIds.slice(0, Math.floor(userIds.length * splitRatio));
    const groupB = userIds.slice(Math.floor(userIds.length * splitRatio));

    // Send variant A to group A
    if (groupA.length > 0) {
      await pushNotificationService.sendToUsers(groupA, variantA);
    }

    // Send variant B to group B
    if (groupB.length > 0) {
      await pushNotificationService.sendToUsers(groupB, variantB);
    }
  }

  // Send notification with retry logic
  static async sendNotificationWithRetry(
    userId: string,
    notification: PushNotificationData,
    maxRetries: number = 3
  ) {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        await this.sendPushNotification(userId, notification);
        break; // Success, exit retry loop
      } catch (error) {
        retries++;
        console.error(`Notification send failed (attempt ${retries}):`, error);
        
        if (retries >= maxRetries) {
          console.error(`Failed to send notification after ${maxRetries} attempts`);
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
      }
    }
  }
}
