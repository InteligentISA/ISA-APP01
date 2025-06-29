import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Heart, Eye, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types/product";
import { OrderService } from "@/services/orderService";
import { CustomerBehaviorService } from "@/services/customerBehaviorService";
import { useAuth } from "@/hooks/useAuth";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  showQuickView?: boolean;
  onAddToCart?: (product: Product) => void;
  onToggleLike?: (productId: string) => void;
  isLiked?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onQuickView,
  showQuickView = false,
  onAddToCart,
  onToggleLike,
  isLiked = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const { toast } = useToast();
  const { user } = useAuth();

  // Track product view when component mounts
  useEffect(() => {
    if (user) {
      CustomerBehaviorService.trackInteraction(user.id, product.id, 'view');
    }
  }, [user, product.id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    if (product.stock_quantity === 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Track the interaction
      await CustomerBehaviorService.trackInteraction(user.id, product.id, 'add_to_cart', {
        quantity: quantity
      });

      // Add to cart using OrderService
      await OrderService.addToCart(user.id, {
        product_id: product.id,
        quantity: quantity
      });
      
      // Call parent handler if provided
      if (onAddToCart) {
        onAddToCart(product);
      }
      
      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
      });
      
      // Reset quantity after adding to cart
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLike = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newLikeState = !localIsLiked;
      
      // Track the interaction
      await CustomerBehaviorService.trackInteraction(
        user.id, 
        product.id, 
        newLikeState ? 'like' : 'unlike'
      );

      setLocalIsLiked(newLikeState);
      
      // Call parent handler if provided
      if (onToggleLike) {
        onToggleLike(product.id);
      }
      
      toast({
        title: newLikeState ? "Added to wishlist!" : "Removed from wishlist",
        description: `${product.name} has been ${newLikeState ? 'added to' : 'removed from'} your wishlist.`,
      });
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to update wishlist.",
        variant: "destructive",
      });
    }
  };

  const handleQuickView = () => {
    if (!onQuickView) return;
    onQuickView(product);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-slate-700">
        <img
          src={product.main_image || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            {showQuickView && (
              <Button
                size="icon"
                variant="secondary"
                className="w-10 h-10 bg-white/90 hover:bg-white text-gray-900"
                onClick={handleQuickView}
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="icon"
              variant="secondary"
              className={`w-10 h-10 ${localIsLiked ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/90 hover:bg-white text-gray-900'}`}
              onClick={handleToggleLike}
            >
              <Heart className={`w-4 h-4 ${localIsLiked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_featured && (
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs">
              Featured
            </Badge>
          )}
          {product.stock_quantity === 0 && (
            <Badge variant="destructive" className="text-xs">
              Out of Stock
            </Badge>
          )}
          {product.original_price && product.original_price > product.price && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs">
              {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
            </Badge>
          )}
        </div>

        {/* Stock indicator */}
        {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
              Only {product.stock_quantity} left
            </Badge>
          </div>
        )}
      </div>

      {/* Product Info */}
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Category */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
            {product.brand && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {product.brand}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex">
              {renderStars(product.rating)}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({product.review_count})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {product.stock_quantity > 0 ? (
              <span className="text-green-600 dark:text-green-400">
                In Stock ({product.stock_quantity} available)
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="p-4 pt-0">
        <div className="w-full space-y-3">
          {/* Quantity Selector */}
          {product.stock_quantity > 0 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                size="icon"
                variant="outline"
                className="w-8 h-8"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-8 text-center text-sm font-medium">
                {quantity}
              </span>
              <Button
                size="icon"
                variant="outline"
                className="w-8 h-8"
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                disabled={quantity >= product.stock_quantity}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0 || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Adding...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4" />
                <span>
                  {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </span>
              </div>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard; 