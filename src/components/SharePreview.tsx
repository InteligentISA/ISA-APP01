import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Heart, ShoppingCart, MessageSquare, ExternalLink } from 'lucide-react';

interface SharePreviewProps {
  contentType: 'product' | 'wishlist' | 'cart' | 'conversation';
  data: any;
  shareUrl: string;
  className?: string;
}

export const SharePreview: React.FC<SharePreviewProps> = ({
  contentType,
  data,
  shareUrl,
  className = ''
}) => {
  const getContentIcon = () => {
    switch (contentType) {
      case 'product':
        return <Package className="h-5 w-5 text-orange-600" />;
      case 'wishlist':
        return <Heart className="h-5 w-5 text-red-600" />;
      case 'cart':
        return <ShoppingCart className="h-5 w-5 text-green-600" />;
      case 'conversation':
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
    }
  };

  const getContentTitle = () => {
    switch (contentType) {
      case 'product':
        return data.product_name || 'Product';
      case 'wishlist':
        return `My Wishlist (${data.items_count || 0} items)`;
      case 'cart':
        return `My Cart (${data.items_count || 0} items)`;
      case 'conversation':
        return data.conversation_title || 'Chat with MyPlug AI';
    }
  };

  const getContentDescription = () => {
    switch (contentType) {
      case 'product':
        return data.product_description || `Check out this amazing product on MyPlug!`;
      case 'wishlist':
        return `❤️ Check out my wishlist with ${data.items_count || 0} items on MyPlug!`;
      case 'cart':
        return `🛒 Check out my cart with ${data.items_count || 0} items on MyPlug!`;
      case 'conversation':
        return `💬 Chat with MyPlug's smart AI shopper! Get personalized product recommendations.`;
    }
  };

  const getContentImage = () => {
    switch (contentType) {
      case 'product':
        return data.product_image || '/placeholder.svg';
      case 'wishlist':
      case 'cart':
        return data.items?.[0]?.image_url || '/myplug-logo.png';
      case 'conversation':
        return '/myplug-logo.png';
    }
  };

  const getPriceDisplay = () => {
    if (contentType === 'product' && data.product_price) {
      return `KES ${data.product_price.toLocaleString()}`;
    }
    if (contentType === 'cart' && data.total_amount) {
      return `Total: KES ${data.total_amount.toLocaleString()}`;
    }
    return null;
  };

  const getVendorInfo = () => {
    if (contentType === 'product' && data.vendor_name) {
      return `by ${data.vendor_name}`;
    }
    return null;
  };

  return (
    <Card className={`max-w-md mx-auto bg-white border-2 border-gray-200 hover:border-orange-300 transition-colors ${className}`}>
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative">
          <img
            src={getContentImage()}
            alt={getContentTitle()}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.src = '/myplug-logo.png';
            }}
          />
          {/* Overlay with content type icon */}
          <div className="absolute top-3 left-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
              {getContentIcon()}
            </div>
          </div>
          {/* MyPlug branding */}
          <div className="absolute top-3 right-3">
            <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              MyPlug
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
              {getContentTitle()}
            </h3>
            <ExternalLink className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {getContentDescription()}
          </p>

          {/* Price and Vendor Info */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {getPriceDisplay() && (
                <div className="text-lg font-bold text-orange-600">
                  {getPriceDisplay()}
                </div>
              )}
              {getVendorInfo() && (
                <div className="text-xs text-gray-500">
                  {getVendorInfo()}
                </div>
              )}
            </div>
            
            {/* Content type badge */}
            <Badge 
              variant="secondary" 
              className={`text-xs ${
                contentType === 'product' ? 'bg-orange-100 text-orange-800' :
                contentType === 'wishlist' ? 'bg-red-100 text-red-800' :
                contentType === 'cart' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}
            >
              {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
            </Badge>
          </div>

          {/* Call to Action */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Shared via MyPlug
              </span>
              <div className="flex items-center space-x-1 text-xs text-orange-600">
                <span>View on MyPlug</span>
                <ExternalLink className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SharePreview;

