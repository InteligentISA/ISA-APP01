import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Heart, 
  ShoppingCart, 
  Star, 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight
} from "lucide-react";
import { Product, ProductAttribute, ProductImage, ProductReview } from "@/types/product";

// Extended interface for reviews with profiles data
interface ProductReviewWithProfiles extends ProductReview {
  profiles?: {
    first_name?: string;
    last_name?: string;
  };
}
import { ProductService } from "@/services/productService";
import { OrderService } from "@/services/orderService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import ProductImageLoader from "./ProductImage";
import ProductImageFallback from "./ProductImageFallback";
import ShareButton from "./ShareButton";

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [productAttributes, setProductAttributes] = useState<ProductAttribute[]>([]);
  const [productReviews, setProductReviews] = useState<ProductReviewWithProfiles[]>([]);
  const [vendorInfo, setVendorInfo] = useState<{ first_name?: string; last_name?: string; company?: string; brand_name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [userReview, setUserReview] = useState<ProductReview | null>(null);
  const [isInCart, setIsInCart] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [similarProductsLiked, setSimilarProductsLiked] = useState<Set<string>>(new Set());
  const [similarProductsInCart, setSimilarProductsInCart] = useState<Set<string>>(new Set());
  const similarProductsScrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProductDetails();
      if (user) {
        checkUserInteractions();
      }
    }
  }, [productId, user]);

  useEffect(() => {
    if (product) {
      loadSimilarProducts();
    }
  }, [product]);

  // Auto-scroll for similar products
  useEffect(() => {
    if (similarProducts.length > 0 && similarProductsScrollRef.current && !isPaused) {
      const scrollContainer = similarProductsScrollRef.current;
      let scrollPosition = 0;
      
      const scrollInterval = setInterval(() => {
        if (!isPaused && scrollContainer) {
          scrollPosition += 1;
          if (scrollPosition >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
            scrollPosition = 0; // Reset to start
          }
          scrollContainer.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
          });
        }
      }, 50); // Adjust speed here (lower = faster)

      return () => clearInterval(scrollInterval);
    }
  }, [similarProducts, isPaused]);

  const scrollSimilarProducts = (direction: 'left' | 'right', fast: boolean = false) => {
    if (similarProductsScrollRef.current) {
      const scrollAmount = fast ? 400 : 200;
      const newScrollPosition = direction === 'left' 
        ? similarProductsScrollRef.current.scrollLeft - scrollAmount
        : similarProductsScrollRef.current.scrollLeft + scrollAmount;
      
      similarProductsScrollRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const loadProductDetails = async () => {
    setLoading(true);
    try {
      const productResult = await ProductService.getProduct(productId!);
      if (productResult.error) throw new Error("Product not found");
      setProduct(productResult.data);

             const imagesResult = await ProductService.getProductImages(productId!);
       setProductImages(imagesResult.data as unknown as ProductImage[]);

       const attributesResult = await ProductService.getProductAttributes(productId!);
       setProductAttributes(attributesResult.data as unknown as ProductAttribute[]);

       const reviewsResult = await ProductService.getProductReviews(productId!);
       setProductReviews(reviewsResult.data as unknown as ProductReview[]);

       // Get vendor information from the product data
       if (productResult.data.vendor) {
         setVendorInfo(productResult.data.vendor);
       }

       if (imagesResult.data.length === 0 && productResult.data.main_image) {
        setProductImages([{
          id: 'main',
          product_id: productId!,
          image_url: productResult.data.main_image,
          image_description: 'Main Product Image',
          display_order: 0,
          is_main_image: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const checkUserInteractions = async () => {
    if (!user || !productId) return;
    try {
      const cartItems = await OrderService.getCartItems(user.id);
      setIsInCart(cartItems.some((item: any) => item.product_id === productId));

      const wishlistItems = await OrderService.getWishlistItems(user.id);
      setIsLiked(wishlistItems.some((item: any) => item.product_id === productId));

      const userReviewResult = await ProductService.getUserReview(productId, user.id);
      setUserReview(userReviewResult);
      
      // Pre-populate review dialog if user has already reviewed
      if (userReviewResult) {
        setReviewRating(userReviewResult.rating);
        setReviewText(userReviewResult.comment || '');
      }
    } catch (error) {
      console.error("Error checking user interactions:", error);
    }
  };

  const loadSimilarProducts = async () => {
    if (!productId) return;
    try {
      const result = await ProductService.getSimilarProducts(productId);
      setSimilarProducts(result.data);
      
      if (user) {
        checkSimilarProductsInteractions(result.data);
      }
    } catch (error) {
      console.error("Error loading similar products:", error);
    }
  };

  const checkSimilarProductsInteractions = async (products: Product[]) => {
    if (!user) return;
    try {
      const cartItems = await OrderService.getCartItems(user.id);
      const wishlistItems = await OrderService.getWishlistItems(user.id);
      
      const cartProductIds = new Set(cartItems.map((item: any) => item.product_id));
      const wishlistProductIds = new Set(wishlistItems.map((item: any) => item.product_id));
      
      setSimilarProductsInCart(cartProductIds);
      setSimilarProductsLiked(wishlistProductIds);
    } catch (error) {
      console.error("Error checking similar products interactions:", error);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to add items to cart",
        variant: "destructive"
      });
      return;
    }
    if (!product) return;

         try {
       await OrderService.addToCart(user.id, {
         product_id: product.id,
         quantity: 1,
         product_name: product.name,
         product_category: product.category,
         price: product.price
       });
      setIsInCart(true);
      toast({ title: "Success", description: "Product added to cart" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive"
      });
    }
  };

  const handleToggleLike = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to like products",
        variant: "destructive"
      });
      return;
    }
    if (!product) return;

    try {
      if (isLiked) {
        await OrderService.removeFromWishlist(user.id, product.id);
        setIsLiked(false);
        toast({ title: "Removed from wishlist" });
      } else {
        await OrderService.addToWishlist(user.id, {
          product_id: product.id,
          product_name: product.name,
          product_category: product.category
        });
        setIsLiked(true);
        toast({ title: "Added to wishlist" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive"
      });
    }
  };

  const handleSimilarProductLike = async (similarProduct: Product) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to like products",
        variant: "destructive"
      });
      return;
    }

    try {
      const isLiked = similarProductsLiked.has(similarProduct.id);
      if (isLiked) {
        await OrderService.removeFromWishlist(user.id, similarProduct.id);
        setSimilarProductsLiked(prev => {
          const newSet = new Set(prev);
          newSet.delete(similarProduct.id);
          return newSet;
        });
        toast({ title: "Removed from wishlist" });
      } else {
        await OrderService.addToWishlist(user.id, {
          product_id: similarProduct.id,
          product_name: similarProduct.name,
          product_category: similarProduct.category
        });
        setSimilarProductsLiked(prev => new Set(prev).add(similarProduct.id));
        toast({ title: "Added to wishlist" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive"
      });
    }
  };

  const handleSimilarProductAddToCart = async (similarProduct: Product) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to add items to cart",
        variant: "destructive"
      });
      return;
    }

    try {
      await OrderService.addToCart(user.id, {
        product_id: similarProduct.id,
        product_name: similarProduct.name,
        product_category: similarProduct.category,
        quantity: 1,
        price: similarProduct.price
      });
      setSimilarProductsInCart(prev => new Set(prev).add(similarProduct.id));
      toast({ title: "Product added to cart" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive"
      });
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !product) return;

    try {
      if (userReview) {
        await ProductService.updateProductReview(userReview.id, {
          rating: reviewRating,
          comment: reviewText
        });
        toast({ title: "Review updated successfully" });
      } else {
        await ProductService.createProductReview({
          product_id: product.id,
          user_id: user.id,
          rating: reviewRating,
          comment: reviewText
        });
        toast({ title: "Review submitted successfully" });
      }

      setShowReviewDialog(false);
      setReviewText("");
      setReviewRating(5);
      // Refresh product details to update rating and review count
      await loadProductDetails();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      currencyDisplay: 'symbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price).replace('KSh', 'Ksh');
  };

  const handleReviewDialogChange = (open: boolean) => {
    setShowReviewDialog(open);
    if (!open) {
      // Reset form when dialog is closed
      setReviewText("");
      setReviewRating(5);
    } else if (userReview) {
      // Pre-populate with existing review
      setReviewRating(userReview.rating);
      setReviewText(userReview.comment || '');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading product...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleToggleLike}
                className={isLiked ? "text-red-500 border-red-500" : ""}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/')}
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              <div onClick={() => setShowImageModal(true)} className="cursor-pointer">
                <ProductImageFallback
                  images={[
                    productImages[currentImageIndex]?.image_url,
                    product.main_image,
                    ...productImages.map(img => img.image_url)
                  ].filter(Boolean)}
                  alt={productImages[currentImageIndex]?.image_description || product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {productImages.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>

            {productImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {productImages.map((image, index) => (
                  <div
                    key={image.id}
                    className={`aspect-square bg-white rounded-lg overflow-hidden cursor-pointer border-2 ${
                      index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image.image_url}
                      alt={image.image_description || `Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {productImages[currentImageIndex]?.image_description && (
              <div className="text-center text-sm text-gray-600">
                {productImages[currentImageIndex].image_description}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <ShareButton
                  contentType="product"
                  contentId={product.id}
                  contentData={product}
                  title={product.name}
                  description={`KES ${product.price} - ${product.description || ''}`}
                  image={product.main_image}
                  size="md"
                />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-semibold">
                    {productReviews.length > 0 
                      ? (productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length).toFixed(1)
                      : '0.0'
                    }
                  </span>
                  <span className="text-gray-600 ml-1">({productReviews.length} reviews)</span>
                </div>
                <Badge variant="secondary">{product.category}</Badge>
                {product.subcategory && (
                  <Badge variant="outline">{product.subcategory}</Badge>
                )}
              </div>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>
              {product.original_price && product.original_price > product.price && (
                <Badge className="bg-green-500 text-white">
                  {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                </Badge>
              )}
            </div>

            {/* Product Attributes */}
            {productAttributes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {productAttributes.map((attr) => (
                      <div key={attr.id}>
                        <span className="text-sm font-medium text-gray-600">{attr.attribute_name}:</span>
                        <span className="ml-2 text-sm">{attr.attribute_value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Electronics Specifications */}
            {product.category === 'Electronics' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {product.ram && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">RAM:</span>
                        <span className="ml-2 text-sm">{product.ram}</span>
                      </div>
                    )}
                    {product.storage && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Storage:</span>
                        <span className="ml-2 text-sm">{product.storage}</span>
                      </div>
                    )}
                    {product.processor && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Processor:</span>
                        <span className="ml-2 text-sm">{product.processor}</span>
                      </div>
                    )}
                    {product.display_size && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Display:</span>
                        <span className="ml-2 text-sm">{product.display_size}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stock and Actions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Stock: {product.stock_quantity || 0} available
                </span>
                {product.brand && (
                  <span className="text-sm text-gray-600">
                    Brand: {product.brand}
                  </span>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={isInCart || (product.stock_quantity || 0) === 0}
                  className="flex-1"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {isInCart ? "In Cart" : "Add to Cart"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReviewDialogChange(true)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Review
                </Button>
              </div>
            </div>

            {/* Supplier Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Supplier Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Supplier:</span>
                  <p className="text-sm">
                    {vendorInfo?.brand_name 
                      ? vendorInfo.brand_name
                      : vendorInfo?.company 
                        ? vendorInfo.company
                        : vendorInfo 
                          ? `${vendorInfo.first_name || ''} ${vendorInfo.last_name || ''}`.trim() || 'Unknown Supplier'
                          : 'Unknown Supplier'
                    }
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Location:</span>
                  <p className="text-sm">{product.pickup_location || 'Contact vendor for pickup location'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reviews">Reviews ({productReviews.length})</TabsTrigger>
              <TabsTrigger value="details">Product Details</TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Customer Reviews</h3>
                <Button
                  variant="outline"
                  onClick={() => handleReviewDialogChange(true)}
                >
                  Write a Review
                </Button>
              </div>

              {productReviews.length > 0 ? (
                <div className="space-y-4">
                  {(showAllReviews ? productReviews : productReviews.slice(0, 5)).map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                                                         <Avatar className="w-8 h-8">
                               <AvatarFallback>
                                 {review.profiles?.first_name?.charAt(0) || review.profiles?.last_name?.charAt(0) || 'U'}
                               </AvatarFallback>
                             </Avatar>
                             <div>
                               <p className="font-medium text-sm">
                                 {review.profiles?.first_name && review.profiles?.last_name 
                                   ? `${review.profiles.first_name} ${review.profiles.last_name}` 
                                   : review.profiles?.first_name || review.profiles?.last_name || 'Anonymous'}
                               </p>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(review.created_at!).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-700">{review.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {productReviews.length > 5 && (
                    <div className="text-center py-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowAllReviews(!showAllReviews)}
                      >
                        {showAllReviews ? 'Show Less' : `View All Reviews (${productReviews.length})`}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">SKU:</span>
                    <span className="ml-2 text-sm">{product.sku || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Category:</span>
                    <span className="ml-2 text-sm">{product.category}</span>
                  </div>
                  {product.subcategory && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Subcategory:</span>
                      <span className="ml-2 text-sm">{product.subcategory}</span>
                    </div>
                  )}
                  {product.brand && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Brand:</span>
                      <span className="ml-2 text-sm">{product.brand}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-600">Stock:</span>
                    <span className="ml-2 text-sm">{product.stock_quantity || 0} units</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Similar Products</h2>
            </div>
            <div className="relative group">
              {/* Left Scroll Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg"
                onClick={() => scrollSimilarProducts('left')}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              
              {/* Right Scroll Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg"
                onClick={() => scrollSimilarProducts('right')}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>

              <div 
                ref={similarProductsScrollRef}
                className="overflow-x-auto scrollbar-hide"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <div className="flex gap-4 pb-4" style={{ display: 'flex', gap: '1rem' }}>
                  {similarProducts.map((similarProduct) => (
                    <Card key={similarProduct.id} className="w-64 flex-shrink-0">
                      <div className="relative">
                        <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                          <ProductImageFallback
                            images={[similarProduct.main_image]}
                            alt={similarProduct.name}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => navigate(`/product/${similarProduct.id}`)}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                          onClick={() => handleSimilarProductLike(similarProduct)}
                        >
                          <Heart 
                            className={`w-4 h-4 ${similarProductsLiked.has(similarProduct.id) ? "fill-current text-red-500" : ""}`} 
                          />
                        </Button>
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <h3 
                          className="font-semibold text-sm cursor-pointer hover:text-blue-600 line-clamp-2"
                          onClick={() => navigate(`/product/${similarProduct.id}`)}
                        >
                          {similarProduct.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(similarProduct.price)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={similarProductsInCart.has(similarProduct.id) ? "outline" : "default"}
                            className="flex-1"
                            disabled={similarProductsInCart.has(similarProduct.id)}
                            onClick={() => handleSimilarProductAddToCart(similarProduct)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            {similarProductsInCart.has(similarProduct.id) ? "In Cart" : "Add"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/product/${similarProduct.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-4xl">
          <div className="relative">
            <ProductImageFallback
              images={[
                productImages[currentImageIndex]?.image_url,
                product.main_image,
                ...productImages.map(img => img.image_url)
              ].filter(Boolean)}
              alt={productImages[currentImageIndex]?.image_description || product.name}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            
            {productImages.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
          {productImages[currentImageIndex]?.image_description && (
            <p className="text-center text-sm text-gray-600 mt-2">
              {productImages[currentImageIndex].image_description}
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={handleReviewDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {userReview ? "Edit Your Review" : "Write a Review"}
            </DialogTitle>
            <DialogDescription>
              Share your experience with this product.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="icon"
                    onClick={() => setReviewRating(star)}
                    className="p-0 h-8 w-8"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="review">Review (Optional)</Label>
              <Textarea
                id="review"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this product..."
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleReviewDialogChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview}>
              {userReview ? "Update Review" : "Submit Review"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetail; 