# Vendor-Grouped Delivery Cost System

## Overview
Updated the delivery cost calculation system to charge delivery fees only once per vendor, regardless of how many products are purchased from that vendor.

## Changes Made

### 1. DeliveryCostService Updates
- **New Method**: `getCartItemsDeliveryCost()` - Groups cart items by vendor and calculates delivery cost once per vendor
- **Updated Method**: `getCartDeliveryCost()` - Enhanced to support vendor grouping
- **Logic**: Products from the same vendor share a single delivery fee

### 2. EnhancedCheckoutModal Updates
- Updated `calculateDeliveryCosts()` to use the new vendor-grouped calculation
- Now uses `DeliveryCostService.getCartItemsDeliveryCost()` instead of calculating per product

### 3. CheckoutDeliveryCosts Updates
- Updated to use vendor-grouped delivery cost calculation
- Updated interface to support vendor information in cart items
- Updated delivery information text to reflect new pricing model

## How It Works

### Before (Per-Product Charging)
```
Cart: 2 phones from Vendor A + 1 watch from Vendor A
Delivery Cost: Phone 1 (Ksh 200) + Phone 2 (Ksh 200) + Watch (Ksh 200) = Ksh 600
```

### After (Per-Vendor Charging)
```
Cart: 2 phones from Vendor A + 1 watch from Vendor A
Delivery Cost: Vendor A (Ksh 200) = Ksh 200
```

## Benefits

1. **Fair Pricing**: Customers aren't penalized for buying multiple items from the same vendor
2. **Encourages Bulk Orders**: Customers can buy multiple products from one vendor without extra delivery costs
3. **Logical Pricing**: Delivery cost reflects the actual logistics (one trip per vendor)
4. **Better UX**: Clearer pricing structure for customers

## Technical Implementation

### Vendor Grouping Logic
```typescript
// Group products by vendor
const vendorGroups = new Map<string, CartItem[]>();

for (const cartItem of cartItems) {
  const vendorId = cartItem.product.vendor_id || 'default';
  if (!vendorGroups.has(vendorId)) {
    vendorGroups.set(vendorId, []);
  }
  vendorGroups.get(vendorId)!.push(cartItem);
}

// Calculate delivery cost once per vendor
for (const [vendorId, vendorProducts] of vendorGroups) {
  const deliveryCost = calculateDeliveryCost(firstProduct, customerLocation);
  totalCost += deliveryCost; // Only charged once per vendor
}
```

### Database Schema
- Products have `vendor_id` field referencing `profiles.id`
- Cart items include product information with vendor details
- Delivery cost calculation uses vendor grouping

## Testing

Use the test file `test-delivery-cost.js` to verify the implementation:
- Multiple products from same vendor = 1 delivery fee
- Products from different vendors = separate delivery fees
- Products without vendor = treated as separate group

## User Experience

### Checkout Display
- Shows delivery cost breakdown by vendor
- Additional products from same vendor show Ksh 0 delivery cost
- Clear messaging about vendor-grouped pricing

### Example Scenarios

**Scenario 1: Same Vendor**
- 2 mobile phones from Vendor A
- 1 watch from Vendor A
- **Result**: 1 delivery fee (Ksh 200)

**Scenario 2: Different Vendors**
- 1 phone from Vendor A
- 1 laptop from Vendor B
- **Result**: 2 delivery fees (Ksh 200 + Ksh 200 = Ksh 400)

**Scenario 3: Mixed**
- 2 phones from Vendor A
- 1 laptop from Vendor B
- 1 book (no vendor)
- **Result**: 3 delivery fees (Ksh 200 + Ksh 200 + Ksh 200 = Ksh 600)
