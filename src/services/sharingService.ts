import { supabase } from '@/integrations/supabase/client';
import { SharedContent, ShareResult, ProductShareMetadata, WishlistShareMetadata, CartShareMetadata, ConversationShareMetadata } from '@/types/sharing';
import { MetaTagsService } from './metaTagsService';

export class SharingService {
  static async createShare(
    userId: string,
    contentType: 'product' | 'wishlist' | 'cart' | 'conversation',
    contentId: string,
    metadata: any = {},
    expiresInHours?: number
  ): Promise<ShareResult> {
    try {
      const expiresAt = expiresInHours 
        ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase
        .from('shared_content')
        .insert({
          user_id: userId,
          content_type: contentType,
          content_id: contentId,
          metadata,
          expires_at: expiresAt
        })
        .select('share_code, expires_at')
        .single();

      if (error) throw error;

      const baseUrl = `${window.location.origin}/shared/${data.share_code}`;
      const shareUrl = MetaTagsService.addUTMParameters(baseUrl, 'share', 'app');
      
      return {
        share_code: data.share_code,
        share_url: shareUrl,
        expires_at: data.expires_at
      };
    } catch (error) {
      console.error('Error creating share:', error);
      throw error;
    }
  }

  static async getSharedContent(shareCode: string): Promise<SharedContent | null> {
    try {
      const { data, error } = await supabase
        .from('shared_content')
        .select('*')
        .eq('share_code', shareCode)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) return null;

      await supabase
        .from('shared_content')
        .update({ view_count: data.view_count + 1 })
        .eq('id', data.id);

      return data as unknown as SharedContent;
    } catch (error) {
      console.error('Error getting shared content:', error);
      throw error;
    }
  }

  static async getUserShares(userId: string): Promise<SharedContent[]> {
    try {
      const { data, error } = await supabase
        .from('shared_content')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as SharedContent[];
    } catch (error) {
      console.error('Error getting user shares:', error);
      throw error;
    }
  }

  static async deleteShare(shareId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('shared_content')
        .delete()
        .eq('id', shareId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting share:', error);
      throw error;
    }
  }

  static async shareProduct(userId: string, productId: string): Promise<ShareResult> {
    try {
      let product = null;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('name, price, main_image, category, description')
          .eq('id', productId)
          .single();
        
        if (!error) product = data;
      } catch (fetchError) {
        console.warn('Failed to fetch product details:', fetchError);
      }

      const metadata: ProductShareMetadata = {
        product_name: product?.name || 'Unknown Product',
        product_price: product?.price || 0,
        product_image: product?.main_image || '/placeholder.svg',
        product_category: product?.category || 'General',
        product_description: product?.description,
        vendor_name: null
      };

      return await this.createShare(userId, 'product', productId, metadata);
    } catch (error) {
      console.error('Error sharing product:', error);
      throw error;
    }
  }

  static async shareConversation(userId: string, conversationId: string): Promise<ShareResult> {
    try {
      const { data: conversation } = await supabase
        .from('chat_conversations')
        .select('title, preview, created_at')
        .eq('id', conversationId)
        .single();

      const { count: messageCount } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId);

      const metadata: ConversationShareMetadata = {
        conversation_title: conversation?.title || 'Shared Conversation',
        conversation_preview: conversation?.preview || 'Check out this conversation',
        message_count: messageCount || 0,
        last_message_at: conversation?.created_at || new Date().toISOString()
      };

      return await this.createShare(userId, 'conversation', conversationId, metadata);
    } catch (error) {
      console.error('Error sharing conversation:', error);
      throw error;
    }
  }

  static async shareWishlist(userId: string): Promise<ShareResult> {
    try {
      let wishlistItems: any[] = [];
      try {
        const { data, error } = await (supabase as any)
          .from('user_likes')
          .select(`id, product:products(id, name, price, main_image)`)
          .eq('user_id', userId);

        if (!error) wishlistItems = data || [];
      } catch (error) {
        console.warn('Failed to fetch wishlist items:', error);
      }

      const items = wishlistItems?.map(item => ({
        id: item.product?.id || item.id,
        name: item.product?.name || 'Unknown Product',
        price: item.product?.price || 0,
        image_url: item.product?.main_image || '/placeholder.svg',
        vendor_name: null
      })) || [];

      const metadata: WishlistShareMetadata = { items_count: items.length, items };
      return await this.createShare(userId, 'wishlist', userId, metadata);
    } catch (error) {
      console.error('Error sharing wishlist:', error);
      throw error;
    }
  }

  static async shareCart(userId: string): Promise<ShareResult> {
    try {
      let cartItems: any[] = [];
      try {
        const { data, error } = await supabase
          .from('cart_items')
          .select(`id, quantity, product:products(id, name, price, main_image)`)
          .eq('user_id', userId);

        if (!error) cartItems = data || [];
      } catch (error) {
        console.warn('Failed to fetch cart items:', error);
      }

      const items = cartItems?.map(item => ({
        id: (item as any).product?.id || item.id,
        name: (item as any).product?.name || 'Unknown Product',
        price: (item as any).product?.price || 0,
        quantity: item.quantity || 1,
        image_url: (item as any).product?.main_image || '/placeholder.svg',
        vendor_name: null
      })) || [];

      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const metadata: CartShareMetadata = { items_count: items.length, items, total_amount: totalAmount };
      return await this.createShare(userId, 'cart', userId, metadata);
    } catch (error) {
      console.error('Error sharing cart:', error);
      throw error;
    }
  }

  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const result = document.execCommand('copy');
        textArea.remove();
        return result;
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }

  static generateSocialShareUrl(platform: 'facebook' | 'twitter' | 'whatsapp', url: string, title?: string): string {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title || 'Check this out on MyPlug');
    
    switch (platform) {
      case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      case 'twitter': return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
      case 'whatsapp': return `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
      default: return url;
    }
  }
}
