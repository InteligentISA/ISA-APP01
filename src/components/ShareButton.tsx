import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Share2, Copy, MessageCircle, Twitter, Facebook, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SharingService } from '@/services/sharingService';

interface ShareButtonProps {
  contentType: 'product' | 'wishlist' | 'cart' | 'conversation';
  contentId: string;
  contentData: any;
  title: string;
  description?: string;
  image?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ShareButton({
  contentType,
  contentId,
  contentData,
  title,
  description,
  image,
  className = '',
  size = 'md'
}: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const handleShare = async (method: string) => {
    setIsLoading(true);
    try {
      let shareUrl: string | null = null;

      // Create share link based on content type
      switch (contentType) {
        case 'product':
          shareUrl = await SharingService.shareProduct(contentId, contentData);
          break;
        case 'wishlist':
          shareUrl = await SharingService.shareWishlist(contentData);
          break;
        case 'cart':
          shareUrl = await SharingService.shareCart(contentData);
          break;
        case 'conversation':
          shareUrl = await SharingService.shareConversation(contentId, contentData);
          break;
      }

      if (!shareUrl) {
        throw new Error('Failed to create share link');
      }

      if (method === 'copy') {
        const success = await SharingService.copyToClipboard(shareUrl);
        if (success) {
          toast({
            title: 'Link copied!',
            description: 'Share link copied to clipboard'
          });
        } else {
          throw new Error('Failed to copy to clipboard');
        }
      } else {
        // Open social media share
        const socialLinks = await SharingService.shareToSocial(
          shareUrl,
          title,
          description || '',
          image
        );
        
        const socialUrl = socialLinks[method as keyof typeof socialLinks];
        if (socialUrl) {
          window.open(socialUrl, '_blank', 'width=600,height=400');
        }
      }
    } catch (error) {
      toast({
        title: 'Share failed',
        description: 'Unable to create share link. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`${sizeClasses[size]} ${className}`}
          disabled={isLoading}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleShare('copy')}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
          <MessageCircle className="mr-2 h-4 w-4" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('twitter')}>
          <Twitter className="mr-2 h-4 w-4" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('facebook')}>
          <Facebook className="mr-2 h-4 w-4" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('telegram')}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Telegram
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
