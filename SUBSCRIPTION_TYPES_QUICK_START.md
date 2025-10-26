# Subscription Types System - Quick Start Guide

## What Was Built

A flexible subscription system that allows users to subscribe to individual features (WhatsApp, Email, Mobile, Push notifications) with toggle on/off functionality.

## Files Created

### 1. Database Migration
- **File**: `ISA-APP01/supabase/migrations/20250114000000-create-subscription-types-system.sql`
- **What it does**: Creates 5 new tables for managing subscription types and plans

### 2. Service Layer
- **File**: `ISA-APP01/src/services/subscriptionTypesService.ts`
- **What it does**: Provides API methods to manage subscriptions

### 3. UI Component
- **File**: `ISA-APP01/src/components/SubscriptionTypesManager.tsx`
- **What it does**: Provides a beautiful UI for users to manage their subscriptions

### 4. Documentation
- **File**: `ISA-APP01/SUBSCRIPTION_TYPES_README.md`
- **What it does**: Complete documentation of the system

### 5. Examples
- **File**: `ISA-APP01/src/components/ExampleSubscriptionUsage.tsx`
- **What it does**: Shows how to use the subscription system in your code

## How to Use

### Step 1: Run the Migration

Run the SQL migration in your Supabase database:

```bash
# Option 1: Using Supabase CLI
cd ISA-APP01
supabase db push

# Option 2: Manually apply the SQL
psql your_connection_string < supabase/migrations/20250114000000-create-subscription-types-system.sql
```

### Step 2: Add to Your Page

Add the subscription manager to any page where you want users to manage their subscriptions:

```typescript
import { SubscriptionTypesManager } from '@/components/SubscriptionTypesManager';

function ProfilePage() {
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  
  return (
    <div>
      <Button onClick={() => setShowSubscriptions(true)}>
        Manage Subscriptions
      </Button>
      
      <SubscriptionTypesManager 
        isOpen={showSubscriptions}
        onClose={() => setShowSubscriptions(false)}
      />
    </div>
  );
}
```

### Step 3: Check Subscriptions in Your Code

When you need to send notifications, check if the user has that subscription type:

```typescript
import { SubscriptionTypesService } from '@/services/subscriptionTypesService';

// Before sending WhatsApp notification
const hasWhatsApp = await SubscriptionTypesService.hasSubscriptionType(userId, 'whatsapp');
if (hasWhatsApp) {
  // Send WhatsApp notification
}

// Before sending email
const hasEmail = await SubscriptionTypesService.hasSubscriptionType(userId, 'email');
if (hasEmail) {
  // Send email
}
```

## Database Schema Explained

### Tables

1. **subscription_types** - Defines available types (WhatsApp, Email, etc.)
2. **subscription_plans** - Defines pricing plans (Basic, Premium, etc.)
3. **subscription_plan_types** - Maps which types are in which plans
4. **user_plan_subscriptions** - Tracks user's subscription to a plan
5. **user_active_subscriptions** - Tracks which types user has active

### Why This Approach?

We use a **hybrid approach** because:
- ✅ Allows toggling individual features on/off
- ✅ Easy to add new subscription types
- ✅ Efficient database queries with indexes
- ✅ Maintains data normalization
- ✅ Scalable to unlimited subscription types

## Default Data Included

### Subscription Types
- WhatsApp
- Email
- Mobile
- Push Notifications

### Subscription Plans
- Basic Plan: $9/month or $99/year
- Standard Plan: $19/month or $199/year
- Premium Plan: $49/month or $499/year
- Enterprise Plan: $99/month or $999/year

## Features

✅ **Toggle on/off** - Users can individually enable/disable subscription types
✅ **Plan-based** - Users subscribe to plans that include specific types
✅ **Auto-expiry** - Subscriptions automatically expire based on billing cycle
✅ **Security** - Row Level Security enabled on all tables
✅ **Scalable** - Easy to add new subscription types without code changes

## API Methods Available

```typescript
// Get all subscription types
await SubscriptionTypesService.getSubscriptionTypes()

// Get all plans
await SubscriptionTypesService.getSubscriptionPlans()

// Get user's active subscriptions
await SubscriptionTypesService.getUserActiveSubscriptions(userId)

// Toggle a subscription type
await SubscriptionTypesService.toggleSubscriptionType(userId, typeId, true)

// Check if user has a specific type
await SubscriptionTypesService.hasSubscriptionType(userId, 'whatsapp')

// Subscribe to a plan
await SubscriptionTypesService.subscribeToPlan(userId, planId, 'monthly', 'mpesa', 'tx-123')

// Cancel plan subscription
await SubscriptionTypesService.cancelPlanSubscription(userId)
```

## Next Steps

1. **Run the migration** to create the database tables
2. **Import the UI component** in your pages
3. **Check subscriptions** before sending notifications
4. **Customize plans** by editing the default data in the migration
5. **Add payment integration** for automatic subscription renewal

## Testing

Test the system:

```bash
# In your browser console or component
import { SubscriptionTypesService } from '@/services/subscriptionTypesService';

// Get available types
const types = await SubscriptionTypesService.getSubscriptionTypes();
console.log('Types:', types);

// Get available plans
const plans = await SubscriptionTypesService.getSubscriptionPlans();
console.log('Plans:', plans);
```

## Support

For questions or issues, see the full documentation in `SUBSCRIPTION_TYPES_README.md`.

