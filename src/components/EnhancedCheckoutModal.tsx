import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { X, CreditCard, Check, MapPin, Phone, Truck, Store, Download, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OrderService } from '@/services/orderService';
import { DeliveryCostService, DeliveryLocation as NewDeliveryLocation } from '@/services/deliveryCostService';
import { CheckoutDeliveryCosts } from './CheckoutDeliveryCosts';
import { UserProfileService, UserProfile } from '@/services/userProfileService';
import { MpesaService } from '@/services/mpesaService';
import { useCurrency } from '@/hooks/useCurrency';
import { CartItemWithProduct, Address, PaymentMethod, DeliveryMethod, DeliveryDetails } from '@/types/order';
import { Product } from '@/types/product';
import { HCaptchaComponent } from '@/components/ui/hcaptcha';
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
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [currentStep, setCurrentStep] = useState<'delivery' | 'payment' | 'mpesa' | 'complete'>('delivery');
  
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState(0);
  const [isCalculatingDeliveryFee, setIsCalculatingDeliveryFee] = useState(false);
  const [deliveryFeeDetails, setDeliveryFeeDetails] = useState<any>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  
  // New delivery location state
  const [customerLocation, setCustomerLocation] = useState<NewDeliveryLocation | null>(null);
  const [totalDeliveryCost, setTotalDeliveryCost] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const { toast } = useToast();

  const handleCaptchaVerify = (token: string) => setCaptchaToken(token);
  const handleCaptchaError = () => setCaptchaToken(null);

  // Load user profile and pre-populate location
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.id) {
        try {
          setIsLoadingProfile(true);
          const profile = await UserProfileService.getUserProfile(user.id);
          setUserProfile(profile);
          
          // Pre-populate customer location from profile
          if (profile?.county) {
            const location: NewDeliveryLocation = {
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

  // Recalculate delivery fee when customer location changes
  useEffect(() => {
    if (deliveryMethod === 'delivery' && customerLocation) {
      calculateDeliveryCosts();
    }
  }, [customerLocation, deliveryMethod, cartItems]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryFee = deliveryMethod === 'delivery' ? totalDeliveryCost : 0;
  const totalAmount = subtotal + deliveryFee;

  const formatCheckoutPrice = (price: number) => {
    return formatPrice(price);
  };

  const calculateDeliveryCosts = async () => {
    if (deliveryMethod !== 'delivery' || !customerLocation || cartItems.length === 0) {
      setTotalDeliveryCost(0);
      return;
    }

    setIsCalculatingDeliveryFee(true);
    try {
      const costs = await Promise.all(
        cartItems.map(async (item) => {
          const { data: cost, error } = await DeliveryCostService.calculateProductDeliveryCost(
            item.product.id,
            customerLocation
          );
          return cost;
        })
      );

      const validCosts = costs.filter(cost => cost !== null);
      const total = validCosts.reduce((sum, cost) => sum + cost.totalCost, 0);
      setTotalDeliveryCost(total);
    } catch (error) {
      console.error('Error calculating delivery costs:', error);
      toast({
        title: "Error",
        description: "Failed to calculate delivery costs. Please try again.",
        variant: "destructive",
      });
      setTotalDeliveryCost(500); // Fallback to default fee
    } finally {
      setIsCalculatingDeliveryFee(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 'delivery') {
      // Validate delivery information
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
          description: "Please set your delivery location to calculate delivery costs.",
          variant: "destructive"
        });
        return;
      }

      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      if (paymentMethod === 'mpesa') {
        setCurrentStep('mpesa');
      } else {
        handlePlaceOrder();
      }
    }
  };

  const handleBackStep = () => {
    if (currentStep === 'payment') {
      setCurrentStep('delivery');
    } else if (currentStep === 'mpesa') {
      setCurrentStep('payment');
    }
  };

  const handleMpesaPayment = async () => {
    if (!mpesaNumber) {
      toast({
        title: "Missing Information",
        description: "Please enter your M-Pesa phone number.",
        variant: "destructive"
      });
      return;
    }

    const hcaptchaEnabled = import.meta.env.VITE_ENABLE_HCAPTCHA === 'true';
    if (hcaptchaEnabled && !captchaToken) {
      toast({ title: "Verification required", description: "Please complete the captcha verification.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      // Create shipping address from customer location
      const shippingAddress: Address = {
        street: deliveryAddress.street || 'Address to be confirmed',
        city: customerLocation?.county || deliveryAddress.city || 'Nairobi',
        state: customerLocation?.county || deliveryAddress.state || 'Nairobi',
        zip: deliveryAddress.zip || '00100',
        country: 'Kenya'
      };

      // Add location details to notes
      const locationNotes = customerLocation 
        ? `Delivery Location: ${customerLocation.county}${customerLocation.constituency ? `, ${customerLocation.constituency}` : ''}${customerLocation.ward ? `, ${customerLocation.ward}` : ''}${customerLocation.whatsapp_number ? ` | WhatsApp: ${customerLocation.whatsapp_number}` : ''}`
        : '';

      // Create order first
      const order = await OrderService.createOrder(user.id, {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        customer_email: userProfile?.email || user?.email || '',
        customer_phone: userProfile?.phone_number || user?.phone_number || '',
        notes: `${deliveryMethod === 'pickup' ? 'Pickup from vendor' : 'ISA Delivery'}\n${locationNotes}\n${notes}`,
        payment_method: 'mpesa',
        delivery_fee: deliveryMethod === 'delivery' ? totalDeliveryCost : 0
      });

      // Process M-Pesa payment using the real M-Pesa API
      const mpesaResponse = await MpesaService.initiatePayment({
        phoneNumber: mpesaNumber,
        amount: totalAmount,
        orderId: order.id,
        description: `ISA Order #${order.order_number}`
      });

      if (mpesaResponse.success) {
        setOrderNumber(order.order_number);
        setCurrentStep('complete');
        onOrderComplete();
        soundService.playSuccessSound();

        toast({
          title: "Payment Request Sent!",
          description: mpesaResponse.message,
        });
      } else {
        throw new Error(mpesaResponse.message);
      }

    } catch (error: any) {
      // Improved error logging
      if (error?.message) {
        console.error('M-Pesa payment error:', error.message, error);
      } else {
        console.error('M-Pesa payment error:', error);
      }
      if (error?.data) {
        console.error('Error data:', error.data);
      }
      soundService.playErrorSound();
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "M-Pesa payment failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      // Create shipping address from customer location
      const shippingAddress: Address = {
        street: deliveryAddress.street || 'Address to be confirmed',
        city: customerLocation?.county || deliveryAddress.city || 'Nairobi',
        state: customerLocation?.county || deliveryAddress.state || 'Nairobi',
        zip: deliveryAddress.zip || '00100',
        country: 'Kenya'
      };

      // Add location details to notes
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
        notes: `${deliveryMethod === 'pickup' ? 'Pickup from vendor' : 'ISA Delivery'}\n${locationNotes}\n${notes}`,
        payment_method: paymentMethod,
        delivery_fee: deliveryMethod === 'delivery' ? totalDeliveryCost : 0
      });

      // Process payment based on method
      if (paymentMethod === 'mpesa') {
        // M-Pesa payment is handled separately in handleMpesaPayment
        return;
      } else if (paymentMethod === 'cash_on_delivery' || paymentMethod === 'cash_on_pickup') {
        // Update payment status for cash payments
        await OrderService.updateOrderStatus(order.id, {
          order_id: order.id,
          status: 'confirmed',
          notes: `Order confirmed. Payment will be collected ${paymentMethod === 'cash_on_delivery' ? 'on delivery' : 'on pickup'}.`
        });
      } else {
        // Process other payment methods
        await OrderService.processPayment(order.id, {
          order_id: order.id,
          payment_method: paymentMethod,
          amount: totalAmount
        });
      }

      setOrderNumber(order.order_number);
      setCurrentStep('complete');
      onOrderComplete();
      soundService.playSuccessSound();

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.order_number} has been confirmed.`,
      });

    } catch (error: any) {
      // Improved error logging
      if (error?.message) {
        console.error('Checkout error:', error.message, error);
      } else {
        console.error('Checkout error:', error);
      }
      if (error?.data) {
        console.error('Error data:', error.data);
      }
      soundService.playErrorSound();
      toast({
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "There was an error processing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadReceipt = () => {
    // Generate and download receipt
    const receiptContent = `
Order Receipt
Order #: ${orderNumber}
Date: ${new Date().toLocaleDateString()}
Customer: ${contactInfo.email}
Phone: ${contactInfo.phone}

Items:
${cartItems.map(item => `${item.product.name} x${item.quantity} - ${formatCheckoutPrice(item.product.price * item.quantity)}`).join('\n')}

Subtotal: ${formatCheckoutPrice(subtotal)}
Delivery Fee: ${formatCheckoutPrice(deliveryFee)}
Total: ${formatCheckoutPrice(totalAmount)}

Delivery Method: ${deliveryMethod === 'pickup' ? 'Pickup from Vendor' : 'ISA Delivery'}
Payment Method: ${paymentMethod === 'mpesa' ? 'M-Pesa' : paymentMethod}
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${orderNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  if (currentStep === 'complete' as const) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Order Confirmed!</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Order #{orderNumber}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {deliveryMethod === 'pickup' 
                ? 'You can pick up your order from the vendor location.' 
                : 'Your order will be delivered to your address.'}
            </p>
            <div className="space-y-2">
              <Button onClick={downloadReceipt} className="w-full" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
              <Button onClick={onClose} className="w-full">
                Continue Shopping
              </Button>
            </div>
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
          <div className="flex items-center space-x-2 mt-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'delivery' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 ${
              currentStep === 'payment' || currentStep === 'mpesa' ? 'bg-blue-600' : 'bg-gray-200'
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'payment' || currentStep === 'mpesa' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <div className={`flex-1 h-1 ${
              currentStep === 'mpesa' ? 'bg-blue-600' : 'bg-gray-200'
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'mpesa' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {currentStep === 'delivery' && (
            <>
              {/* New Delivery Cost System */}
              <CheckoutDeliveryCosts
                cartItems={cartItems}
                customerLocation={customerLocation}
                onLocationUpdate={setCustomerLocation}
                className="mb-6"
              />

              <Separator />

              {/* Contact Information - Read Only */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Information
                </h3>
                {isLoadingProfile ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Loading your information...</span>
                  </div>
                ) : userProfile ? (
                  <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                  <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {userProfile.first_name} {userProfile.last_name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {userProfile.email}
                        </p>
                      </div>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Verified
                      </Badge>
                        </div>
                    {userProfile.phone_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {userProfile.phone_number}
                        </span>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                      This information is from your profile. To update, please go to your account settings.
                        </p>
                      </div>
                    ) : (
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Unable to load your contact information. Please ensure you're logged in.
                      </p>
                  </div>
                )}
              </div>
            </>
          )}

          {currentStep === 'payment' && (
            <>
              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </h3>
                <Select value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
                  <SelectTrigger className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="airtel_money">Airtel Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                        {formatCheckoutPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                    <span className="text-gray-900 dark:text-white">{formatCheckoutPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Delivery Fee:</span>
                    <span className="text-gray-900 dark:text-white">
                      {deliveryFee === 0 ? 'Free' : formatCheckoutPrice(deliveryFee)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900 dark:text-white">Total:</span>
                    <span className="text-gray-900 dark:text-white">{formatCheckoutPrice(totalAmount)}</span>
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
                  className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                  rows={3}
                />
              </div>
            </>
          )}

          {currentStep === 'mpesa' && paymentMethod === 'mpesa' && (
            <>
              {/* M-Pesa Payment */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  M-Pesa Payment
                </h3>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    You will receive an M-Pesa prompt on your phone to complete the payment of {formatCheckoutPrice(totalAmount)}.
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="mpesa_number">M-Pesa Phone Number</Label>
                    <Input
                      id="mpesa_number"
                      type="tel"
                      value={mpesaNumber}
                      onChange={(e) => setMpesaNumber(e.target.value)}
                      placeholder="254700000000"
                      className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Enter your M-Pesa registered phone number. You will receive a payment prompt on your phone.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
          {currentStep === 'mpesa' && paymentMethod === 'airtel_money' && (
            <>
              {/* Airtel Money Payment */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Airtel Money Payment
                </h3>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    You will receive an Airtel Money prompt on your phone to complete the payment of {formatCheckoutPrice(totalAmount)}.
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="airtel_number">Airtel Money Phone Number</Label>
                    <Input
                      id="airtel_number"
                      type="tel"
                      value={mpesaNumber}
                      onChange={(e) => setMpesaNumber(e.target.value)}
                      placeholder="254700000000"
                      className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Enter your Airtel Money registered phone number. You will receive a payment prompt on your phone.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-2">
            {currentStep !== 'delivery' && (
              <Button onClick={handleBackStep} variant="outline">
                Back
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              {currentStep === 'delivery' && (
                <Button onClick={handleNextStep}>
                  Continue to Payment
                </Button>
              )}
              {currentStep === 'payment' && (
                <Button onClick={handleNextStep}>
                  {paymentMethod === 'mpesa' ? 'Continue to M-Pesa' : 'Place Order'}
                </Button>
              )}
              {currentStep === 'mpesa' && (
                <div className="space-y-3">
                  <HCaptchaComponent
                    onVerify={handleCaptchaVerify}
                    onError={handleCaptchaError}
                  />
                  <Button 
                    onClick={handleMpesaPayment} 
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? 'Processing...' : `Pay ${formatCheckoutPrice(totalAmount)}`}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedCheckoutModal; 