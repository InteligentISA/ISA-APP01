import { Heart, ShoppingCart, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductImageLoader from "@/components/ProductImage";
import { useCurrency } from "@/hooks/useCurrency";

interface ChatProductCardProps {
  product: any;
  onAddToCart: (product: any) => void;
  onToggleLike: (product: any) => void;
  onViewProduct: (product: any) => void;
  isLiked: boolean;
  isDarkMode?: boolean;
}

const ChatProductCard = ({ product, onAddToCart, onToggleLike, onViewProduct, isLiked, isDarkMode }: ChatProductCardProps) => {
  const { formatPrice } = useCurrency();

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star key={i} className={`w-3 h-3 ${i < fullStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      );
    }
    return stars;
  };

  return (
    <div className={`rounded-xl overflow-hidden border transition-all duration-200 hover:shadow-lg ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Product Image - Full width, good size for mobile */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
        <ProductImageLoader
          src={product.main_image || product.images?.[0] || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {/* Like button overlay */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleLike(product); }}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-colors ${
            isLiked 
              ? 'bg-red-500 text-white' 
              : 'bg-white/90 text-gray-600 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
        {/* Discount badge */}
        {product.original_price && product.original_price > product.price && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 space-y-2">
        <h4 className={`font-semibold text-sm line-clamp-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {product.name}
        </h4>
        
        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex">{renderStars(product.rating || 0)}</div>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            ({product.review_count || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
            {formatPrice(product.price)}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className={`text-sm line-through ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewProduct(product)}
            className={`flex-shrink-0 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}`}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => onAddToCart(product)}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatProductCard;
