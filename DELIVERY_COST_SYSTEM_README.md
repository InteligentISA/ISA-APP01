# Delivery Cost System

This document describes the hierarchical delivery cost calculation system implemented for the ISA-APP04 platform.

## Overview

The delivery cost system uses a hierarchical approach to calculate shipping costs based on:
- **Base Cost**: Fixed base delivery cost (default: Ksh 200)
- **County Cost**: Cost between different counties
- **Constituency Cost**: Cost between different constituencies (within same county)
- **Ward Cost**: Cost between different wards (only for hotspot counties)

**Total Delivery Cost = Base Cost + County Cost + Constituency Cost + Ward Cost**

## Hotspot Counties

The following counties are considered "hotspot" areas and have ward-level granularity:
- Nairobi County
- Kiambu County
- Machakos County
- Kajiado County

For these counties, delivery costs can be calculated down to the ward level for more accurate pricing.

## Database Schema

### Tables Created

1. **counties** - All 47 Kenyan counties
2. **constituencies** - Constituencies within each county
3. **wards** - Wards within constituencies (only for hotspot counties)
4. **delivery_base_cost** - Base delivery cost configuration
5. **delivery_county_costs** - County-to-county delivery costs
6. **delivery_constituency_costs** - Constituency-to-constituency delivery costs
7. **delivery_ward_costs** - Ward-to-ward delivery costs

### Profile Updates

Added location fields to the `profiles` table:
- `county` - Customer's county
- `constituency` - Customer's constituency
- `ward` - Customer's ward (for hotspot counties)
- `whatsapp_number` - WhatsApp number for delivery coordination

### Product Updates

Added pickup location fields to the `products` table:
- `pickup_county` - Vendor's pickup county
- `pickup_constituency` - Vendor's pickup constituency
- `pickup_ward` - Vendor's pickup ward (for hotspot counties)

## API Functions

### Database Function

A PostgreSQL function `calculate_delivery_cost` is created to calculate delivery costs:

```sql
calculate_delivery_cost(
  from_county_name TEXT,
  to_county_name TEXT,
  from_constituency_name TEXT DEFAULT NULL,
  from_ward_name TEXT DEFAULT NULL,
  to_constituency_name TEXT DEFAULT NULL,
  to_ward_name TEXT DEFAULT NULL
) RETURNS DECIMAL
```

## Services

### DeliveryCostService

Main service for calculating delivery costs:

```typescript
// Calculate delivery cost between two locations
DeliveryCostService.calculateDeliveryCost(fromLocation, toLocation)

// Get delivery cost for a specific product
DeliveryCostService.getProductDeliveryCost(productId, customerLocation)

// Get delivery costs for multiple products (cart)
DeliveryCostService.getCartDeliveryCost(products, customerLocation)

// Validate delivery location
DeliveryCostService.validateDeliveryLocation(location)
```

### LocationDataService

Service for managing location data:

```typescript
// Populate location data from static data
LocationDataService.populateLocationData()

// Get location statistics
LocationDataService.getLocationStats()
```

## Components

### LocationConfirmation

Component for customers to confirm/update their delivery location during checkout:

```tsx
<LocationConfirmation
  currentLocation={customerLocation}
  onLocationUpdate={handleLocationUpdate}
  onConfirm={handleLocationConfirm}
  isEditing={isEditing}
  onEditToggle={handleEditToggle}
/>
```

### VendorPickupLocationConfirmation

Component for vendors to confirm their pickup location during product upload:

```tsx
<VendorPickupLocationConfirmation
  currentLocation={pickupLocation}
  onLocationUpdate={handleLocationUpdate}
  onConfirm={handleLocationConfirm}
  isEditing={isEditing}
  onEditToggle={handleEditToggle}
  required={true}
/>
```

### DeliveryCostDisplay

Component to display delivery cost information on product details:

```tsx
<DeliveryCostDisplay
  productId={productId}
  customerLocation={customerLocation}
  onLocationUpdate={handleLocationUpdate}
  showLocationSelector={true}
/>
```

### CheckoutDeliveryCosts

Component to display delivery costs during checkout:

```tsx
<CheckoutDeliveryCosts
  cartItems={cartItems}
  customerLocation={customerLocation}
  onLocationUpdate={handleLocationUpdate}
/>
```

## Setup Instructions

### 1. Run Database Migration

The migration file `20250115000000-add-location-fields-to-profiles.sql` should be applied to create all necessary tables and functions.

### 2. Populate Location Data

Run the location data population script:

```typescript
import { LocationDataService } from './src/services/locationDataService';

// Populate all location data
await LocationDataService.populateLocationData();
```

### 3. Set Up Delivery Costs

Admins can set up delivery costs through the admin panel:

1. **Base Cost**: Set the base delivery cost (default: Ksh 200)
2. **County Costs**: Set costs between all county pairs
3. **Constituency Costs**: Set costs between constituencies (for hotspot counties)
4. **Ward Costs**: Set costs between wards (for hotspot counties)

## Usage Examples

### Customer Onboarding

During customer onboarding, collect location information:

```typescript
const customerLocation: DeliveryLocation = {
  county: "Nairobi County",
  constituency: "Westlands",
  ward: "Kitisuru",
  whatsapp_number: "+254700000000"
};
```

### Product Upload

During product upload, vendors confirm their pickup location:

```typescript
const pickupLocation: DeliveryLocation = {
  county: "Kiambu County",
  constituency: "Thika Town",
  ward: "Township"
};

await ProductService.updateProductPickupLocation(
  productId, 
  vendorId, 
  pickupLocation
);
```

### Delivery Cost Calculation

Calculate delivery cost for a product:

```typescript
const { data: deliveryCost } = await DeliveryCostService.getProductDeliveryCost(
  productId, 
  customerLocation
);

console.log(`Delivery cost: Ksh ${deliveryCost?.totalCost}`);
```

### Cart Delivery Costs

Calculate delivery costs for multiple products:

```typescript
const cartItems = [
  { id: "product1", quantity: 2 },
  { id: "product2", quantity: 1 }
];

const { data: cartDeliveryCosts } = await DeliveryCostService.getCartDeliveryCost(
  cartItems, 
  customerLocation
);

console.log(`Total delivery cost: Ksh ${cartDeliveryCosts?.totalCost}`);
```

## Admin Management

### Managing Delivery Costs

Admins can manage delivery costs through the admin panel:

1. **Base Cost Management**: Update the base delivery cost
2. **County Cost Matrix**: Set costs between all county pairs
3. **Constituency Cost Matrix**: Set costs between constituencies
4. **Ward Cost Matrix**: Set costs between wards

### Cost Structure

- **Same Location**: Only base cost (e.g., same county, constituency, ward = Ksh 200)
- **Different Counties**: Base cost + county cost
- **Different Constituencies**: Base cost + county cost + constituency cost
- **Different Wards**: Base cost + county cost + constituency cost + ward cost

## Benefits

1. **Accurate Pricing**: More granular cost calculation based on actual distance
2. **Flexible Management**: Admins can adjust costs for different routes
3. **Customer Transparency**: Clear breakdown of delivery costs
4. **Vendor Control**: Vendors can set their pickup locations
5. **Scalable**: Easy to add new counties, constituencies, or wards

## Future Enhancements

1. **Real-time Cost Updates**: Update costs based on fuel prices or demand
2. **Delivery Time Estimation**: Include estimated delivery times
3. **Bulk Discounts**: Reduce per-item costs for multiple items
4. **Express Delivery**: Premium delivery options with higher costs
5. **Dynamic Pricing**: Adjust costs based on time of day or demand

## Troubleshooting

### Common Issues

1. **Location Data Not Populated**: Run `LocationDataService.populateLocationData()`
2. **Invalid Location**: Use `DeliveryCostService.validateDeliveryLocation()` to validate
3. **Missing Costs**: Ensure all cost matrices are populated in admin panel
4. **Performance Issues**: Add indexes on frequently queried columns

### Debugging

Enable debug logging to see cost calculation details:

```typescript
// Check if location data is populated
const isPopulated = await LocationDataService.isLocationDataPopulated();

// Get location statistics
const stats = await LocationDataService.getLocationStats();
console.log('Location stats:', stats);
```
