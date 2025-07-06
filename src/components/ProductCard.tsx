
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Eye, Star, ExternalLink } from "lucide-react";
import { DashboardProduct, DashboardVendorProduct, DashboardJumiaProduct } from "@/types/product";
import { CustomerBehaviorService } from "@/services/customerBehaviorService";

interface ProductCardProps {
  product: DashboardProduct;
  onQuickView: (product: DashboardProduct) => void;
  showQuickView?: boolean;
  onAddToCart: (product: DashboardProduct) => void;
  onToggleLike: (product: DashboardProduct) => void;
  isLiked: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  showQuickView = true,
  onAddToCart,
  onToggleLike,
  isLiked
}) => {
  const isVendorProduct = product.source === 'vendor';
  const vendorProduct = product as DashboardVendorProduct;
  const jumiaProduct = product as DashboardJumiaProduct;

  const handleInteraction = async (interactionType: 'view' | 'like' | 'add_to_cart') => {
    if (isVendorProduct) {
      try {
        await CustomerBehaviorService.trackInteraction('user-id', product.id, interactionType);
      } catch (error) {
        console.error('Failed to track interaction:', error);
      }
    }
  };

  const handleProductClick = () => {
    handleInteraction('view');
    if (showQuickView) {
      onQuickView(product);
    }
  };

  const handleAddToCart = () => {
    handleInteraction('add_to_cart');
    onAddToCart(product);
  };

  const handleToggleLike = () => {
    handleInteraction('like');
    onToggleLike(product);
  };

  // Get appropriate image URL
  const imageUrl = isVendorProduct 
    ? vendorProduct.main_image || '/placeholder.svg'
    : jumiaProduct.image || '/placeholder.svg';

  // Get stock status
  const stockQuantity = product.stock_quantity || 0;
  const isOutOfStock = stockQuantity === 0;

  // For Jumia products, open in new tab
  if (!isVendorProduct) {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2">
            <Badge className="bg-orange-500 text-white">Jumia</Badge>
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 bg-white/80 hover:bg-white"
              onClick={handleToggleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <span className="text-lg font-bold text-gray-900">
                  KES {product.price.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600">{product.rating}</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <a
                href={jumiaProduct.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button className="w-full" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Jumia
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vendor product card
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
      <div className="relative overflow-hidden rounded-t-lg">
        <img 
          src={imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={handleProductClick}
        />
        {vendorProduct.is_featured && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-yellow-500 text-white">Featured</Badge>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 bg-white/80 hover:bg-white"
            onClick={handleToggleLike}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </Button>
          {showQuickView && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 bg-white/80 hover:bg-white"
              onClick={handleProductClick}
            >
              <Eye className="h-4 w-4 text-gray-600" />
            </Button>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer"
              onClick={handleProductClick}>
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                KES {product.price.toLocaleString()}
              </span>
              {vendorProduct.original_price && vendorProduct.original_price > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  KES {vendorProduct.original_price.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600">{vendorProduct.rating || 0}</span>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {vendorProduct.category}
            {stockQuantity > 0 && (
              <span className="ml-2">• {stockQuantity} in stock</span>
            )}
          </div>

          <div className="flex space-x-2 pt-2">
            <Button 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1" 
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
