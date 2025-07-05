import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Heart, ShoppingCart, ExternalLink, Store, Globe } from "lucide-react";
import { JumiaInteractionService } from "@/services/jumiaInteractionService";

interface LikedItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  likedItems: any[]; // vendor products
  likedJumiaItems: any[]; // Jumia products
  onAddToCart: (product: any) => void;
  onRemoveFromLiked: (productId: string) => void;
  userId?: string;
}

const LikedItemsModal = ({ 
  isOpen, 
  onClose, 
  likedItems, 
  likedJumiaItems, 
  onAddToCart, 
  onRemoveFromLiked,
  userId 
}: LikedItemsModalProps) => {
  const [jumiaProducts, setJumiaProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load Jumia product details when modal opens
  useEffect(() => {
    if (isOpen && userId && likedJumiaItems.length > 0) {
      loadJumiaProductDetails();
    }
  }, [isOpen, userId, likedJumiaItems]);

  const loadJumiaProductDetails = async () => {
    setLoading(true);
    try {
      const { data: jumiaInteractions } = await JumiaInteractionService.getLikedJumiaProducts(userId!);
      setJumiaProducts(jumiaInteractions);
    } catch (error) {
      console.error('Error loading Jumia product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveJumiaFromLiked = async (jumiaProductId: string) => {
    if (!userId) return;
    
    try {
      await JumiaInteractionService.unlikeJumiaProduct(userId, jumiaProductId);
      setJumiaProducts(prev => prev.filter(p => p.jumia_product_id !== jumiaProductId));
    } catch (error) {
      console.error('Error removing Jumia product from likes:', error);
    }
  };

  const handleOpenJumiaProduct = (link: string) => {
    window.open(link, '_blank');
  };

  if (!isOpen) return null;

  const totalLikedItems = likedItems.length + jumiaProducts.length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative border-b border-gray-200 dark:border-slate-700">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Heart className="w-6 h-6 mr-2 text-red-500" />
            Liked Items ({totalLikedItems})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {totalLikedItems === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No liked items yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Vendor Products Section */}
              {likedItems.length > 0 && (
                <div>
                  <div className="flex items-center mb-4">
                    <Store className="w-5 h-5 mr-2 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vendor Products</h3>
                    <Badge className="ml-2 bg-blue-100 text-blue-800">{likedItems.length}</Badge>
                  </div>
                  <div className="space-y-4">
                    {likedItems.map((item) => (
                      <div key={item.product_id} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700">
                        <img
                          src={item.image || 'https://via.placeholder.com/100'}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{item.product_name}</h4>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">${item.price || ''}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAddToCart(item)}
                            className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveFromLiked(item.product_id)}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Jumia Products Section */}
              {jumiaProducts.length > 0 && (
                <div>
                  <div className="flex items-center mb-4">
                    <Globe className="w-5 h-5 mr-2 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Jumia Products</h3>
                    <Badge className="ml-2 bg-orange-100 text-orange-800">{jumiaProducts.length}</Badge>
                  </div>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-4">
                        <p className="text-gray-500">Loading Jumia products...</p>
                      </div>
                    ) : (
                      jumiaProducts.map((item) => (
                        <div key={item.jumia_product_id} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700">
                          <img
                            src={item.jumia_product_image || 'https://via.placeholder.com/100'}
                            alt={item.jumia_product_name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{item.jumia_product_name}</h4>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">${item.jumia_product_price || ''}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">From Jumia</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenJumiaProduct(item.jumia_product_link)}
                              className="border-orange-300 text-orange-700 hover:bg-orange-50"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View on Jumia
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveJumiaFromLiked(item.jumia_product_id)}
                              className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LikedItemsModal;
