import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, Copy, Check, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SharingService } from '@/services/sharingService';
import { useAuth } from '@/hooks/useAuth';
import { ShareButtonProps } from '@/types/sharing';

export const ShareButton: React.FC<ShareButtonProps> = ({
  contentType,
  contentId,
  contentTitle,
  contentImage,
  className = '',
  variant = 'outline',
  size = 'sm',
  showText = true
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const getContentIcon = () => {
    return <Share2 className="h-4 w-4" />;
  };

  const getContentLabel = () => {
    return 'Share';
  };

  const handleShare = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to share content',
        variant: 'destructive'
      });
      return;
    }

    setIsSharing(true);
    try {
      let result;
      
      switch (contentType) {
        case 'product':
          result = await SharingService.shareProduct(user.id, contentId);
          break;
        case 'wishlist':
          result = await SharingService.shareWishlist(user.id);
          break;
        case 'cart':
          result = await SharingService.shareCart(user.id);
          break;
        case 'conversation':
          result = await SharingService.shareConversation(user.id, contentId);
          break;
        default:
          throw new Error('Invalid content type');
      }

      setShareUrl(result.share_url);
      setShowShareDialog(true);
      toast({
        title: 'Share Link Created!',
        description: 'Your share link has been generated successfully.',
      });
    } catch (error) {
      console.error('Error creating share:', error);
      toast({
        title: 'Share Failed',
        description: 'Failed to create share link. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const success = await SharingService.copyToClipboard(shareUrl);
      if (success) {
        setCopied(true);
        toast({
          title: 'Link Copied!',
          description: 'Share link copied to clipboard.',
        });
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('Clipboard access denied');
      }
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy link to clipboard.',
        variant: 'destructive'
      });
    }
  };

  const handleSocialShare = (platform: 'facebook' | 'twitter' | 'whatsapp') => {
    const url = SharingService.generateSocialShareUrl(platform, shareUrl, contentTitle);
    window.open(url, '_blank', 'width=600,height=400');
  };

  const getSocialIcon = (platform: 'facebook' | 'twitter' | 'whatsapp') => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Button
        onClick={handleShare}
        disabled={isSharing}
        variant={variant}
        size={size}
        className={`flex items-center gap-2 ${className}`}
      >
        {getContentIcon()}
        {showText && getContentLabel()}
        {isSharing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />}
      </Button>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share {getContentLabel()}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Content Preview */}
            {contentImage && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <img 
                  src={contentImage} 
                  alt={contentTitle} 
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {contentTitle}
                  </p>
                  <p className="text-xs text-gray-500">
                    Shared via MyPlug
                  </p>
                </div>
              </div>
            )}

            {/* Share Link */}
            <div className="space-y-2">
              <Label htmlFor="share-url">Share Link</Label>
              <div className="flex gap-2">
                <Input
                  id="share-url"
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="space-y-2">
              <Label>Share on Social Media</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSocialShare('facebook')}
                  variant="outline"
                  size="sm"
                  className="flex-1 flex items-center gap-2"
                >
                  {getSocialIcon('facebook')}
                  Facebook
                </Button>
                <Button
                  onClick={() => handleSocialShare('twitter')}
                  variant="outline"
                  size="sm"
                  className="flex-1 flex items-center gap-2"
                >
                  {getSocialIcon('twitter')}
                  Twitter
                </Button>
                <Button
                  onClick={() => handleSocialShare('whatsapp')}
                  variant="outline"
                  size="sm"
                  className="flex-1 flex items-center gap-2"
                >
                  {getSocialIcon('whatsapp')}
                  WhatsApp
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => setShowShareDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareButton;