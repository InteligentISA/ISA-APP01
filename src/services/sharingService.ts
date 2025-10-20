import { supabase } from '@/integrations/supabase/client';

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

export class SharingService {
  static async createShareLink(
    contentType: 'product' | 'wishlist' | 'cart' | 'conversation',
    contentId: string,
    metadata: any = {},
    expiresInDays?: number
  ): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase
        .from('shared_content')
        .insert({
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
          metadata,
          expires_at: expiresAt
        })
        .select()
        .single();

      if (error) throw error;

      const shareUrl = `${window.location.origin}/shared/${data.share_code}`;
      return shareUrl;
    } catch (error) {
      console.error('Error creating share link:', error);
      return null;
    }
  }

  static async getSharedContent(shareCode: string): Promise<SharedContent | null> {
    try {
      const { data, error } = await supabase
        .from('shared_content')
        .select('*')
        .eq('share_code', shareCode)
        .single();

      if (error) throw error;

      // Check if content has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return null;
      }

      // Increment view count
      await supabase
        .from('shared_content')
        .update({ view_count: data.view_count + 1 })
        .eq('id', data.id);

      return data;
    } catch (error) {
      console.error('Error fetching shared content:', error);
      return null;
    }
  }

  static async getUserSharedContent(): Promise<SharedContent[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('shared_content')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user shared content:', error);
      return [];
    }
  }

  static async deleteSharedContent(shareId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('shared_content')
        .delete()
        .eq('id', shareId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting shared content:', error);
      return false;
    }
  }

  static async shareProduct(productId: string, productData: any): Promise<string | null> {
    return this.createShareLink('product', productId, {
      product: productData,
      title: productData.name,
      description: productData.description,
      image: productData.image_url
    });
  }

  static async shareWishlist(wishlistItems: any[]): Promise<string | null> {
    return this.createShareLink('wishlist', 'wishlist', {
      items: wishlistItems,
      title: 'My Wishlist',
      description: `${wishlistItems.length} items in my wishlist`
    });
  }

  static async shareCart(cartItems: any[]): Promise<string | null> {
    return this.createShareLink('cart', 'cart', {
      items: cartItems,
      title: 'My Cart',
      description: `${cartItems.length} items in my cart`
    });
  }

  static async shareConversation(conversationId: string, conversationData: any): Promise<string | null> {
    return this.createShareLink('conversation', conversationId, {
      conversation: conversationData,
      title: conversationData.title,
      description: conversationData.preview
    });
  }

  static async shareToSocial(shareUrl: string, title: string, description: string, image?: string) {
    const text = `${title} - ${description}`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(text);
    
    const socialLinks = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    };

    return socialLinks;
  }

  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }
}
