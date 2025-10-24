interface SocialPreviewConfig {
  contentType: 'product' | 'wishlist' | 'cart' | 'conversation';
  data: any;
  shareUrl: string;
}

export class SocialPreviewService {
  private static readonly LOGO_URL = '/myplug-logo.png';
  private static readonly BRAND_COLOR = '#f97316'; // Orange-500

  static generatePreviewImage(config: SocialPreviewConfig): string {
    // For now, we'll return the appropriate image based on content type
    // In a production app, you'd generate a custom image using Canvas API or a service like Cloudinary
    
    switch (config.contentType) {
      case 'product':
        return this.generateProductPreview(config.data);
      case 'cart':
        return this.generateCartPreview(config.data);
      case 'wishlist':
        return this.generateWishlistPreview(config.data);
      case 'conversation':
        return this.generateConversationPreview(config.data);
      default:
        return this.LOGO_URL;
    }
  }

  private static generateProductPreview(data: any): string {
    // Return the product image if available, otherwise return logo
    return data.product_image || this.LOGO_URL;
  }

  private static generateCartPreview(data: any): string {
    // Return the first cart item image if available, otherwise return logo
    return data.items?.[0]?.image_url || this.LOGO_URL;
  }

  private static generateWishlistPreview(data: any): string {
    // Return the first wishlist item image if available, otherwise return logo
    return data.items?.[0]?.image_url || this.LOGO_URL;
  }

  private static generateConversationPreview(data: any): string {
    // Always return logo for conversations
    return this.LOGO_URL;
  }

  static generateCustomPreviewImage(config: SocialPreviewConfig): Promise<string> {
    return new Promise((resolve) => {
      // This would be implemented with Canvas API to create custom preview images
      // For now, we'll return the appropriate image
      const imageUrl = this.generatePreviewImage(config);
      resolve(imageUrl);
    });
  }

  static getPreviewDimensions(): { width: number; height: number } {
    // Standard social media preview dimensions
    return {
      width: 1200,
      height: 630
    };
  }

  static getPreviewText(contentType: string, data: any): string {
    switch (contentType) {
      case 'product':
        return `${data.product_name} - KES ${data.product_price?.toLocaleString()}`;
      case 'cart':
        return `🛒 My Cart (${data.items_count || 0} items) - MyPlug`;
      case 'wishlist':
        return `❤️ My Wishlist (${data.items_count || 0} items) - MyPlug`;
      case 'conversation':
        return `💬 Chat with MyPlug's AI - Smart Shopping Assistant`;
      default:
        return 'Shared via MyPlug';
    }
  }

  static getPreviewDescription(contentType: string, data: any): string {
    switch (contentType) {
      case 'product':
        return data.product_description || 'Check out this amazing product on MyPlug!';
      case 'cart':
        return `Check out my cart with ${data.items_count || 0} items on MyPlug!`;
      case 'wishlist':
        return `Check out my wishlist with ${data.items_count || 0} items on MyPlug!`;
      case 'conversation':
        return 'Chat with MyPlug\'s smart AI shopper! Get personalized product recommendations.';
      default:
        return 'Discover amazing products on MyPlug!';
    }
  }
}

