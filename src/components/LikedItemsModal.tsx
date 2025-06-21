
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Heart, ShoppingCart } from "lucide-react";

interface LikedItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  likedItems: number[];
  onAddToCart: (productId: number) => void;
  onRemoveFromLiked: (productId: number) => void;
}

const LikedItemsModal = ({ isOpen, onClose, likedItems, onAddToCart, onRemoveFromLiked }: LikedItemsModalProps) => {
  // Mock product data
  const products = [
    { id: 1, name: "Wireless Bluetooth Headphones", price: 199.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop" },
    { id: 2, name: "Premium Leather Jacket", price: 299.99, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100&h=100&fit=crop" },
    { id: 3, name: "Smart Home Speaker", price: 149.99, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
    { id: 4, name: "Minimalist Desk Lamp", price: 89.99, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
    { id: 5, name: "Organic Face Cream", price: 59.99, image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=100&h=100&fit=crop" },
    { id: 6, name: "Running Shoes", price: 129.99, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop" }
  ];

  const likedProducts = products.filter(product => likedItems.includes(product.id));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white dark:bg-slate-800 max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Heart className="w-6 h-6 mr-2 text-red-500" />
            Liked Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {likedProducts.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No liked items yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {likedProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg dark:border-slate-600">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{product.name}</h4>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">${product.price}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddToCart(product.id)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveFromLiked(product.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LikedItemsModal;
