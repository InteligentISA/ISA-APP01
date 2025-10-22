export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  images?: string[];
  main_image?: string;
  stock_quantity: number;
  sku?: string;
  tags?: string[];
  specifications?: Record<string, any>;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_active: boolean;
  banned?: boolean;
  banned_reason?: string;
  vendor_id?: string;
  created_at: string;
  updated_at: string;
  currency?: string;
  commission_percentage?: number;
  pickup_location?: string;
  pickup_phone_number?: string;
  
  // Pickup location fields for delivery cost calculation
  pickup_county?: string;
  pickup_constituency?: string;
  pickup_ward?: string;
  
  // Product dimensions and weight
  weight_kg?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  
  // Warranty
  warranty_period?: number;
  warranty_unit?: 'months' | 'years';
  
  // Materials (for household items)
  materials?: string[];
  
  // Electronics specific fields
  ram?: string;
  storage?: string;
  processor?: string;
  display_size?: string;
  display_resolution?: string;
  display_size_inch?: number;
  hdd_size?: string;
  memory_capacity_gb?: number;
  modem_type?: string;
  mount_type?: string;
  plug_type?: string;
  system_memory?: string;
  voltage?: string;
  battery_capacity_mah?: number;
  connection_gender?: string;
  cpu_manufacturer?: string;
  graphics_memory_gb?: number;
  memory_technology?: string;
  panel_type?: string;
  processor_type?: string;
  storage_capacity_gb?: number;
  
  // Clothing/Fashion specific fields
  measurements?: {
    bust_min?: number;
    bust_max?: number;
    waist_min?: number;
    waist_max?: number;
    hips_min?: number;
    hips_max?: number;
    arm_length?: number;
    height_range?: string;
    bra_size?: string;
    uk_size?: string;
    usa_size?: string;
    au_size?: string;
    it_size?: string;
    eu_size?: string;
  };
  collection_type?: string;
  size_label?: string;
  // Vendor information
  vendor?: {
    first_name?: string;
    last_name?: string;
  };
  // Approval workflow fields
  status?: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  // Return policy fields
  return_eligible?: boolean;
  return_policy_guidelines?: string;
  return_policy_reason?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  comment?: string;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    first_name?: string;
    last_name?: string;
  };
  profiles?: {
    first_name?: string;
    last_name?: string;
  };
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  image_description?: string;
  display_order: number;
  is_main_image: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductAttribute {
  id: string;
  product_id: string;
  attribute_name: string;
  attribute_value: string;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  featured?: boolean;
  tags?: string[];
}

export interface ProductSortOption {
  field: 'name' | 'price' | 'rating' | 'created_at' | 'review_count' | 'random';
  direction: 'asc' | 'desc';
}

export interface ProductSearchParams {
  query?: string;
  filters?: ProductFilters;
  sort?: ProductSortOption;
  page?: number;
  limit?: number;
}

// Customer Behavior Tracking Types
export interface UserProductInteraction {
  id: string;
  user_id: string;
  product_id: string;
  interaction_type: 'view' | 'like' | 'add_to_cart' | 'purchase' | 'review' | 'share';
  interaction_data?: Record<string, any>;
  created_at: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  category: string;
  preference_score: number; // 0-1 scale
  interaction_count: number;
  last_interaction_at: string;
  created_at: string;
  updated_at: string;
}

export interface ProductPopularity {
  id: string;
  product_id: string;
  view_count: number;
  like_count: number;
  cart_add_count: number;
  purchase_count: number;
  revenue_generated: number;
  conversion_rate: number; // purchases / views
  last_updated_at: string;
  created_at: string;
}

export interface UserRecommendation {
  id: string;
  user_id: string;
  product_id: string;
  recommendation_score: number; // 0-1 scale
  recommendation_reason?: string;
  is_viewed: boolean;
  created_at: string;
  expires_at: string;
}

export interface ProductWithPopularity extends Product {
  popularity?: ProductPopularity;
}

// Add a source field to distinguish product origin
type ProductSource = 'vendor' | 'jumia';

export interface DashboardJumiaProduct {
  id: string; // generated unique id for React key
  name: string;
  price: number;
  rating: number;
  link: string;
  image: string;
  source: 'jumia';
}

export interface DashboardVendorProduct extends Product {
  source: 'vendor';
}

export type DashboardProduct = DashboardVendorProduct | DashboardJumiaProduct; 