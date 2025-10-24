import { ChatMessage as ChatMessageType } from '@/services/chatService';
import { Product } from '@/types/product';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Star, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ProductImageLoader from '@/components/ProductImage';

interface ChatMessageProps {
  message: ChatMessageType;
  onAddToCart?: (product: Product) => void;
  onToggleLike?: (productId: string) => void;
  likedItems?: string[];
  onProductInterest?: (product: Product) => void;
}

const ChatMessage = ({ message, onAddToCart, onToggleLike, likedItems, onProductInterest }: ChatMessageProps) => {
  const isUser = message.type === 'user';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderProductCard = (product: Product) => (
    <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-0">
        <div
          className="relative overflow-hidden rounded-t-lg cursor-pointer"
          onClick={(e) => {
            // Prevent click if like or add to cart button is clicked
            if ((e.target as HTMLElement).closest('button')) return;
            if (onProductInterest) onProductInterest(product);
          }}
        >
          <ProductImageLoader
            src={product.main_image || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 ${
              likedItems.includes(product.id) ? 'text-red-500' : 'text-gray-400'
            } hover:text-red-500 bg-white/80 backdrop-blur-sm`}
            onClick={() => onToggleLike && onToggleLike(product.id)}
          >
            <Heart className={`w-4 h-4 ${likedItems.includes(product.id) ? 'fill-current' : ''}`} />
          </Button>
        </div>
        
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">{product.name}</h3>
            <Badge variant="secondary" className="text-xs mt-1">
              {product.category}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600">{product.rating}</span>
            <span className="text-xs text-gray-500">({product.review_count} reviews)</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            <Button
              size="sm"
              onClick={() => onAddToCart && onAddToCart(product)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
          
          {product.stock_quantity > 0 ? (
            <Badge variant="default" className="text-xs">
              In Stock ({product.stock_quantity})
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">
              Out of Stock
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`rounded-lg p-4 ${
          isUser 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
            : 'bg-white border border-gray-200 text-gray-900'
        }`}>
          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
          
          {message.products && message.products.length > 0 && (
            <div className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {message.products.map(renderProductCard)}
              </div>
            </div>
          )}
          
          <div className={`text-xs mt-2 ${
            isUser ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </div>
        </div>
      </div>
      
      {!isUser && (
        <div className="order-2 ml-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">MyPlug</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage; 