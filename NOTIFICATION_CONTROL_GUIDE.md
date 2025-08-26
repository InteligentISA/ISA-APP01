# Notification Control Guide

This guide explains how to control notifications and their content in your ISA application.

## 🎯 **How to Control Notifications**

### 1. **Pre-built Notification Methods** (Recommended)

Use these methods for common notification types:

```typescript
import { NotificationService } from '@/services/notificationService';

// Order notifications
await NotificationService.notifyOrderUpdate(userId, "ORD-123", "shipped");

// Payment notifications  
await NotificationService.notifyPaymentSuccess(userId, 5000, "M-Pesa");

// Message notifications
await NotificationService.notifyNewMessage(userId, "John Doe");

// Points notifications
await NotificationService.notifyPointsEarnedPush(userId, 100, "purchase");

// Vendor notifications
await NotificationService.notifyVendorNewOrder(vendorId, "ORD-123", 5000);

// Promotional notifications
await NotificationService.sendPromotionalNotification(
  userIds, 
  "Flash Sale! 🎉", 
  "30% off on all electronics today only!", 
  "/flash-sale"
);
```

### 2. **Custom Notification with Full Control**

```typescript
await NotificationService.sendCustomNotification(userId, {
  title: "Custom Title",
  body: "Custom message content",
  icon: "🎉",
  badge: "1",
  image: "https://example.com/image.jpg",
  tag: "unique-tag",
  requireInteraction: true,
  silent: false,
  data: {
    custom_field: "value",
    action_type: "custom_action"
  },
  click_action: "/custom-page"
});
```

### 3. **Bulk Notifications with Filtering**

```typescript
await NotificationService.sendBulkNotification(
  userIds,
  {
    title: "Bulk Notification",
    body: "This goes to multiple users",
    data: { category: "marketing" }
  },
  {
    excludeInactiveUsers: true,
    excludeUnsubscribedUsers: true,
    userFilter: async (userId) => {
      // Custom filter logic
      return true; // or false
    }
  }
);
```

### 4. **Priority-based Notifications**

```typescript
await NotificationService.sendPriorityNotification(
  userId,
  {
    title: "Urgent Update",
    body: "This requires immediate attention"
  },
  "urgent" // low, normal, high, urgent
);
```

### 5. **Rich Notifications with Actions**

```typescript
await NotificationService.sendRichNotification(userId, {
  title: "Rich Notification",
  body: "With custom actions",
  image: "https://example.com/image.jpg",
  actions: [
    {
      action: "accept",
      title: "Accept",
      icon: "✅"
    },
    {
      action: "decline", 
      title: "Decline",
      icon: "❌"
    }
  ],
  data: { custom_data: "value" }
});
```

### 6. **Targeted Notifications**

```typescript
await NotificationService.sendTargetedNotification(
  {
    userType: "customer", // customer, vendor, admin
    location: "Nairobi",
    lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    subscriptionType: "premium",
    customFilter: async (userId) => {
      // Custom filtering logic
      return true;
    }
  },
  {
    title: "Targeted Message",
    body: "Only for specific users"
  }
);
```

### 7. **A/B Testing Notifications**

```typescript
await NotificationService.sendABTestNotification(
  userIds,
  {
    title: "Variant A",
    body: "First version of the message"
  },
  {
    title: "Variant B", 
    body: "Second version of the message"
  },
  0.5 // 50/50 split
);
```

### 8. **Scheduled Notifications**

```typescript
await NotificationService.scheduleNotification(
  userId,
  {
    title: "Scheduled Message",
    body: "This will be sent later"
  },
  new Date('2024-01-15T10:00:00Z')
);
```

### 9. **Retry Logic for Reliability**

```typescript
await NotificationService.sendNotificationWithRetry(
  userId,
  {
    title: "Reliable Message",
    body: "Will retry if it fails"
  },
  3 // Max retries
);
```

## 🎛️ **Admin Control Panel**

Access the admin notification panel at `/admin-dashboard` → **Notifications** section.

### Features:
- **Compose Custom Notifications**: Create and send custom messages
- **Target Specific Users**: Send to individual users or filtered groups
- **Category Selection**: Marketing, Order, Payment, System
- **Priority Control**: Low, Normal, High, Urgent
- **Scheduling**: Schedule notifications for future delivery

## 📱 **Notification Content Control**

### **Title & Body**
```typescript
{
  title: "Your Order is Ready! 📦",
  body: "Order #12345 has been prepared and is ready for pickup."
}
```

### **Icons & Badges**
```typescript
{
  icon: "🎉", // Notification icon
  badge: "3", // Badge count
  image: "https://example.com/product.jpg" // Rich image
}
```

### **Actions & Navigation**
```typescript
{
  click_action: "/orders/12345", // Where to navigate when clicked
  data: {
    action_type: "order_update",
    order_id: "12345",
    deep_link: "/orders/12345"
  }
}
```

### **Behavior Control**
```typescript
{
  requireInteraction: true, // User must interact to dismiss
  silent: false, // Play sound or not
  tag: "order-update" // Group similar notifications
}
```

## 🎨 **Notification Templates**

### **Welcome Message**
```typescript
{
  title: "Welcome to ISA! 🎉",
  body: "Thank you for joining our community. Start exploring amazing products!",
  category: "marketing"
}
```

### **Flash Sale**
```typescript
{
  title: "Flash Sale! ⚡",
  body: "Limited time offer! Get up to 70% off on selected items. Don't miss out!",
  category: "marketing"
}
```

### **Order Updates**
```typescript
{
  title: "Order Update 📦",
  body: "Your order #12345 has been shipped and is on its way!",
  category: "order"
}
```

### **Payment Confirmations**
```typescript
{
  title: "Payment Successful! 💰",
  body: "Your M-Pesa payment of 5,000 KES was successful.",
  category: "payment"
}
```

## 🔧 **User Preferences**

Users can control which notifications they receive:

```typescript
// Check user preferences before sending
const userPrefs = await NotificationService.getUserNotificationPreferences(userId);

if (userPrefs.marketing) {
  // Send marketing notification
  await NotificationService.sendPushNotification(userId, notification);
} else {
  // Only send in-app notification
  await NotificationService.createNotification({...});
}
```

## 📊 **Analytics & Tracking**

Track notification performance:

```typescript
// Add tracking data to notifications
{
  data: {
    campaign_id: "flash_sale_2024",
    user_segment: "premium",
    notification_type: "promotional",
    tracking_enabled: true
  }
}
```

## 🚀 **Best Practices**

1. **Keep titles short** (under 50 characters)
2. **Use clear, actionable language**
3. **Include relevant emojis** for visual appeal
4. **Provide clear call-to-action** in the body
5. **Use appropriate categories** for filtering
6. **Test notifications** before sending to large groups
7. **Respect user preferences** and opt-outs
8. **Monitor delivery rates** and engagement

## 🔒 **Security Considerations**

- Notifications are sent through secure Supabase Edge Functions
- User tokens are encrypted and stored securely
- Row Level Security (RLS) protects user data
- Admin access is restricted to authorized users only

## 📞 **Support**

For technical support with notifications:
1. Check the Supabase Edge Function logs
2. Verify environment variables are set correctly
3. Ensure the `notification_tokens` table exists
4. Test with a single user before bulk sending
