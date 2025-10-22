# Delivery Cost System Setup Instructions

## Quick Setup

### 1. Database Migration
The migration `20250115000000-add-location-fields-to-profiles.sql` should already be applied. If not, run it in your Supabase dashboard.

### 2. Populate Location Data
You have two options:

#### Option A: Use the TypeScript Service (Recommended)
```typescript
import { LocationDataService } from './src/services/locationDataService';

// Populate all location data
await LocationDataService.populateLocationData();
```

#### Option B: Use the JavaScript Script
1. Update the Supabase credentials in `populate-location-data.js`
2. Run: `node populate-location-data.js`

### 3. Test the System
1. Go to checkout
2. You should now see the new delivery cost system instead of the old "KES 500 fee"
3. Set your delivery location (county, constituency, ward)
4. See the calculated delivery costs per product

## What's Changed

### ✅ New Components
- `CheckoutDeliveryCosts` - Shows delivery costs during checkout
- `LocationConfirmation` - For customers to set delivery location
- `VendorPickupLocationConfirmation` - For vendors to set pickup location
- `DeliveryCostDisplay` - Shows delivery cost on product pages

### ✅ New Services
- `DeliveryCostService` - Calculates delivery costs using hierarchical system
- `LocationDataService` - Manages location data population

### ✅ Updated Services
- `ProductService` - Now includes pickup location and delivery cost methods
- `OrderService` - Now accepts custom delivery fees

### ✅ Database Changes
- Added location fields to `profiles` table
- Added pickup location fields to `products` table
- Created hierarchical location tables (counties, constituencies, wards)
- Created delivery cost tables for different levels

## How It Works

1. **Customer Onboarding**: Collect county, constituency, ward, and WhatsApp number
2. **Product Upload**: Vendors confirm pickup location (county, constituency, ward)
3. **Product Viewing**: Customers see delivery cost to their location
4. **Checkout**: Per-product delivery costs are calculated and displayed
5. **Order Creation**: Uses calculated delivery costs instead of fixed KES 500

## Cost Calculation Formula

```
Total Delivery Cost = Base Cost + County Cost + Constituency Cost + Ward Cost
```

- **Base Cost**: Ksh 200 (configurable by admin)
- **County Cost**: Cost between different counties
- **Constituency Cost**: Cost between different constituencies (same county)
- **Ward Cost**: Cost between different wards (hotspot counties only)

## Admin Management

Admins can manage delivery costs through the website admin panel:
1. Set base delivery cost
2. Configure county-to-county costs
3. Set constituency costs (for hotspot counties)
4. Configure ward costs (for hotspot counties)

## Troubleshooting

### Issue: "Delivery cost not available"
- **Solution**: Make sure location data is populated using `LocationDataService.populateLocationData()`

### Issue: "Invalid county/constituency/ward"
- **Solution**: Check that the location exists in the database and is properly formatted

### Issue: Old delivery system still showing
- **Solution**: Clear browser cache and refresh the page

### Issue: Delivery costs not calculating
- **Solution**: Ensure products have pickup locations set and customer has delivery location set

## Next Steps

1. **Populate Location Data**: Run the population script
2. **Set Up Admin Costs**: Configure delivery costs through admin panel
3. **Test End-to-End**: Try the full checkout flow
4. **Train Staff**: Show vendors how to set pickup locations
5. **Monitor**: Check delivery cost calculations are working correctly

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify location data is populated
3. Ensure all required fields are filled
4. Check that the database migration was applied correctly
