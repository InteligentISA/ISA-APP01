
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Trash2, MapPin, CreditCard, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  cartItems: number[];
  onRemoveFromCart: (productId: number) => void;
}

const CartModal = ({ isOpen, onClose, user, cartItems, onRemoveFromCart }: CartModalProps) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [billingAddress, setBillingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: ""
  });
  const { toast } = useToast();

  // Mock product data
  const products = [
    { id: 1, name: "Wireless Bluetooth Headphones", price: 199.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop" },
    { id: 2, name: "Premium Leather Jacket", price: 299.99, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100&h=100&fit=crop" },
    { id: 3, name: "Smart Home Speaker", price: 149.99, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
    { id: 4, name: "Minimalist Desk Lamp", price: 89.99, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
    { id: 5, name: "Organic Face Cream", price: 59.99, image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=100&h=100&fit=crop" },
    { id: 6, name: "Running Shoes", price: 129.99, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop" }
  ];

  const cartProducts = products.filter(product => cartItems.includes(product.id));
  const total = cartProducts.reduce((sum, product) => sum + product.price, 0);

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleConfirmOrder = () => {
    setOrderPlaced(true);
    toast({
      title: "Order Placed!",
      description: "Your order has been confirmed and will be delivered soon.",
    });
    setTimeout(() => {
      setOrderPlaced(false);
      setShowCheckout(false);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  if (orderPlaced) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md bg-white dark:bg-slate-800">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Order Confirmed!</h3>
            <p className="text-gray-600 dark:text-gray-300">Your order will be delivered to your address soon.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {showCheckout ? "Checkout" : "Shopping Cart"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showCheckout ? (
            <>
              {cartProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {cartProducts.map((product) => (
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveFromCart(product.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 dark:border-slate-600">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">Total: ${total.toFixed(2)}</span>
                    </div>
                    <Button onClick={handleCheckout} className="w-full">
                      Proceed to Checkout
                    </Button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Billing Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Street Address"
                    value={billingAddress.street}
                    onChange={(e) => setBillingAddress(prev => ({ ...prev, street: e.target.value }))}
                  />
                  <Input
                    placeholder="City"
                    value={billingAddress.city}
                    onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                  />
                  <Input
                    placeholder="State"
                    value={billingAddress.state}
                    onChange={(e) => setBillingAddress(prev => ({ ...prev, state: e.target.value }))}
                  />
                  <Input
                    placeholder="ZIP Code"
                    value={billingAddress.zip}
                    onChange={(e) => setBillingAddress(prev => ({ ...prev, zip: e.target.value }))}
                  />
                  <Input
                    placeholder="Country"
                    value={billingAddress.country}
                    onChange={(e) => setBillingAddress(prev => ({ ...prev, country: e.target.value }))}
                    className="md:col-span-2"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
                <div className="space-y-2">
                  {cartProducts.map((product) => (
                    <div key={product.id} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">{product.name}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">${product.price}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 dark:border-slate-600">
                    <div className="flex justify-between text-xl font-bold">
                      <span className="text-gray-900 dark:text-white">Total:</span>
                      <span className="text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setShowCheckout(false)} className="flex-1">
                  Back to Cart
                </Button>
                <Button onClick={handleConfirmOrder} className="flex-1">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Confirm Order
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CartModal;
