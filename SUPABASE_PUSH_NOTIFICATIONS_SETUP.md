# Supabase Push Notifications Setup Guide

This guide shows you how to set up WhatsApp-style push notifications using only Supabase (no Firebase required).

## 🚀 What We've Implemented

- ✅ **Supabase Edge Functions** for sending notifications
- ✅ **Web Push API** for browser notifications
- ✅ **FCM API** for mobile notifications (when needed)
- ✅ **Capacitor integration** for mobile apps
- ✅ **Database storage** for notification tokens
- ✅ **Automatic token management**

## 📋 Setup Steps

### 1. Deploy the Edge Function

```bash
# Deploy the push notifications function
supabase functions deploy push-notifications
```

### 2. Set Environment Variables

In your Supabase dashboard, go to Settings > Edge Functions and add these environment variables:

```bash
# For FCM (optional - only if you want mobile notifications)
FCM_SERVER_KEY=your_fcm_server_key_here

# For Web Push API (recommended)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

### 3. Generate VAPID Keys (for Web Push)

You can generate VAPID keys using this online tool: https://web-push-codelab.glitch.me/

Or use this Node.js script:

```javascript
const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
```

### 4. Run Database Migration

```bash
# Apply the notification tokens table
npx supabase db push
```

## 🎯 Usage Examples

### Send Order Update Notification
```typescript
await NotificationService.notifyOrderUpdate(userId, 'ORD-123', 'shipped');
```

### Send Payment Success Notification
```typescript
await NotificationService.notifyPaymentSuccess(userId, 1500, 'M-Pesa');
```

### Send New Message Notification
```typescript
await NotificationService.notifyNewMessage(userId, 'John Doe');
```

### Send Promotional Notification
```typescript
await NotificationService.sendPromotionalNotification(
  userIds,
  'Flash Sale! 🎉',
  'Get 50% off on all electronics today!',
  '/flash-sale'
);
```

## 🔧 How It Works

### 1. Token Storage
- User tokens are stored in the `notification_tokens` table
- Supports multiple devices per user
- Automatic cleanup of inactive tokens

### 2. Notification Sending
- Uses Supabase Edge Functions for serverless processing
- Supports both Web Push API and FCM
- Automatic fallback between platforms

### 3. Mobile Integration
- Capacitor handles mobile push notifications
- Automatic permission requests
- Badge management

## 🎨 Notification Types

### Order Notifications
- Order confirmation
- Status updates
- Delivery notifications

### Payment Notifications
- Payment success/failure
- Wallet updates

### Social Notifications
- New messages
- Friend requests

### Promotional Notifications
- Flash sales
- Special offers

## 🚀 Benefits of This Approach

### ✅ Cost-Effective
- No Firebase costs
- Uses Supabase free tier
- Pay only for what you use

### ✅ Integrated
- Works seamlessly with existing Supabase setup
- Single database for all data
- Consistent authentication

### ✅ Scalable
- Serverless Edge Functions
- Automatic scaling
- Global distribution

### ✅ Simple
- No additional services to manage
- Standard Web Push API
- Easy to maintain

## 🔒 Security

- Row Level Security (RLS) on token table
- User can only access their own tokens
- Secure Edge Function execution
- Environment variable protection

## 🧪 Testing

### Test the Edge Function
```bash
# Test locally
supabase functions serve push-notifications

# Test with curl
curl -X POST http://localhost:54321/functions/v1/push-notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_anon_key" \
  -d '{
    "action": "send-to-user",
    "userId": "user_id_here",
    "notification": {
      "title": "Test Notification",
      "body": "This is a test notification"
    }
  }'
```

### Test in Browser
```javascript
// Request notification permission
const permission = await Notification.requestPermission();

if (permission === 'granted') {
  // Register for push notifications
  const registration = await navigator.serviceWorker.register('/sw.js');
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'your_vapid_public_key'
  });
  
  console.log('Push subscription:', subscription);
}
```

## 🎉 Success!

Your app now has WhatsApp-style push notifications using only Supabase! 

### Features:
- ✅ Rich notifications with images and actions
- ✅ Sound and vibration
- ✅ Badge counts
- ✅ Deep linking to app sections
- ✅ Background notification handling
- ✅ Topic-based messaging
- ✅ Automatic token management
- ✅ Cost-effective solution

### Next Steps:
1. Deploy the Edge Function
2. Set up VAPID keys
3. Test notifications
4. Customize notification styles
5. Add more notification types

Your users will receive beautiful, engaging notifications that enhance their app experience without any Firebase dependency!
