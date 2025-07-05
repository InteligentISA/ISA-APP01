# Jumia Product Interactions

This document describes the implementation of user interaction tracking for Jumia products in the ISA application.

## Overview

The Jumia interaction system allows users to:
- Like/unlike Jumia products
- View Jumia products (tracked automatically)
- Click on Jumia product links (tracked automatically)
- Add Jumia products to cart (tracked, but doesn't actually add to cart since they're external)
- View their liked Jumia products in a dedicated modal
- Access analytics and trending data for Jumia products

## Database Schema

### `jumia_product_interactions` Table

```sql
CREATE TABLE public.jumia_product_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  jumia_product_id TEXT NOT NULL, -- The unique identifier from Jumia
  jumia_product_name TEXT NOT NULL,
  jumia_product_price DECIMAL(10,2) NOT NULL,
  jumia_product_link TEXT NOT NULL,
  jumia_product_image TEXT,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'unlike', 'view', 'add_to_cart', 'click')),
  interaction_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes for Performance

- `idx_jumia_interactions_user_id` - For user-specific queries
- `idx_jumia_interactions_product_id` - For product-specific queries
- `idx_jumia_interactions_type` - For interaction type filtering
- `idx_jumia_interactions_created_at` - For time-based queries
- `idx_jumia_interactions_user_product` - For user-product combinations
- `idx_jumia_unique_like` - Prevents duplicate likes per user-product

### Row Level Security (RLS)

Users can only:
- View their own interactions
- Insert their own interactions
- Update their own interactions
- Delete their own interactions

## Services

### JumiaInteractionService

Located at `src/services/jumiaInteractionService.ts`

#### Key Methods:

1. **trackInteraction(userId, jumiaProduct, interactionType, interactionData?)**
   - Records any interaction with a Jumia product
   - Supports: like, unlike, view, add_to_cart, click

2. **getLikedJumiaProducts(userId)**
   - Returns all Jumia products liked by a user

3. **isJumiaProductLiked(userId, jumiaProductId)**
   - Checks if a specific Jumia product is liked by a user

4. **unlikeJumiaProduct(userId, jumiaProductId)**
   - Removes a like for a Jumia product

5. **getUserJumiaInteractionHistory(userId, interactionType?, limit?)**
   - Returns user's interaction history with optional filtering

6. **getJumiaProductAnalytics(jumiaProductId)**
   - Returns analytics for a specific Jumia product

7. **getTrendingJumiaProducts(limit?)**
   - Returns trending Jumia products based on recent interactions

8. **getUserJumiaPreferences(userId)**
   - Returns user's preferences based on interaction patterns

## Components Updated

### Dashboard.tsx
- Loads user's liked Jumia products on mount
- Handles Jumia product like/unlike actions
- Passes Jumia data to LikedItemsModal
- Shows combined count of vendor + Jumia liked items

### ProductCard.tsx
- Tracks Jumia product views automatically
- Handles Jumia product likes with proper backend storage
- Tracks clicks on "Shop on Jumia" buttons
- Shows Jumia badge on Jumia products
- Prevents adding Jumia products to cart (external links only)

### LikedItemsModal.tsx
- Shows both vendor and Jumia products in separate sections
- Loads Jumia product details from backend
- Allows removing Jumia products from likes
- Provides "View on Jumia" buttons for external navigation
- Shows loading states for Jumia products

## Usage Examples

### Tracking a Like
```typescript
await JumiaInteractionService.trackInteraction(
  userId,
  {
    id: 'jumia-product-123',
    name: 'Samsung Galaxy Phone',
    price: 25000,
    link: 'https://jumia.co.ke/samsung-phone',
    image: 'https://example.com/phone.jpg'
  },
  'like',
  {
    category: 'electronics',
    source: 'jumia'
  }
);
```

### Checking if Product is Liked
```typescript
const { liked } = await JumiaInteractionService.isJumiaProductLiked(
  userId, 
  'jumia-product-123'
);
```

### Getting User's Liked Products
```typescript
const { data: likedProducts } = await JumiaInteractionService.getLikedJumiaProducts(userId);
```

## Migration

To apply the database changes, run:

```bash
cd ISA
npx supabase db push
```

Or manually execute the SQL in `supabase/migrations/20250701000003-create-jumia-interactions-table.sql`

## Testing

Run the test suite:

```bash
npm test -- jumiaInteractionService.test.ts
```

## Analytics Features

The system provides several analytics capabilities:

1. **Product Analytics**: Track views, likes, clicks, and cart adds per product
2. **Trending Products**: Identify popular products based on recent interactions
3. **User Preferences**: Understand user behavior patterns
4. **Interaction History**: Complete audit trail of user interactions

## Security Considerations

- All interactions are tied to authenticated users
- Row Level Security ensures users can only access their own data
- No sensitive information is stored (only product metadata)
- External links open in new tabs for security

## Future Enhancements

Potential improvements:
- Category-based recommendations
- Price tracking and alerts
- Integration with Jumia API for real-time data
- Advanced analytics dashboard
- Export functionality for user data
- Bulk operations for liked products 