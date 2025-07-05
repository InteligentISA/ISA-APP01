
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, CreditCard, MapPin, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OrderService } from "@/services/orderService";
import { CheckoutRequest, Address } from "@/types/order";
import MpesaPaymentModal from "./MpesaPaymentModal";
import OrderSuccessModal from "./OrderSuccessModal";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  cartItems: any[];
  onOrderComplete: () => void;
}

const CheckoutModal = ({ isOpen, onClose, user, cartItems, onOrderComplete }: CheckoutModalProps) => {
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [customerPhone, setCustomerPhone] = useState(user?.phone_number || '');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'pay_after_pickup' | 'pay_after_delivery'>('mpesa');
  const [shippingAddress, setShippingAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'Kenya',
    apartment: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showMpesaPayment, setShowMpesaPayment] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const { toast } = useToast();

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (!customerPhone) {
      toast({
        title: "Phone required",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }

    if (fulfillmentMethod === 'delivery' && !shippingAddress.street) {
      toast({
        title: "Address required",
        description: "Please enter your delivery address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const checkoutData: CheckoutRequest = {
        fulfillment_method: fulfillmentMethod,
        shipping_address: fulfillmentMethod === 'delivery' ? shippingAddress : undefined,
        customer_email: user.email,
        customer_phone: customerPhone,
        notes,
        payment_method: paymentMethod
      };

      const order = await OrderService.createOrder(user.id, checkoutData, cartItems);
      setCurrentOrder(order);

      if (paymentMethod === 'mpesa') {
        setShowMpesaPayment(true);
      } else {
        setShowOrderSuccess(true);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMpesaSuccess = () => {
    setShowMpesaPayment(false);
    setShowOrderSuccess(true);
  };

  const handleOrderSuccessClose = () => {
    setShowOrderSuccess(false);
    onOrderComplete();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
            <CardTitle className="text-2xl font-bold">Checkout</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product_name} x {item.quantity}</span>
                  <span>KES {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 font-semibold">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>KES {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Fulfillment Method */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">How would you like to receive your order?</Label>
              <Select value={fulfillmentMethod} onValueChange={(value: 'pickup' | 'delivery') => setFulfillmentMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>Pickup from vendor</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="delivery">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>ISA Delivery</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Delivery Address (only if delivery selected) */}
            {fulfillmentMethod === 'delivery' && (
              <div className="space-y-4">
                <Label className="text-base font-semibold">Delivery Address</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      placeholder="123 Main St"
                    />
                  </div>
                  <div>
                    <Label htmlFor="apartment">Apartment/Unit (Optional)</Label>
                    <Input
                      id="apartment"
                      value={shippingAddress.apartment}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, apartment: e.target.value })}
                      placeholder="Apt 4B"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      placeholder="Nairobi"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">County</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      placeholder="Nairobi County"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">Postal Code</Label>
                    <Input
                      id="zip"
                      value={shippingAddress.zip}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                      placeholder="00100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Contact Information</Label>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="254700000000"
                />
              </div>
              <div>
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions..."
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Pay now with M-Pesa</span>
                    </div>
                  </SelectItem>
                  {fulfillmentMethod === 'pickup' && (
                    <SelectItem value="pay_after_pickup">
                      <span>Pay after pickup</span>
                    </SelectItem>
                  )}
                  {fulfillmentMethod === 'delivery' && (
                    <SelectItem value="pay_after_delivery">
                      <span>Pay after delivery</span>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Pickup Location Info (only if pickup selected) */}
            {fulfillmentMethod === 'pickup' && cartItems.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Pickup Locations:</h4>
                {Array.from(new Set(cartItems.map(item => item.pickup_location))).map((location, index) => (
                  <div key={index} className="text-sm">
                    <p><strong>Location:</strong> {location || 'TBD - Vendor will contact you'}</p>
                    <p><strong>Contact:</strong> {cartItems.find(item => item.pickup_location === location)?.pickup_phone || 'TBD'}</p>
                    {index < Array.from(new Set(cartItems.map(item => item.pickup_location))).length - 1 && <hr className="my-2" />}
                  </div>
                ))}
              </div>
            )}

            <Button 
              onClick={handleCheckout} 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : `Place Order - KES ${total.toFixed(2)}`}
            </Button>
          </CardContent>
        </Card>
      </div>

      {showMpesaPayment && currentOrder && (
        <MpesaPaymentModal
          isOpen={showMpesaPayment}
          onClose={() => setShowMpesaPayment(false)}
          order={currentOrder}
          onSuccess={handleMpesaSuccess}
        />
      )}

      {showOrderSuccess && currentOrder && (
        <OrderSuccessModal
          isOpen={showOrderSuccess}
          onClose={handleOrderSuccessClose}
          order={currentOrder}
        />
      )}
    </>
  );
};

export default CheckoutModal;
