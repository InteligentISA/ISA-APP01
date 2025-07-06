import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Trash2, ShoppingCart, Heart, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OrderService } from "@/services/orderService";
import { CartItemWithProduct } from "@/types/order";
import EnhancedCheckoutModal from "./EnhancedCheckoutModal";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onRemoveFromCart: (productId: string) => void;
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
}

const CartModal = ({ isOpen, onClose, user, onRemoveFromCart, onUpdateQuantity }: CartModalProps) => {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { toast } = useToast();

  // Load cart items when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadCartItems();
    }
  }, [isOpen, user]);

  const loadCartItems = async () => {
    try {
      setIsLoading(true);
      const items = await OrderService.getCartItems(user.id);
      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart items:', error);
      toast({
        title: "Error",
        description: "Failed to load cart items.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromCart = async (cartItemId: string) => {
    try {
      await OrderService.removeFromCart(cartItemId);
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    try {
      await OrderService.updateCartItem(cartItemId, quantity);
      setCartItems(prev => prev.map(item => 
        item.id === cartItemId ? { ...item, quantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity.",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleOrderComplete = () => {
    setCartItems([]);
    setShowCheckout(false);
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const total = cartItems.reduce((sum, item) => {
    const price = item?.product?.price || 0;
    const quantity = item?.quantity || 1;
    return sum + (price * quantity);
  }, 0);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
        <Card className="w-full max-w-2xl bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          <CardHeader className="relative border-b border-gray-200 dark:border-slate-700 p-4 sm:p-6">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
              Shopping Cart ({cartItems.length})
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-3 sm:p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Loading cart...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">Your cart is empty</p>
                <Button onClick={onClose} variant="outline">
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3 sm:space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <img
                          src={item?.product?.main_image || '/placeholder.svg'}
                          alt={item?.product?.name || 'Product'}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">{item?.product?.name || 'Unknown Product'}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{item?.product?.category || 'Uncategorized'}</p>
                          <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{formatPrice(item?.product?.price || 0)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 p-0"
                          >
                            -
                          </Button>
                          <span className="w-8 text-center text-gray-900 dark:text-white text-sm sm:text-base">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= (item?.product?.stock_quantity || 999)}
                            className="w-8 h-8 p-0"
                          >
                            +
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                            {formatPrice((item?.product?.price || 0) * item.quantity)}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 w-8 h-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 dark:border-slate-600 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Total: {formatPrice(total)}</span>
                  </div>
                  
                  {total < 50 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                      <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                        Add {formatPrice(50 - total)} more to get free shipping!
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <Button 
                      onClick={onClose} 
                      variant="outline" 
                      className="flex-1"
                    >
                      Continue Shopping
                    </Button>
                    <Button 
                      onClick={handleCheckout} 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={cartItems.length === 0}
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {showCheckout && (
        <EnhancedCheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          user={user}
          cartItems={cartItems}
          onOrderComplete={handleOrderComplete}
        />
      )}
    </>
  );
};

export default CartModal;
