import { supabase } from "@/integrations/supabase/client";

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
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  // Get unread notification count
  static async getUnreadCount(userId: string) {
    try {
      const { count, error } = await supabase
        .from('user_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Create notification
  static async createNotification(notification: Omit<Notification, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .insert(notification)
        .select()
        .single();

      if (error) throw error;
      return data;
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
}
