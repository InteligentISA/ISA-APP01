# Subscription Types System

This document describes the new subscription types system that allows users to subscribe to individual features like WhatsApp, Email, Mobile notifications, etc.

## Overview

The system uses a **hybrid approach** combining both EAV (Entity-Attribute-Value) and separate tables for optimal flexibility and performance.

### Architecture

1. **Subscription Types** - Defines individual features (WhatsApp, Email, Mobile, Push)
2. **Subscription Plans** - Defines pricing tiers (Basic, Standard, Premium, Enterprise)
3. **Plan-to-Type Mappings** - Links which features are included in each plan
4. **User Plan Subscriptions** - Tracks which plan a user is subscribed to
5. **User Active Subscriptions** - Tracks which individual features a user has activated

## Database Schema

### Tables Created

#### 1. `subscription_types`
Defines available subscription types like WhatsApp, Email, Mobile notifications.

```sql
CREATE TABLE subscription_types (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE,              -- 'whatsapp', 'email', 'mobile'
  display_name TEXT,             -- 'WhatsApp', 'Email', 'Mobile'
  description TEXT,
  icon_name TEXT,                -- For UI icons
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER
);
```

#### 2. `subscription_plans`
Defines pricing tiers and plans.

```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE,              -- 'basic', 'premium'
  display_name TEXT,             -- 'Basic Plan', 'Premium Plan'
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  description TEXT,
  features JSONB,
  is_active BOOLEAN DEFAULT true
);
```

#### 3. `subscription_plan_types`
Maps which subscription types are included in each plan.

```sql
CREATE TABLE subscription_plan_types (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES subscription_plans(id),
  type_id UUID REFERENCES subscription_types(id),
  is_included BOOLEAN DEFAULT true
);
```

#### 4. `user_plan_subscriptions`
Tracks which plan a user is subscribed to.

```sql
CREATE TABLE user_plan_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  plan_id UUID REFERENCES subscription_plans(id),
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired')),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  price_paid DECIMAL(10,2),
  currency TEXT,
  started_at TIMESTAMP,
  expires_at TIMESTAMP,
  auto_renew BOOLEAN DEFAULT true
);
```

#### 5. `user_active_subscriptions`
Tracks which individual features a user has activated.

```sql
CREATE TABLE user_active_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  type_id UUID REFERENCES subscription_types(id),
  is_active BOOLEAN DEFAULT true,
  activated_at TIMESTAMP,
  deactivated_at TIMESTAMP
);
```

## Default Data

The migration includes default subscription types:

- **WhatsApp** - Receive notifications via WhatsApp
- **Email** - Receive email notifications
- **Mobile** - Receive SMS and mobile notifications
- **Push** - Receive browser push notifications

And default plans:

- **Basic Plan** - $9/month or $99/year - Includes WhatsApp and Email
- **Standard Plan** - $19/month or $199/year - Includes WhatsApp, Email, and Mobile
- **Premium Plan** - $49/month or $499/year - Includes all subscription types
- **Enterprise Plan** - $99/month or $999/year - Includes all subscription types

## Usage

### Service Layer

The `SubscriptionTypesService` provides all the necessary methods:

```typescript
import { SubscriptionTypesService } from '@/services/subscriptionTypesService';

// Get all subscription types
const types = await SubscriptionTypesService.getSubscriptionTypes();

// Get all plans
const plans = await SubscriptionTypesService.getSubscriptionPlans();

// Get user's active subscriptions
const activeSubs = await SubscriptionTypesService.getUserActiveSubscriptions(userId);

// Toggle a subscription type on/off
await SubscriptionTypesService.toggleSubscriptionType(userId, typeId, true);

// Check if user has access to a specific type
const hasWhatsApp = await SubscriptionTypesService.hasSubscriptionType(userId, 'whatsapp');
```

### UI Component

Use the `SubscriptionTypesManager` component in your pages:

```typescript
import { SubscriptionTypesManager } from '@/components/SubscriptionTypesManager';

function MyPage() {
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  
  return (
    <>
      <Button onClick={() => setShowSubscriptions(true)}>
        Manage Subscriptions
      </Button>
      
      <SubscriptionTypesManager 
        isOpen={showSubscriptions}
        onClose={() => setShowSubscriptions(false)}
      />
    </>
  );
}
```

### API Endpoints

The service automatically handles:

#### GET `/subscription-types`
Returns all active subscription types.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "whatsapp",
    "display_name": "WhatsApp",
    "description": "Receive notifications via WhatsApp",
    "icon_name": "message-circle",
    "is_active": true
  }
]
```

#### POST `/toggle-subscription`
Toggle a subscription type on/off.

**Body:**
```json
{
  "typeId": "uuid",
  "isActive": true
}
```

#### GET `/user-subscriptions`
Get user's active subscriptions.

**Response:**
```json
{
  "plan": {
    "id": "uuid",
    "name": "basic",
    "status": "active",
    "billing_cycle": "monthly",
    "expires_at": "2025-02-14T00:00:00Z"
  },
  "activeTypes": [
    {
      "id": "uuid",
      "type_id": "uuid",
      "subscription_type": {
        "name": "whatsapp",
        "display_name": "WhatsApp"
      },
      "is_active": true
    }
  ]
}
```

## Why This Approach?

### EAV vs Separate Tables

**Neither approach alone is ideal**:

- **EAV Only**: Would create a single `subscriptions` table with `user_id`, `type`, and `value`. This becomes messy and hard to query for specific types.

- **Separate Tables Only**: Would create `whatsapp_subscriptions`, `email_subscriptions`, etc. This is difficult to maintain and harder to query across all subscriptions.

**Our Hybrid Approach** provides the best of both worlds:

1. **Flexibility**: Easy to add new subscription types without schema changes
2. **Performance**: Indexed queries for fast access
3. **Normalization**: Follows database best practices
4. **Scalability**: Can handle unlimited subscription types
5. **Maintainability**: Clean, organized structure

### Benefits

- ✅ Users can toggle individual features independently
- ✅ Plans define which features are included
- ✅ Easy to add new subscription types
- ✅ Efficient database queries
- ✅ Flexible pricing per plan
- ✅ Automatic expiry handling
- ✅ Row Level Security enabled

## Future Enhancements

1. **Payment Integration**: Connect with payment providers for automatic subscription renewal
2. **Usage Tracking**: Track how users use different subscription types
3. **Tiered Features**: Some features only available on higher tiers
4. **Subscription Bundles**: Allow users to purchase multiple types together
5. **Trial Periods**: Offer free trials for premium features

## Running the Migration

To apply the database changes:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the SQL file
psql your_database < 20250114000000-create-subscription-types-system.sql
```

## Testing

```typescript
// Test getting subscription types
const types = await SubscriptionTypesService.getSubscriptionTypes();
console.log('Available types:', types);

// Test getting plans
const plans = await SubscriptionTypesService.getSubscriptionPlans();
console.log('Available plans:', plans);

// Test toggling a subscription
await SubscriptionTypesService.toggleSubscriptionType(userId, 'type-id', true);

// Test checking access
const hasEmail = await SubscriptionTypesService.hasSubscriptionType(userId, 'email');
console.log('Has email subscription:', hasEmail);
```

## Security

All tables have Row Level Security (RLS) enabled:

- **Users** can view and modify only their own subscriptions
- **Admins** can manage all subscriptions
- **Subscription types and plans** are readable by all authenticated users
- **Only admins** can modify subscription types and plans

## Example Workflow

1. **Admin creates subscription types** via admin panel or SQL
2. **Admin creates plans** and maps types to plans
3. **User signs up** and sees available plans
4. **User subscribes to a plan** (e.g., Basic Plan)
5. **System automatically activates** all subscription types included in that plan
6. **User can toggle** individual subscription types on/off
7. **System checks** subscription status before sending notifications

## Monitoring

To monitor subscription usage:

```sql
-- Count active subscriptions by type
SELECT st.name, COUNT(*) as active_users
FROM user_active_subscriptions uas
JOIN subscription_types st ON uas.type_id = st.id
WHERE uas.is_active = true
GROUP BY st.name;

-- Count subscriptions by plan
SELECT sp.display_name, COUNT(*) as subscribers
FROM user_plan_subscriptions ups
JOIN subscription_plans sp ON ups.plan_id = sp.id
WHERE ups.status = 'active'
GROUP BY sp.display_name;

-- Users with no active subscriptions
SELECT COUNT(*) as users_without_subscriptions
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM user_plan_subscriptions ups
  WHERE ups.user_id = p.id AND ups.status = 'active'
);
```

