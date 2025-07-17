import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Heart, Eye, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Product, DashboardProduct } from "@/types/product";
import { OrderService } from "@/services/orderService";
import { CustomerBehaviorService } from "@/services/customerBehaviorService";
import { JumiaInteractionService } from "@/services/jumiaInteractionService";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { ProductService } from "@/services/productService";

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
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const { toast } = useToast();
  const { user } = useAuth();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewsDialog, setShowReviewsDialog] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Track product view when component mounts
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
        product_name: product.name,
        product_category: product.category || 'electronics',
        quantity: quantity,
        price: product.price
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
          newLikeState ? 'like' : 'unlike'
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

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to submit a review.",
        variant: "destructive",
      });
      return;
    }
    if (reviewRating < 1 || reviewRating > 5) {
      toast({
        title: "Invalid rating",
        description: "Please select a rating between 1 and 5 stars.",
        variant: "destructive",
      });
      return;
    }
    setReviewLoading(true);
    const { error } = await supabase.from('product_reviews').insert({
      product_id: product.id,
      user_id: user.id,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
      is_verified_purchase: false
    });
    setReviewLoading(false);
    if (error) {
      toast({
        title: "Error submitting review",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback.",
      });
      setShowReviewDialog(false);
      setReviewRating(0);
      setReviewTitle("");
      setReviewComment("");
    }
  };

  const handleOpenReviews = async () => {
    setShowReviewsDialog(true);
    setReviewsLoading(true);
    const { data, error } = await ProductService.getProductReviews(product.id);
    setReviews(data || []);
    setReviewsLoading(false);
  };

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
          <div className="text-lg font-bold text-purple-600 mb-1">KES {product.price.toLocaleString()}</div>
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
            <div className="flex cursor-pointer" onClick={product.source === 'vendor' ? handleOpenReviews : undefined} title="View all reviews">
              {renderStars(product.rating)}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer" onClick={product.source === 'vendor' ? handleOpenReviews : undefined}>
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

          {/* Vendor Information for vendor products */}
          {product.source === 'vendor' && (
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  Local Vendor
                </Badge>
              </div>
              {product.pickup_location && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Pickup:</span> {product.pickup_location}
                </div>
              )}
              {product.pickup_phone_number && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Contact:</span> {product.pickup_phone_number}
                </div>
              )}
            </div>
          )}
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

          {product.source === 'vendor' && (
            <>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => setShowReviewDialog(true)}
              >
                Rate this product
              </Button>
              <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rate {product.name}</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}
                          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                          <Star className="w-6 h-6" />
                        </button>
                      ))}
                    </div>
                    <Input
                      placeholder="Title (optional)"
                      value={reviewTitle}
                      onChange={e => setReviewTitle(e.target.value)}
                      maxLength={100}
                    />
                    <Textarea
                      placeholder="Write your review (optional)"
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      maxLength={500}
                      rows={3}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleSubmitReview}
                      disabled={reviewLoading || reviewRating < 1 || reviewRating > 5}
                      className="w-full"
                    >
                      {reviewLoading ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </CardFooter>

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
    </Card>
  );
};

export default ProductCard; 