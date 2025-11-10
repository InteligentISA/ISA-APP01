import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import PesapalPayModal from '@/components/payments/PesapalPayModal';
import { Separator } from '@/components/ui/separator';
import { X, Check, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OrderService } from '@/services/orderService';
import { CartItemWithProduct, Address } from '@/types/order';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  cartItems: CartItemWithProduct[];
  onOrderComplete: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  user,
  cartItems,
  onOrderComplete
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  const [shippingAddress, setShippingAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'Kenya'
  });
  const [contactInfo, setContactInfo] = useState({
    email: user?.email || '',
    phone: user?.phone_number || ''
  });
  const [showPesapalPay, setShowPesapalPay] = useState(false);
  const [notes, setNotes] = useState('');

  const { toast } = useToast();

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryFee = 200;
  const totalAmount = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required shipping address fields.",
        variant: "destructive"
      });
      return;
    }

    if (!contactInfo.email || !contactInfo.phone) {
      toast({
        title: "Missing Information",
        description: "Please provide your email and phone number.",
        variant: "destructive"
      });
      return;
    }

    // Show PesaPal payment modal
    setShowPesapalPay(true);
  };

  const handlePaymentSuccess = async (tx: { transaction_id: string; provider: string }) => {
    setIsProcessing(true);
    try {
      const order = await OrderService.createOrder(user.id, {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        customer_email: contactInfo.email,
        customer_phone: contactInfo.phone,
        notes: notes,
        payment_method: 'pesapal',
        delivery_fee: deliveryFee
      });

      // Update order with payment confirmation
      await OrderService.updateOrderStatus(order.id, {
        order_id: order.id,
        status: 'confirmed',
        notes: `Payment confirmed via ${tx.provider}. Transaction ID: ${tx.transaction_id}`
      });

      setOrderNumber(order.order_number);
      setOrderComplete(true);
      onOrderComplete();
      toast({ 
        title: 'Order Placed Successfully!', 
        description: `Your order #${OrderService.formatOrderNumber(order.order_number)} has been confirmed.` 
      });
      setTimeout(() => { onClose(); setOrderComplete(false); }, 3000);
    } catch (error) {
      console.error('Order creation after payment error:', error);
      toast({
        title: "Order Creation Failed",
        description: "Payment was successful but order creation failed. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentFailure = () => {
    toast({
      title: "Payment Failed",
      description: "Your payment could not be processed. Please try again.",
      variant: "destructive"
    });
    setShowPesapalPay(false);
  };

  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString()}`;
  };

  if (!isOpen) return null;

  if (orderComplete) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Order Confirmed!</h3>
            <p className="text-muted-foreground mb-4">
              Order #{OrderService.formatOrderNumber(orderNumber)}
            </p>
            <p className="text-sm text-muted-foreground">
              You will receive a confirmation email shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="relative border-b">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
            <CardTitle className="text-2xl font-bold">
              Checkout
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Shipping Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Shipping Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                    placeholder="123 Main St"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Nairobi"
                  />
                </div>
                <div>
                  <Label htmlFor="state">County</Label>
                  <Input
                    id="state"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="Nairobi"
                  />
                </div>
                <div>
                  <Label htmlFor="zip">Postal Code</Label>
                  <Input
                    id="zip"
                    value={shippingAddress.zip}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, zip: e.target.value }))}
                    placeholder="00100"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+254700000000"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Order Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-semibold">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee:</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Order Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions..."
              />
            </div>

            <Button
              onClick={handlePlaceOrder}
              className="w-full"
              size="lg"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `Pay ${formatPrice(totalAmount)} with PesaPal`}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              🔒 Secure payment powered by PesaPal - Supports M-Pesa, Airtel Money, Cards & Bank
            </p>
          </CardContent>
        </Card>
      </div>

      {/* PesaPal Payment Modal */}
      <PesapalPayModal
        open={showPesapalPay}
        onOpenChange={setShowPesapalPay}
        userId={user.id}
        amount={totalAmount}
        currency="KES"
        description={`Order payment for ${cartItems.length} items`}
        onSuccess={handlePaymentSuccess}
        onFailure={handlePaymentFailure}
      />
    </>
  );
};

export default CheckoutModal;
