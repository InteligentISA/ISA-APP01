import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { X, Check, MapPin, Phone, Truck, Store, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OrderService } from '@/services/orderService';
import { DeliveryCostService, DeliveryLocation } from '@/services/deliveryCostService';
import { CheckoutDeliveryCosts } from './CheckoutDeliveryCosts';
import { UserProfileService, UserProfile } from '@/services/userProfileService';
import PesapalPayModal from '@/components/payments/PesapalPayModal';
import { useCurrency } from '@/hooks/useCurrency';
import { CartItemWithProduct, Address, DeliveryMethod } from '@/types/order';
import { soundService } from '@/services/soundService';

interface EnhancedCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  cartItems: CartItemWithProduct[];
  onOrderComplete: () => void;
}

const EnhancedCheckoutModal: React.FC<EnhancedCheckoutModalProps> = ({
  isOpen,
  onClose,
  user,
  cartItems,
  onOrderComplete
}) => {
  const { formatPrice } = useCurrency();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'delivery' | 'payment' | 'complete'>('delivery');
  
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'Kenya'
  });
  const [showPesapalPay, setShowPesapalPay] = useState(false);
  const [notes, setNotes] = useState('');
  const [totalDeliveryCost, setTotalDeliveryCost] = useState(0);
  const [customerLocation, setCustomerLocation] = useState<DeliveryLocation | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [orderNumber, setOrderNumber] = useState('');

  const { toast } = useToast();

  // Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.id) {
        try {
          setIsLoadingProfile(true);
          const profile = await UserProfileService.getUserProfile(user.id);
          setUserProfile(profile);
          
          if (profile?.county) {
            const location: DeliveryLocation = {
              county: profile.county,
              constituency: profile.constituency || undefined,
              ward: profile.ward || undefined,
              whatsapp_number: profile.whatsapp_number || profile.phone_number || undefined
            };
            setCustomerLocation(location);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        } finally {
          setIsLoadingProfile(false);
        }
      }
    };

    loadUserProfile();
  }, [user?.id]);

  // Calculate delivery costs
  useEffect(() => {
    if (deliveryMethod === 'delivery' && customerLocation) {
      calculateDeliveryCosts();
    }
  }, [customerLocation, deliveryMethod, cartItems]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryFee = deliveryMethod === 'delivery' ? totalDeliveryCost : 0;
  const totalAmount = subtotal + deliveryFee;

  const calculateDeliveryCosts = async () => {
    if (deliveryMethod !== 'delivery' || !customerLocation || cartItems.length === 0) {
      setTotalDeliveryCost(0);
      return;
    }

    try {
      const { data: deliveryData, error } = await DeliveryCostService.getCartItemsDeliveryCost(
        cartItems,
        customerLocation
      );

      if (error || !deliveryData) {
        throw new Error('Failed to calculate delivery costs');
      }

      setTotalDeliveryCost(deliveryData.totalCost);
    } catch (error) {
      console.error('Error calculating delivery costs:', error);
      setTotalDeliveryCost(500); // Fallback
    }
  };

  const handleNextStep = () => {
    if (currentStep === 'delivery') {
      if (!userProfile) {
        toast({
          title: "Profile Required",
          description: "Please ensure you're logged in and your profile is complete.",
          variant: "destructive"
        });
        return;
      }

      if (deliveryMethod === 'delivery' && !customerLocation) {
        toast({
          title: "Missing Information",
          description: "Please set your delivery location.",
          variant: "destructive"
        });
        return;
      }

      setCurrentStep('payment');
    }
  };

  const handlePlaceOrder = () => {
    setShowPesapalPay(true);
  };

  const handlePaymentSuccess = async (tx: { transaction_id: string; provider: string }) => {
    setIsProcessing(true);
    try {
      const shippingAddress: Address = {
        street: deliveryAddress.street || 'Address to be confirmed',
        city: customerLocation?.county || deliveryAddress.city || 'Nairobi',
        state: customerLocation?.county || deliveryAddress.state || 'Nairobi',
        zip: deliveryAddress.zip || '00100',
        country: 'Kenya'
      };

      const locationNotes = customerLocation 
        ? `Delivery Location: ${customerLocation.county}${customerLocation.constituency ? `, ${customerLocation.constituency}` : ''}${customerLocation.ward ? `, ${customerLocation.ward}` : ''}${customerLocation.whatsapp_number ? ` | WhatsApp: ${customerLocation.whatsapp_number}` : ''}`
        : '';

      const order = await OrderService.createOrder(user.id, {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        customer_email: userProfile?.email || user?.email || '',
        customer_phone: userProfile?.phone_number || user?.phone_number || '',
        notes: `${deliveryMethod === 'pickup' ? 'Pickup from vendor' : 'MyPlug Delivery'}\n${locationNotes}\n${notes}`,
        payment_method: 'pesapal',
        delivery_fee: deliveryMethod === 'delivery' ? totalDeliveryCost : 0
      });

      await OrderService.updateOrderStatus(order.id, {
        order_id: order.id,
        status: 'confirmed',
        notes: `Payment confirmed via ${tx.provider}. Transaction ID: ${tx.transaction_id}`
      });

      setOrderNumber(order.order_number);
      setCurrentStep('complete');
      onOrderComplete();
      soundService.playSuccessSound();
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.order_number} has been confirmed.`,
      });
    } catch (error: any) {
      console.error('Order creation after payment error:', error);
      soundService.playErrorSound();
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

  if (!isOpen) return null;

  if (currentStep === 'complete') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Order Confirmed!</h3>
            <p className="text-muted-foreground mb-4">Order #{orderNumber}</p>
            <p className="text-sm text-muted-foreground">You will receive a confirmation shortly.</p>
            <Button onClick={() => { onClose(); setCurrentStep('delivery'); }} className="mt-6">
              Continue Shopping
            </Button>
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
            <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
            <CardTitle className="text-2xl font-bold">Checkout</CardTitle>
            <div className="flex items-center gap-2 mt-4">
              <div className={`flex items-center ${currentStep === 'delivery' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'delivery' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>
                  1
                </div>
                <span className="ml-2 font-medium">Delivery</span>
              </div>
              <div className="flex-1 h-0.5 bg-muted mx-2" />
              <div className={`flex items-center ${currentStep === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'payment' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>
                  2
                </div>
                <span className="ml-2 font-medium">Payment</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {currentStep === 'delivery' && (
              <>
                {/* Delivery Method */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Delivery Method
                  </h3>
                  <RadioGroup value={deliveryMethod} onValueChange={(value: DeliveryMethod) => setDeliveryMethod(value)}>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                        <div className="font-medium">MyPlug Delivery</div>
                        <div className="text-sm text-muted-foreground">Delivered to your location</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                        <div className="font-medium">Pickup from Vendor</div>
                        <div className="text-sm text-muted-foreground">Free - Collect from vendor location</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {deliveryMethod === 'delivery' && (
                  <>
                    <Separator />
                    <CheckoutDeliveryCosts
                      cartItems={cartItems}
                      customerLocation={customerLocation}
                      onLocationUpdate={setCustomerLocation}
                      className="mb-6"
                    />
                  </>
                )}

                <Separator />

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Contact Information
                  </h3>
                  {isLoadingProfile ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-muted-foreground">Loading your information...</span>
                    </div>
                  ) : userProfile ? (
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{userProfile.first_name} {userProfile.last_name}</p>
                          <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                        </div>
                        <Badge variant="secondary">
                          <Check className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                      {userProfile.phone_number && (
                        <p className="text-sm text-muted-foreground">
                          <Phone className="inline h-3 w-3 mr-1" />
                          {userProfile.phone_number}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                      <p className="text-sm">Unable to load your contact information. Please ensure you're logged in.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {currentStep === 'payment' && (
              <>
                {/* Order Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                  <div className="space-y-2 bg-muted p-4 rounded-lg">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {item.product.name} x {item.quantity}
                        </span>
                        <span className="font-semibold">{formatPrice(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Fee:</span>
                      <span>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
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
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special instructions or notes..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {currentStep === 'payment' && (
                <Button variant="outline" onClick={() => setCurrentStep('delivery')} className="flex-1">
                  Back
                </Button>
              )}
              {currentStep === 'delivery' && (
                <Button onClick={handleNextStep} className="flex-1" size="lg">
                  Continue to Payment
                </Button>
              )}
              {currentStep === 'payment' && (
                <Button onClick={handlePlaceOrder} className="flex-1" size="lg" disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : `Pay ${formatPrice(totalAmount)}`}
                </Button>
              )}
            </div>

            {currentStep === 'payment' && (
              <p className="text-xs text-center text-muted-foreground">
                🔒 Secure payment powered by PesaPal - Supports M-Pesa, Airtel Money, Cards & Bank
              </p>
            )}
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

export default EnhancedCheckoutModal;
