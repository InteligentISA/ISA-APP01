import { PushNotifications } from '@capacitor/push-notifications';
import { App } from '@capacitor/app';
import { supabase } from '@/integrations/supabase/client';

export interface PushNotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  image?: string;
  badge?: number;
  sound?: string;
  click_action?: string;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private isInitialized = false;
  private currentToken: string | null = null;
  private currentUserId: string | null = null;

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async initialize(userId?: string): Promise<void> {
    if (this.isInitialized) return;

    // Check if we're on a web browser
    const isWeb = this.getPlatform() === 'web';
    
    if (isWeb) {
      console.log('Push notifications not available on web browser');
      this.isInitialized = true;
      if (userId) {
        this.currentUserId = userId;
      }
      return;
    }

    try {
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        await PushNotifications.register();
        this.setupListeners();
        this.isInitialized = true;
        
        if (userId) {
          this.currentUserId = userId;
          await this.saveTokenToDatabase();
        }
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  private setupListeners(): void {
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success:', token.value);
      this.currentToken = token.value;
      if (this.currentUserId) {
        this.saveTokenToDatabase();
      }
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error.error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed:', notification);
      this.handleNotificationClicked(notification);
    });

    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        this.clearBadge();
      }
    });
  }

  private async saveTokenToDatabase(): Promise<void> {
    if (!this.currentToken || !this.currentUserId) return;

    try {
      const { data: existingToken } = await supabase
        .from('notification_tokens')
        .select('id')
        .eq('user_id', this.currentUserId)
        .eq('token', this.currentToken)
        .single();

      if (!existingToken) {
        await supabase
          .from('notification_tokens')
          .insert({
            user_id: this.currentUserId,
            token: this.currentToken,
            platform: this.getPlatform(),
            is_active: true
          });
      }
    } catch (error) {
      console.error('Error saving notification token:', error);
    }
  }

  private getPlatform(): 'android' | 'ios' | 'web' {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('android')) return 'android';
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
    return 'web';
  }

  private handleNotificationReceived(notification: any): void {
    this.showInAppNotification({
      title: notification.title,
      body: notification.body,
      data: notification.data
    });
  }

  private handleNotificationClicked(notification: any): void {
    const data = notification.notification.data;
    
    if (data?.action_url) {
      window.location.href = data.action_url;
    } else if (data?.action_type) {
      switch (data.action_type) {
        case 'order_update':
          window.location.href = '/orders';
          break;
        case 'new_message':
          window.location.href = '/chat';
          break;
        case 'payment_success':
          window.location.href = '/wallet';
          break;
        default:
          window.location.href = '/';
      }
    }
  }

  private showInAppNotification(notification: PushNotificationData): void {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50 transform transition-all duration-300 translate-x-full';
    toast.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
            </svg>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900">${notification.title}</p>
          <p class="text-sm text-gray-500 mt-1">${notification.body}</p>
        </div>
        <button class="flex-shrink-0 text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 100);

    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      }, 300);
    }, 5000);
  }

  async clearBadge(): Promise<void> {
    try {
      await PushNotifications.removeAllDeliveredNotifications();
    } catch (error) {
      console.error('Error clearing badge:', error);
    }
  }

  async sendToUser(userId: string, notification: PushNotificationData): Promise<void> {
    try {
      const response = await supabase.functions.invoke('push-notifications', {
        body: {
          action: 'send-to-user',
          userId,
          notification: {
            title: notification.title,
            body: notification.body,
            image: notification.image,
            click_action: notification.click_action,
            sound: notification.sound || 'default',
            badge: notification.badge || 1
          },
          data: notification.data
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }
    } catch (error) {
      console.error('Error sending notification to user:', error);
    }
  }

  async sendToToken(token: string, notification: PushNotificationData): Promise<void> {
    try {
      const response = await supabase.functions.invoke('push-notifications', {
        body: {
          action: 'send',
          tokens: [token],
          notification: {
            title: notification.title,
            body: notification.body,
            image: notification.image,
            click_action: notification.click_action,
            sound: notification.sound || 'default',
            badge: notification.badge || 1
          },
          data: notification.data
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }
    } catch (error) {
      console.error('Error sending notification to token:', error);
    }
  }

  async updateUserId(userId: string | null): Promise<void> {
    this.currentUserId = userId;
    
    if (userId && this.currentToken) {
      await this.saveTokenToDatabase();
    }
  }

  async sendToUsers(userIds: string[], notification: PushNotificationData): Promise<void> {
    try {
      // Get all tokens for the users
      const { data: tokens, error } = await supabase
        .from('notification_tokens')
        .select('token')
        .in('user_id', userIds)
        .eq('is_active', true);

      if (error) {
        throw new Error(`Failed to get user tokens: ${error.message}`);
      }

      if (!tokens || tokens.length === 0) {
        console.log('No active tokens found for users');
        return;
      }

      const tokenList = tokens.map(t => t.token);
      
      const response = await supabase.functions.invoke('push-notifications', {
        body: {
          action: 'send',
          tokens: tokenList,
          notification: {
            title: notification.title,
            body: notification.body,
            image: notification.image,
            click_action: notification.click_action,
            sound: notification.sound || 'default',
            badge: notification.badge || 1
          },
          data: notification.data
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }
    } catch (error) {
      console.error('Error sending notification to users:', error);
    }
  }

  async sendToTopic(topic: string, notification: PushNotificationData): Promise<void> {
    try {
      const response = await supabase.functions.invoke('push-notifications', {
        body: {
          action: 'send-to-topic',
          topic,
          notification: {
            title: notification.title,
            body: notification.body,
            image: notification.image,
            click_action: notification.click_action,
            sound: notification.sound || 'default',
            badge: notification.badge || 1
          },
          data: notification.data
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }
    } catch (error) {
      console.error('Error sending notification to topic:', error);
    }
  }

  async removeToken(): Promise<void> {
    if (this.currentToken && this.currentUserId) {
      try {
        await supabase
          .from('notification_tokens')
          .update({ is_active: false })
          .eq('user_id', this.currentUserId)
          .eq('token', this.currentToken);
      } catch (error) {
        console.error('Error removing notification token:', error);
      }
    }
    
    this.currentUserId = null;
  }
}

export const pushNotificationService = PushNotificationService.getInstance();
