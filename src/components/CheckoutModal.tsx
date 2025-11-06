import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import DPOPayModal from '@/components/payments/DPOPayModal';
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
  const [showDPOPay, setShowDPOPay] = useState(false);
  const [notes, setNotes] = useState('');
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'airtel_money' | 'card' | 'bank'>('mpesa');
  const [paymentDetails, setPaymentDetails] = useState({
    phoneNumber: '',
    cardDetails: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    },
    bankDetails: {
      accountNumber: '',
      bankName: '',
      accountHolderName: ''
    }
  });

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

    // Validate payment details based on method
    if (paymentMethod === 'mpesa' || paymentMethod === 'airtel_money') {
      if (!paymentDetails.phoneNumber) {
        toast({
          title: "Phone Number Required",
          description: "Please enter your phone number for mobile payment.",
          variant: "destructive"
        });
        return;
      }
    } else if (paymentMethod === 'card') {
      if (!paymentDetails.cardDetails.cardNumber || !paymentDetails.cardDetails.expiryDate || !paymentDetails.cardDetails.cvv || !paymentDetails.cardDetails.cardholderName) {
        toast({
          title: "Card Details Required",
          description: "Please fill in all card details.",
          variant: "destructive"
        });
        return;
      }
    } else if (paymentMethod === 'bank') {
      if (!paymentDetails.bankDetails.accountNumber || !paymentDetails.bankDetails.bankName || !paymentDetails.bankDetails.accountHolderName) {
        toast({
          title: "Bank Details Required",
          description: "Please fill in all bank details.",
          variant: "destructive"
        });
        return;
      }
    }

    // Show payment modal first - order will be created only after successful payment
    setShowDPOPay(true);
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
        notes: isGift ? `${notes}${notes ? ' | ' : ''}Gift: ${giftMessage || 'No message'}` : notes,
        payment_method: 'pesapal',
        is_gift: isGift,
        gift_message: giftMessage
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
        description: `Your order #${OrderService.formatOrderNumber(order.order_number)} has been confirmed. Payment processed via ${tx.provider}.` 
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
      description: "Your payment could not be processed. Please try again or use a different payment method.",
      variant: "destructive"
    });
    setShowDPOPay(false);
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

          {/* Payment Method Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={paymentMethod === 'mpesa' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('mpesa')}
                className="flex items-center gap-2"
              >
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                M-Pesa
              </Button>
              <Button
                variant={paymentMethod === 'airtel_money' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('airtel_money')}
                className="flex items-center gap-2"
              >
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                Airtel Money
              </Button>
              <Button
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('card')}
                className="flex items-center gap-2"
              >
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                Card Payment
              </Button>
              <Button
                variant={paymentMethod === 'bank' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('bank')}
                className="flex items-center gap-2"
              >
                <div className="w-4 h-4 bg-purple-600 rounded"></div>
                Bank Transfer
              </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              All payments are processed securely by DPO Group
            </p>
          </div>

          {/* Payment Details Collection */}
          {(paymentMethod === 'mpesa' || paymentMethod === 'airtel_money') && (
            <div>
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                type="tel"
                value={paymentDetails.phoneNumber}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="254700000000"
                className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter your {paymentMethod === 'mpesa' ? 'M-Pesa' : 'Airtel Money'} registered phone number.
              </p>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardholder_name">Cardholder Name</Label>
                <Input
                  id="cardholder_name"
                  value={paymentDetails.cardDetails.cardholderName}
                  onChange={(e) => setPaymentDetails(prev => ({ 
                    ...prev, 
                    cardDetails: { ...prev.cardDetails, cardholderName: e.target.value }
                  }))}
                  placeholder="John Doe"
                  className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                />
              </div>
              <div>
                <Label htmlFor="card_number">Card Number</Label>
                <Input
                  id="card_number"
                  value={paymentDetails.cardDetails.cardNumber}
                  onChange={(e) => setPaymentDetails(prev => ({ 
                    ...prev, 
                    cardDetails: { ...prev.cardDetails, cardNumber: e.target.value }
                  }))}
                  placeholder="1234 5678 9012 3456"
                  className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    value={paymentDetails.cardDetails.expiryDate}
                    onChange={(e) => setPaymentDetails(prev => ({ 
                      ...prev, 
                      cardDetails: { ...prev.cardDetails, expiryDate: e.target.value }
                    }))}
                    placeholder="MM/YY"
                    className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={paymentDetails.cardDetails.cvv}
                    onChange={(e) => setPaymentDetails(prev => ({ 
                      ...prev, 
                      cardDetails: { ...prev.cardDetails, cvv: e.target.value }
                    }))}
                    placeholder="123"
                    className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'bank' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={paymentDetails.bankDetails.bankName}
                  onChange={(e) => setPaymentDetails(prev => ({ 
                    ...prev, 
                    bankDetails: { ...prev.bankDetails, bankName: e.target.value }
                  }))}
                  placeholder="Equity Bank, KCB, etc."
                  className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                />
              </div>
              <div>
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  value={paymentDetails.bankDetails.accountNumber}
                  onChange={(e) => setPaymentDetails(prev => ({ 
                    ...prev, 
                    bankDetails: { ...prev.bankDetails, accountNumber: e.target.value }
                  }))}
                  placeholder="1234567890"
                  className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                />
              </div>
              <div>
                <Label htmlFor="account_holder">Account Holder Name</Label>
                <Input
                  id="account_holder"
                  value={paymentDetails.bankDetails.accountHolderName}
                  onChange={(e) => setPaymentDetails(prev => ({ 
                    ...prev, 
                    bankDetails: { ...prev.bankDetails, accountHolderName: e.target.value }
                  }))}
                  placeholder="John Doe"
                  className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                />
              </div>
            </div>
          )}

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
      {showDPOPay && (
        <DPOPayModal
          open={showDPOPay}
          onOpenChange={setShowDPOPay}
          userId={user.id}
          amount={totalAmount}
          currency={'KES'}
          orderId={orderNumber}
          description={`ISA Order #${OrderService.formatOrderNumber(orderNumber)}`}
          paymentMethod={paymentMethod === 'airtel_money' ? 'airtel' : paymentMethod}
          paymentDetails={{
            phoneNumber: paymentDetails.phoneNumber,
            cardDetails: paymentMethod === 'card' ? paymentDetails.cardDetails : undefined,
            bankDetails: paymentMethod === 'bank' ? paymentDetails.bankDetails : undefined
          }}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      )}
    </div>
  );
};

export default CheckoutModal; 