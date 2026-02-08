import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, ShoppingCart, Star, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import ProductImageLoader from "@/components/ProductImage";
import { useCurrency } from "@/hooks/useCurrency";
import { ProductService } from "@/services/productService";

interface ChatProductDetailPopupProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: any) => void;
  onToggleLike: (product: any) => void;
  isLiked: boolean;
}

const ChatProductDetailPopup = ({ product, isOpen, onClose, onAddToCart, onToggleLike, isLiked }: ChatProductDetailPopupProps) => {
  const { formatPrice } = useCurrency();
  const [fullProduct, setFullProduct] = useState<any>(null);
  const [productImages, setProductImages] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && product?.id) {
      loadFullProductDetails();
    }
  }, [isOpen, product?.id]);

  const loadFullProductDetails = async () => {
    setLoading(true);
    try {
      const result = await ProductService.getProduct(product.id);
      if (!result.error) {
        setFullProduct(result.data);
      }
      const imagesResult = await ProductService.getProductImages(product.id);
      if (imagesResult.data.length > 0) {
        setProductImages(imagesResult.data as any[]);
      } else if (product.main_image) {
        setProductImages([{ id: 'main', image_url: product.main_image, is_main_image: true }]);
      }
    } catch (err) {
      console.error('Error loading product details:', err);
      setFullProduct(product);
    } finally {
      setLoading(false);
    }
  };

  const displayProduct = fullProduct || product;
  if (!displayProduct) return null;

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      );
    }
    return stars;
  };

  const images = productImages.length > 0 
    ? productImages 
    : displayProduct.main_image 
      ? [{ id: 'main', image_url: displayProduct.main_image }] 
      : [{ id: 'placeholder', image_url: '/placeholder.svg' }];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg w-full max-h-[95vh] overflow-y-auto p-0 gap-0">
        {/* Header with back button */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose} className="flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="icon"
              onClick={() => onToggleLike(displayProduct)}
              className={isLiked ? "text-red-500 border-red-500" : ""}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        ) : (
          <div className="pb-6">
            {/* Image carousel */}
            <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800">
              <ProductImageLoader
                src={images[currentImageIndex]?.image_url || '/placeholder.svg'}
                alt={displayProduct.name}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, idx) => (
                      <div key={idx} className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-orange-500' : 'bg-white/60'}`} />
                    ))}
                  </div>
                </>
              )}
              {displayProduct.original_price && displayProduct.original_price > displayProduct.price && (
                <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                  {Math.round(((displayProduct.original_price - displayProduct.price) / displayProduct.original_price) * 100)}% OFF
                </Badge>
              )}
            </div>

            <div className="px-4 pt-4 space-y-4">
              {/* Name & Price */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{displayProduct.name}</h2>
                {displayProduct.brand && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">by {displayProduct.brand}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-orange-600">{formatPrice(displayProduct.price)}</span>
                {displayProduct.original_price && displayProduct.original_price > displayProduct.price && (
                  <span className="text-base line-through text-gray-400">{formatPrice(displayProduct.original_price)}</span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">{renderStars(displayProduct.rating || 0)}</div>
                <span className="text-sm text-gray-500">({displayProduct.review_count || 0} reviews)</span>
              </div>

              {/* Warranty */}
              {displayProduct.has_warranty && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <Shield className="w-4 h-4" />
                  <span>{displayProduct.warranty_period} {displayProduct.warranty_unit || 'months'} warranty</span>
                </div>
              )}

              {/* Description */}
              {displayProduct.description && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">Description</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{displayProduct.description}</p>
                </div>
              )}

              {/* Key Specs */}
              {(displayProduct.processor || displayProduct.ram || displayProduct.storage || displayProduct.battery_capacity_mah || displayProduct.display_size_inch) && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Key Specifications</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {displayProduct.processor && <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded"><span className="text-gray-500">Processor:</span> <span className="font-medium">{displayProduct.processor}</span></div>}
                    {displayProduct.ram && <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded"><span className="text-gray-500">RAM:</span> <span className="font-medium">{displayProduct.ram}</span></div>}
                    {displayProduct.storage && <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded"><span className="text-gray-500">Storage:</span> <span className="font-medium">{displayProduct.storage}</span></div>}
                    {displayProduct.battery_capacity_mah && <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded"><span className="text-gray-500">Battery:</span> <span className="font-medium">{displayProduct.battery_capacity_mah}mAh</span></div>}
                    {displayProduct.display_size_inch && <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded"><span className="text-gray-500">Display:</span> <span className="font-medium">{displayProduct.display_size_inch}"</span></div>}
                  </div>
                </div>
              )}

              {/* Stock */}
              {displayProduct.stock_quantity !== null && displayProduct.stock_quantity !== undefined && (
                <p className={`text-sm ${displayProduct.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {displayProduct.stock_quantity > 0 ? `${displayProduct.stock_quantity} in stock` : 'Out of stock'}
                </p>
              )}

              {/* Add to Cart Button */}
              <Button
                onClick={() => onAddToCart(displayProduct)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-base font-semibold"
                disabled={displayProduct.stock_quantity === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChatProductDetailPopup;