import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import MyPlugPayModal from '@/components/payments/MyPlugPayModal';
import { Separator } from '@/components/ui/separator';
import { X, Check, MapPin, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OrderService } from '@/services/orderService';
import { CartItemWithProduct, Address, PaymentMethod } from '@/types/order';
import { Checkbox } from '@/components/ui/checkbox';

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
    country: 'United States'
  });
  const [contactInfo, setContactInfo] = useState({
    email: user?.email || '',
    phone: ''
  });
  const [showMyPlugPay, setShowMyPlugPay] = useState(false);
  const [notes, setNotes] = useState('');
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  const { toast } = useToast();

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const taxAmount = subtotal * 0.08;
  const shippingAmount = subtotal > 50 ? 0 : 5.99;
  const totalAmount = subtotal + taxAmount + shippingAmount;

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
        notes: isGift ? `${notes}${notes ? ' | ' : ''}Gift: ${giftMessage || 'No message'}` : notes,
        payment_method: 'myplug_pay',
        is_gift: isGift,
        gift_message: giftMessage
      });
      setOrderNumber(order.order_number);
      setShowMyPlugPay(true);

    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (!isOpen) return null;

  if (orderComplete) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Order Confirmed!</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Order #{OrderService.formatOrderNumber(orderNumber)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You will receive a confirmation email shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative border-b border-gray-200 dark:border-slate-700">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Checkout
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Shipping Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
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
                  className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="New York"
                  className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="NY"
                  className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                />
              </div>
              <div>
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={shippingAddress.zip}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, zip: e.target.value }))}
                  placeholder="10001"
                  className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                  className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment selection happens in ISA Pay modal */}

          <Separator />

          {/* Order Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
            <div className="space-y-2 bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    {item.product.name} x {item.quantity}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                <span className="text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Tax:</span>
                <span className="text-gray-900 dark:text-white">{formatPrice(taxAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Shipping:</span>
                <span className="text-gray-900 dark:text-white">
                  {shippingAmount === 0 ? 'Free' : formatPrice(shippingAmount)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-gray-900 dark:text-white">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Gift Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isGift"
                checked={isGift}
                onCheckedChange={(checked) => setIsGift(checked as boolean)}
              />
              <Label htmlFor="isGift" className="flex items-center space-x-2">
                <Gift className="h-4 w-4" />
                <span>This is a gift</span>
              </Label>
            </div>
            
            {isGift && (
              <div className="space-y-2">
                <Label htmlFor="giftMessage">Gift Message (Optional)</Label>
                <Input
                  id="giftMessage"
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="Add a personal message for the recipient..."
                  className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Order Notes (Optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special instructions or notes..."
              className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
            />
          </div>

          {/* Place Order Button */}
          <Button onClick={handlePlaceOrder} disabled={isProcessing} className="w-full bg-green-600 hover:bg-green-700 text-white">
            {isProcessing ? 'Processing...' : `Review & Pay - ${formatPrice(totalAmount)}`}
          </Button>
        </CardContent>
      </Card>
      {showMyPlugPay && (
        <MyPlugPayModal
          open={showMyPlugPay}
          onOpenChange={setShowMyPlugPay}
          userId={user.id}
          amount={totalAmount}
          currency={'KES'}
          orderId={orderNumber}
          description={`MyPlug Order #${OrderService.formatOrderNumber(orderNumber)}`}
          onSuccess={() => {
            setOrderComplete(true);
            onOrderComplete();
            toast({ title: 'Order Placed Successfully!', description: `Your order #${OrderService.formatOrderNumber(orderNumber)} has been confirmed.` });
            setTimeout(() => { onClose(); setOrderComplete(false); }, 3000);
          }}
        />
      )}
    </div>
  );
};

export default CheckoutModal; 