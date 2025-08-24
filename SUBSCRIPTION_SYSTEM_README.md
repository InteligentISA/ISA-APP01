# Subscription System Implementation

This document outlines the implementation of the subscription system for both vendors and customers in the ISA app, based on the existing website functionality.

## Overview

The subscription system provides tiered access to features and benefits for both vendors and customers, with commission-based pricing for vendors and feature-based pricing for customers.

## Database Schema

### New Tables Created

#### 1. `vendor_subscriptions`
Stores vendor subscription plans and payment information.

```sql
CREATE TABLE vendor_subscriptions (
  id UUID PRIMARY KEY,
  vendor_id UUID REFERENCES profiles(id),
  plan_type TEXT CHECK (plan_type IN ('freemium', 'premium_weekly', 'premium_monthly', 'premium_yearly', 'pro')),
  billing_cycle TEXT CHECK (billing_cycle IN ('one-time', 'weekly', 'monthly', 'yearly')),
  price_kes DECIMAL(10,2),
  status TEXT DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

#### 2. `user_subscriptions`
Stores customer subscription plans and payment information.

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  plan_type TEXT CHECK (plan_type IN ('free', 'premium')),
  billing_cycle TEXT CHECK (billing_cycle IN ('weekly', 'monthly', 'yearly')),
  price_kes DECIMAL(10,2),
  status TEXT DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

#### 3. `vendor_commission_rates`
Stores category-based commission rates for different subscription tiers.

```sql
CREATE TABLE vendor_commission_rates (
  id UUID PRIMARY KEY,
  category_path TEXT UNIQUE,
  main_category TEXT,
  subcategory TEXT,
  freemium_commission_rate DECIMAL(5,2) DEFAULT 10.0,
  premium_commission_rate DECIMAL(5,2) DEFAULT 5.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

#### 4. `notifications`
Stores notifications for vendors and customers.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  vendor_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  product_name TEXT,
  product_id UUID REFERENCES products(id),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE
);
```

## Vendor Subscription Plans

### Plan Tiers

1. **Freemium** (Free)
   - Product limit: 5 products
   - Commission rate: 8-12% (category-based)
   - Features: Basic upload, standard support, basic analytics

2. **Premium Weekly** (Ksh 199/week)
   - Product limit: 20 products
   - Commission rate: 5-9% (category-based)
   - Features: Unlimited uploads, priority support, advanced analytics, featured placement

3. **Premium Monthly** (Ksh 699/month)
   - Product limit: 20 products
   - Commission rate: 4-8% (category-based)
   - Features: All weekly features + dedicated manager, custom branding

4. **Premium Yearly** (Ksh 8,999/year)
   - Product limit: 20 products
   - Commission rate: 3-7% (category-based)
   - Features: All monthly features + VIP events, advanced marketing tools

5. **Pro Executive** (Ksh 9,999 one-time)
   - Product limit: Unlimited
   - Commission rate: 2-6% (category-based)
   - Features: All yearly features + 24/7 support, custom integrations

## Customer Subscription Plans

### Plan Tiers

1. **Free Plan** (Free)
   - Features: Basic browsing, limited AI assistance (5 queries/day), standard delivery

2. **Premium Weekly** (Ksh 199/week)
   - Features: Unlimited AI assistance, virtual try-on, early access, ad-free browsing

3. **Premium Monthly** (Ksh 699/month)
   - Features: All weekly features + monthly recommendations, priority processing

4. **Premium Yearly** (Ksh 6,999/year)
   - Features: All monthly features + free delivery on all orders, VIP service

## Commission System

### How It Works

1. **Category-Based Rates**: Commission rates are stored per category path (e.g., "Electronics/Mobile Phones & Tablets")

2. **Subscription-Based Discounts**: Premium vendors get lower commission rates based on their subscription tier

3. **Automatic Calculation**: Commission rates are automatically calculated and stored when products are created or updated

### Commission Rate Examples

| Category | Freemium Rate | Premium Rate |
|----------|---------------|--------------|
| Electronics | 12% | 6% |
| Fashion | 10% | 5% |
| Home & Garden | 8% | 4% |
| Books & Media | 6% | 3% |

## Implementation Details

### Key Components

1. **VendorSubscription.tsx**: Vendor subscription management interface
2. **CustomerPremium.tsx**: Customer subscription management interface
3. **CommissionService.ts**: Handles commission rate calculations
4. **SubscriptionService.ts**: Manages subscription operations
5. **ProductService.ts**: Updated to include commission calculation on product creation

### Payment Integration

The system supports multiple payment methods:
- M-Pesa
- Airtel Money
- Credit/Debit Cards

### Database Triggers

- **Subscription Expiry**: Automatic expiry date calculation based on billing cycle
- **Status Updates**: Automatic status updates for expired subscriptions

## Usage

### For Vendors

1. **Access Subscription**: Navigate to Vendor Dashboard → Settings → Billing
2. **Choose Plan**: Select from available subscription plans
3. **Payment**: Complete payment using preferred method
4. **Benefits**: Immediately receive lower commission rates and increased product limits

### For Customers

1. **Access Premium**: Navigate to Profile → Premium
2. **Choose Plan**: Select from available premium plans
3. **Payment**: Complete payment using preferred method
4. **Benefits**: Immediately receive premium features and benefits

### Commission Calculation

Commission rates are automatically calculated when:
- Creating new products
- Updating product price or category
- Changing subscription plans

The system fetches the appropriate rate from `vendor_commission_rates` based on:
- Product category path
- Vendor's current subscription tier

## Migration Files

1. `20250731000000-create-subscription-tables.sql`: Creates subscription and commission tables
2. `20250731000001-create-notifications-table.sql`: Creates notifications table

## Security

- Row Level Security (RLS) enabled on all subscription tables
- Users can only access their own subscription data
- Admins have full access to manage all subscriptions
- Commission rates are read-only for authenticated users

## Future Enhancements

1. **Payment Gateway Integration**: Real payment processing with M-Pesa and card providers
2. **Subscription Analytics**: Detailed analytics for subscription performance
3. **Automated Renewals**: Automatic subscription renewal processing
4. **Trial Periods**: Free trial periods for new subscribers
5. **Referral System**: Subscription discounts for referrals

## Testing

To test the subscription system:

1. **Run Migrations**: Apply the database migration files
2. **Test Vendor Flow**: Create a vendor account and test subscription upgrade
3. **Test Customer Flow**: Create a customer account and test premium upgrade
4. **Test Commission**: Create products and verify commission rate calculation
5. **Test Notifications**: Verify notification system works correctly

## Support

For issues or questions about the subscription system:
- Check the database logs for errors
- Verify RLS policies are correctly applied
- Ensure all required tables exist and have proper indexes
- Test commission calculation with different categories and subscription tiers
