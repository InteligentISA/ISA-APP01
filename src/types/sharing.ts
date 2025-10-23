export interface SharedContent {
  id: string;
  user_id: string;
  content_type: 'product' | 'wishlist' | 'cart' | 'conversation';
  content_id: string;
  share_code: string;
  metadata: any;
  view_count: number;
  created_at: string;
  expires_at?: string;
}

export interface ShareResult {
  share_code: string;
  share_url: string;
  expires_at?: string;
}

export interface ShareButtonProps {
  contentType: 'product' | 'wishlist' | 'cart' | 'conversation';
  contentId: string;
  contentTitle?: string;
  contentImage?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showText?: boolean;
}

export interface ProductShareMetadata {
  product_name: string;
  product_price: number;
  product_image: string;
  product_category: string;
  product_description?: string;
  vendor_name?: string;
}

export interface WishlistShareMetadata {
  items_count: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    image_url: string;
    vendor_name?: string;
  }>;
}

export interface CartShareMetadata {
  items_count: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image_url: string;
    vendor_name?: string;
  }>;
  total_amount?: number;
}

export interface ConversationShareMetadata {
  conversation_title: string;
  conversation_preview: string;
  message_count: number;
  last_message_at: string;
}

export type ShareMetadata = 
  | ProductShareMetadata 
  | WishlistShareMetadata 
  | CartShareMetadata 
  | ConversationShareMetadata;
