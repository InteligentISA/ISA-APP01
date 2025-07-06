
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, X } from "lucide-react";
import { WishlistItemWithProduct } from "@/types/order";

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  wishlistItems: WishlistItemWithProduct[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: any) => void;
}

const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  user,
  wishlistItems,
  onRemoveFromWishlist,
  onAddToCart
}) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            My Wishlist ({wishlistItems.length})
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {wishlistItems.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-600">Start adding products you love!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {wishlistItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.product?.main_image || '/placeholder.svg'}
                        alt={item.product?.name || 'Product'}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product?.name || 'Product'}</h3>
                        <p className="text-gray-600">KES {item.product?.price?.toLocaleString() || '0'}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => onAddToCart(item.product)}
                          className="flex items-center gap-1"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRemoveFromWishlist(item.product_id)}
                          className="flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WishlistModal;
