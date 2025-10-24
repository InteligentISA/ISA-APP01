import { SocialPreviewService } from './socialPreviewService';

interface MetaTagConfig {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: 'website' | 'article' | 'product';
  siteName?: string;
  locale?: string;
}

export class MetaTagsService {
  private static readonly SITE_NAME = 'MyPlug';
  private static readonly DEFAULT_IMAGE = '/myplug-logo.png';
  private static readonly BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

  static setMetaTags(config: MetaTagConfig) {
    if (typeof document === 'undefined') return;

    // Use the global function if available (for better social media support)
    if (typeof window !== 'undefined' && (window as any).updateMetaTags) {
      (window as any).updateMetaTags({
        title: config.title,
        description: config.description,
        image: config.image,
        url: config.url,
        type: config.type || 'website'
      });
      return;
    }

    // Fallback to manual meta tag setting
    this.setMetaTag('title', config.title);
    this.setMetaTag('description', config.description);
    this.setMetaTag('og:title', config.title);
    this.setMetaTag('og:description', config.description);
    this.setMetaTag('og:image', config.image);
    this.setMetaTag('og:url', config.url);
    this.setMetaTag('og:type', config.type || 'website');
    this.setMetaTag('og:site_name', config.siteName || this.SITE_NAME);
    this.setMetaTag('og:locale', config.locale || 'en_US');

    // Twitter Card meta tags
    this.setMetaTag('twitter:card', 'summary_large_image');
    this.setMetaTag('twitter:title', config.title);
    this.setMetaTag('twitter:description', config.description);
    this.setMetaTag('twitter:image', config.image);
    this.setMetaTag('twitter:url', config.url);

    // Additional meta tags
    this.setMetaTag('twitter:site', '@myplug');
    this.setMetaTag('twitter:creator', '@myplug');
  }

  private static setMetaTag(property: string, content: string) {
    if (typeof document === 'undefined') return;

    // Handle title tag specially
    if (property === 'title') {
      document.title = content;
      return;
    }

    // Handle description tag specially
    if (property === 'description') {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
      return;
    }

    // Handle Open Graph and Twitter Card tags
    let meta = document.querySelector(`meta[property="${property}"]`) || 
               document.querySelector(`meta[name="${property}"]`);
    
    if (!meta) {
      meta = document.createElement('meta');
      if (property.startsWith('og:') || property.startsWith('twitter:')) {
        meta.setAttribute('property', property);
      } else {
        meta.setAttribute('name', property);
      }
      document.head.appendChild(meta);
    }
    
    meta.setAttribute('content', content);
  }

  static generateProductMetaTags(product: any, shareUrl: string): MetaTagConfig {
    const title = `${product.name} - ${this.SITE_NAME}`;
    const description = product.description 
      ? `${product.description.substring(0, 150)}...` 
      : `Check out this amazing product on ${this.SITE_NAME}!`;
    
    return {
      title,
      description,
      image: product.main_image || this.DEFAULT_IMAGE,
      url: shareUrl,
      type: 'product',
      siteName: this.SITE_NAME
    };
  }

  static generateCartMetaTags(cartItems: any[], shareUrl: string): MetaTagConfig {
    const itemCount = cartItems.length;
    const firstItem = cartItems[0];
    
    const title = `🛒 My Cart (${itemCount} items) - ${this.SITE_NAME}`;
    const description = itemCount > 0 
      ? `Check out my cart with ${itemCount} items including ${firstItem?.name || 'amazing products'}!`
      : `Check out my cart on ${this.SITE_NAME}!`;
    
    return {
      title,
      description,
      image: firstItem?.main_image || this.DEFAULT_IMAGE,
      url: shareUrl,
      type: 'website',
      siteName: this.SITE_NAME
    };
  }

  static generateWishlistMetaTags(wishlistItems: any[], shareUrl: string): MetaTagConfig {
    const itemCount = wishlistItems.length;
    const firstItem = wishlistItems[0];
    
    const title = `❤️ My Wishlist (${itemCount} items) - ${this.SITE_NAME}`;
    const description = itemCount > 0 
      ? `Check out my wishlist with ${itemCount} items including ${firstItem?.name || 'amazing products'}!`
      : `Check out my wishlist on ${this.SITE_NAME}!`;
    
    return {
      title,
      description,
      image: firstItem?.main_image || this.DEFAULT_IMAGE,
      url: shareUrl,
      type: 'website',
      siteName: this.SITE_NAME
    };
  }

  static generateConversationMetaTags(conversation: any, shareUrl: string): MetaTagConfig {
    const title = `💬 Chat with MyPlug's AI - ${this.SITE_NAME}`;
    const description = conversation.title 
      ? `Check out this conversation: "${conversation.title}"`
      : `Chat with MyPlug's smart AI shopper! Get personalized product recommendations and shopping advice.`;
    
    return {
      title,
      description,
      image: this.DEFAULT_IMAGE,
      url: shareUrl,
      type: 'website',
      siteName: this.SITE_NAME
    };
  }

  static addUTMParameters(url: string, source: string = 'share', medium: string = 'social'): string {
    const urlObj = new URL(url);
    urlObj.searchParams.set('utm_source', source);
    urlObj.searchParams.set('utm_medium', medium);
    urlObj.searchParams.set('utm_campaign', 'social_share');
    return urlObj.toString();
  }

  static generateSocialPreviewImage(contentType: string, data: any): string {
    return SocialPreviewService.generatePreviewImage({
      contentType: contentType as any,
      data,
      shareUrl: ''
    });
  }
}
