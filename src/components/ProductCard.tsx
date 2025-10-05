import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Heart, Eye, Plus, Minus, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Product, DashboardProduct } from "@/types/product";
import { OrderService } from "@/services/orderService";
import { CustomerBehaviorService } from "@/services/customerBehaviorService";
import { JumiaInteractionService } from "@/services/jumiaInteractionService";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Carousel from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { ProductService } from "@/services/productService";
import { useCurrency } from "@/hooks/useCurrency";
import ProductImage from "@/components/ProductImage";
import { soundService } from "@/services/soundService";

interface ProductCardProps {
  product: DashboardProduct;
  onQuickView?: (product: DashboardProduct) => void;
  showQuickView?: boolean;
  onAddToCart?: (product: DashboardProduct) => void;
  onToggleLike?: (product: DashboardProduct) => void;
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
  const { formatPrice: formatCurrencyPrice } = useCurrency();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const { toast } = useToast();
  const { user } = useAuth();

  const [showReviewsDialog, setShowReviewsDialog] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // Track product view and load reviews when component mounts
  useEffect(() => {
    if (user) {
      if (product.source === 'jumia') {
        // Track Jumia product view
        JumiaInteractionService.trackInteraction(
          user.id,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            link: product.link,
            image: product.image
          },
          'view',
          {
            category: 'electronics', // Default category for Jumia products
            source: 'jumia'
          }
        );
      } else {
        // Track vendor product view
        CustomerBehaviorService.trackInteraction(user.id, product.id, 'view');
      }
    }
    
    // Load reviews for vendor products
    if (product.source === 'vendor') {
      loadReviews();
    }
  }, [user, product.id, product.source]);

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    // Only check stock for vendor products (Jumia products don't have stock_quantity)
    if (product.source === 'vendor' && product.stock_quantity === 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Track the interaction based on product source
      if (product.source === 'jumia') {
        await JumiaInteractionService.trackInteraction(
          user.id,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            link: product.link,
            image: product.image
          },
          'add_to_cart',
          {
            quantity: quantity,
            category: 'electronics',
            source: 'jumia'
          }
        );
      } else {
        await CustomerBehaviorService.trackInteraction(user.id, product.id, 'add_to_cart', {
          quantity: quantity
        });
      }

      // Add to cart using OrderService (for both vendor and Jumia products)
      await OrderService.addToCart(user.id, {
        product_id: product.id,
        quantity: 1
      });
      
      // Call parent handler if provided
      if (onAddToCart) {
        onAddToCart(product);
      }
      
      soundService.playAddToCartSound();
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
      
      // Track the interaction based on product source
      if (product.source === 'jumia') {
        if (newLikeState) {
          await JumiaInteractionService.trackInteraction(
            user.id,
            {
              id: product.id,
              name: product.name,
              price: product.price,
              link: product.link,
              image: product.image
            },
            'like',
            {
              category: 'electronics',
              source: 'jumia'
            }
          );
        } else {
          await JumiaInteractionService.unlikeJumiaProduct(user.id, product.id);
          await JumiaInteractionService.trackInteraction(
            user.id,
            {
              id: product.id,
              name: product.name,
              price: product.price,
              link: product.link,
              image: product.image
            },
            'unlike'
          );
        }
      } else {
        await CustomerBehaviorService.trackInteraction(
          user.id, 
          product.id, 
          newLikeState ? 'like' : 'like'
        );
      }
      
      setLocalIsLiked(newLikeState);
      // Call parent handler if provided
      if (onToggleLike) {
        onToggleLike(product);
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
    return formatCurrencyPrice(price);
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



  const handleOpenReviews = async () => {
    setShowReviewsDialog(true);
    setReviewsLoading(true);
    const { data, error } = await ProductService.getProductReviews(product.id);
    setReviews(data || []);
    setReviewsLoading(false);
  };

  const loadReviews = async () => {
    setReviewsLoading(true);
    const { data, error } = await ProductService.getProductReviews(product.id);
    setReviews(data || []);
    setReviewsLoading(false);
  };

  // Helper to get all images for carousel (only for vendor products)
  const productImages = product.source === 'vendor' ? [
    product.main_image,
    ...(product.images || []).filter(img => img !== product.main_image)
  ].filter(Boolean) : [product.image].filter(Boolean);

  // Render for Jumia products
  if (product.source === 'jumia') {
    return (
      <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-slate-700">
          <img
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Like button for Jumia */}
          <button
            className={`absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow ${isLiked ? 'text-red-500' : 'text-gray-400'}`}
            onClick={() => onToggleLike && onToggleLike(product)}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            {isLiked ? <Heart className="w-5 h-5 fill-red-500" /> : <Heart className="w-5 h-5" />}
          </button>
          
          {/* Jumia badge */}
          <Badge className="absolute top-2 left-2 bg-orange-500 text-white text-xs">
            Jumia
          </Badge>
        </div>
        <CardContent className="p-4">
          <div className="font-semibold text-gray-900 dark:text-white truncate mb-1">{product.name}</div>
          <div className="text-lg font-bold text-purple-600 mb-1">{formatPrice(product.price)}</div>
          <div className="flex items-center mb-2">
            <span className="flex items-center mr-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
              ))}
            </span>
            <span className="text-xs text-gray-500">{product.rating > 0 ? product.rating : 'No rating'}</span>
          </div>
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full mt-2 px-4 py-2 bg-orange-500 text-white text-center rounded hover:bg-orange-600 transition"
            onClick={() => {
              // Track click interaction
              if (user) {
                JumiaInteractionService.trackInteraction(
                  user.id,
                  {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    link: product.link,
                    image: product.image
                  },
                  'click',
                  {
                    category: 'electronics',
                    source: 'jumia'
                  }
                );
              }
            }}
          >
            Shop on Jumia
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-slate-700">
        <ProductImage
          mainImage={product.main_image}
          fallbackImages={product.images || []}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Like button (bottom left) */}
        <button
          className={`absolute bottom-2 left-2 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow ${isLiked ? 'text-red-500' : 'text-gray-400'}`}
          onClick={() => onToggleLike && onToggleLike(product)}
          aria-label={isLiked ? 'Unlike' : 'Like'}
        >
          {isLiked ? <Heart className="w-5 h-5 fill-red-500" /> : <Heart className="w-5 h-5" />}
        </button>
        {/* View button (bottom right) */}
        <button
          className="absolute bottom-2 right-2 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow text-gray-700"
          onClick={() => setShowViewModal(true)}
          aria-label="View"
        >
          <Eye className="w-5 h-5" />
        </button>
        {/* Badges - Only for vendor products */}
        {product.source === 'vendor' && (
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
        )}

        {/* Stock indicator - Only for vendor products */}
        {product.source === 'vendor' && product.stock_quantity > 0 && product.stock_quantity <= 5 && (
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
          {/* Category - Only for vendor products */}
          {product.source === 'vendor' && (
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
          )}

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex cursor-pointer" onClick={() => setShowViewModal(true)} title="View all reviews">
              {renderStars(reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : product.rating)}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer" onClick={() => setShowViewModal(true)}>
              ({reviews.length > 0 ? reviews.length : product.review_count || 0})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {product.source === 'vendor' && product.original_price && product.original_price > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          {/* Stock Status - Only for vendor products */}
          {product.source === 'vendor' && (
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
          )}


        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="p-4 pt-0">
        <div className="w-full space-y-3">
          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={(product.source === 'vendor' && product.stock_quantity === 0) || isLoading}
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
                  {(product.source === 'vendor' && product.stock_quantity === 0) ? 'Out of Stock' : 'Add to Cart'}
                </span>
              </div>
            )}
          </Button>

          {/* View Details Button - Only for vendor products */}
          {product.source === 'vendor' && (
            <Button
              variant="outline"
              onClick={() => navigate(`/product/${product.id}`)}
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Details
            </Button>
          )}


        </div>
      </CardFooter>

      {/* Reviews Dialog - Only for vendor products */}
      {product.source === 'vendor' && (
        <Dialog open={showReviewsDialog} onOpenChange={setShowReviewsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Reviews for {product.name}</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              {reviewsLoading ? (
                <div className="text-center py-8">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No reviews yet.</div>
              ) : (
                <ul className="space-y-4">
                  {reviews.map((review) => (
                    <li key={review.id} className="border-b pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {review.profiles?.first_name || 'User'} {review.profiles?.last_name || ''}
                        </span>
                        <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center ml-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </span>
                      </div>
                      {review.title && <div className="font-medium text-gray-800 dark:text-gray-100">{review.title}</div>}
                      {review.comment && <div className="text-gray-700 dark:text-gray-300 text-sm">{review.comment}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReviewsDialog(false)} className="w-full">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View Modal: Carousel + Reviews */}
      <Dialog open={showViewModal} onOpenChange={(open) => {
        setShowViewModal(open);
        if (open) {
          loadReviews();
        }
      }}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-yellow-100 to-pink-100 dark:from-yellow-900/20 dark:to-pink-900/20 p-4">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">{product.name}</DialogTitle>
          </DialogHeader>
          <div className="p-4 flex flex-col md:flex-row gap-6">
            {/* Image Carousel */}
            <div className="flex-1 min-w-[200px]">
              {/* Replace with your carousel component or a simple image slider */}
              <Carousel images={productImages} />
            </div>
            {/* Product Details & Reviews */}
            <div className="flex-1 min-w-[200px]">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  {renderStars(reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : product.rating)}
                  <span className="text-sm text-gray-600">({reviews.length} reviews)</span>
                </div>
                <div className="text-lg font-bold text-gray-900 mb-2">{formatPrice(product.price)}</div>
                {product.source === 'vendor' && product.description && (
                  <div className="text-sm text-gray-700 mb-2">{product.description}</div>
                )}
              </div>
              <div className="max-h-48 overflow-y-auto rounded bg-gray-50 p-2">
                {reviewsLoading ? (
                  <div className="text-center py-8">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No reviews yet.</div>
                ) : (
                  <ul className="space-y-4">
                    {reviews.map((review) => (
                      <li key={review.id} className="border-b pb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {review.profiles?.first_name || 'User'} {review.profiles?.last_name || ''}
                          </span>
                          <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center ml-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </span>
                        </div>
                        {review.title && <div className="font-medium text-gray-800 dark:text-gray-100">{review.title}</div>}
                        {review.comment && <div className="text-gray-700 dark:text-gray-300 text-sm">{review.comment}</div>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewModal(false)} className="w-full">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProductCard; 