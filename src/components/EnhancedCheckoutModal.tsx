import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { X, CreditCard, Check, MapPin, Phone, Truck, Store, Download, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OrderService } from '@/services/orderService';
import { DeliveryFeeService, DeliveryLocation } from '@/services/deliveryFeeService';
import { MpesaService } from '@/services/mpesaService';
import { useCurrency } from '@/hooks/useCurrency';
import { CartItemWithProduct, Address, PaymentMethod, DeliveryMethod, DeliveryDetails } from '@/types/order';
import { Product } from '@/types/product';

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
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState(0);
  const [isCalculatingDeliveryFee, setIsCalculatingDeliveryFee] = useState(false);
  const [deliveryFeeDetails, setDeliveryFeeDetails] = useState<any>(null);

  const { toast } = useToast();

  // Recalculate delivery fee when delivery address changes
  useEffect(() => {
    if (deliveryMethod === 'delivery' && deliveryAddress.street && deliveryAddress.city) {
      calculateDeliveryFeeForAddress();
    }
  }, [deliveryAddress.street, deliveryAddress.city, deliveryMethod]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryFee = deliveryMethod === 'delivery' ? calculatedDeliveryFee : 0;
  const totalAmount = subtotal + deliveryFee;

  const formatCheckoutPrice = (price: number) => {
    return formatPrice(price);
  };

  const calculateDeliveryFeeForAddress = async () => {
    if (deliveryMethod !== 'delivery' || !deliveryAddress.street || !deliveryAddress.city) {
      setCalculatedDeliveryFee(0);
      setDeliveryFeeDetails(null);
      return;
    }

    setIsCalculatingDeliveryFee(true);
    try {
      // Create pickup location (assuming Nairobi as default pickup point)
      const pickupLocation: DeliveryLocation = {
        latitude: -1.2921,
        longitude: 36.8219,
        address: 'ISA Nairobi Hub',
        city: 'Nairobi',
        county: 'Nairobi'
      };

      // Create delivery location
      const deliveryLocation: DeliveryLocation = {
        latitude: 0, // Will be calculated by the service
        longitude: 0, // Will be calculated by the service
        address: deliveryAddress.street,
        city: deliveryAddress.city,
        county: deliveryAddress.state
      };

      // Calculate items for delivery fee
      const deliveryItems = cartItems.map(item => ({
        weight: 0.5, // Default weight per item in kg
        quantity: item.quantity,
        isFragile: false // You can add fragile flag to products later
      }));

      const feeResponse = await DeliveryFeeService.calculateDeliveryFee({
        pickupLocation,
        deliveryLocation,
        items: deliveryItems,
        deliveryType: 'standard'
      });

      setCalculatedDeliveryFee(feeResponse.totalFee);
      setDeliveryFeeDetails(feeResponse);
    } catch (error) {
      console.error('Error calculating delivery fee:', error);
      // Fallback to default fee
      setCalculatedDeliveryFee(500);
      setDeliveryFeeDetails(null);
    } finally {
      setIsCalculatingDeliveryFee(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 'delivery') {
      // Validate delivery information
      if (!contactInfo.email || !contactInfo.phone) {
        toast({
          title: "Missing Information",
          description: "Please provide your email and phone number.",
          variant: "destructive"
        });
        return;
      }

      if (deliveryMethod === 'delivery' && (!deliveryAddress.street || !deliveryAddress.city)) {
        toast({
          title: "Missing Information",
          description: "Please fill in your delivery address.",
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

    setIsProcessing(true);
    try {
      // Create order first
      const order = await OrderService.createOrder(user.id, {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        shipping_address: deliveryAddress,
        billing_address: deliveryAddress,
        customer_email: contactInfo.email,
        customer_phone: contactInfo.phone,
        notes: `${deliveryMethod === 'pickup' ? 'Pickup from vendor' : 'ISA Delivery'}\n${notes}`,
        payment_method: 'mpesa'
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
      const order = await OrderService.createOrder(user.id, {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        shipping_address: deliveryAddress,
        billing_address: deliveryAddress,
        customer_email: contactInfo.email,
        customer_phone: contactInfo.phone,
        notes: `${deliveryMethod === 'pickup' ? 'Pickup from vendor' : 'ISA Delivery'}\n${notes}`,
        payment_method: paymentMethod
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
              {/* Delivery Method Selection - Only ISA Delivery */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delivery Method</h3>
                <div className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-slate-600 rounded-lg">
                  <Truck className="w-5 h-5 text-green-600" />
                  <div>
                    <Label className="text-base font-medium">ISA Delivery</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">We'll deliver to your address (KES 500 fee)</p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Delivery Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={deliveryAddress.street}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                      placeholder="123 Main St"
                      className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={deliveryAddress.city}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Nairobi"
                      className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">County</Label>
                    <Input
                      id="state"
                      value={deliveryAddress.state}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Nairobi"
                      className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">Postal Code</Label>
                    <Input
                      id="zip"
                      value={deliveryAddress.zip}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, zip: e.target.value }))}
                      placeholder="00100"
                      className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                    />
                  </div>
                </div>
                
                {/* Delivery Fee Details */}
                {deliveryMethod === 'delivery' && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Delivery Fee Details</h4>
                    {isCalculatingDeliveryFee ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Calculating delivery fee...</span>
                      </div>
                    ) : deliveryFeeDetails ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Base Fee:</span>
                          <span className="text-gray-900 dark:text-white">{formatCheckoutPrice(deliveryFeeDetails.baseFee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Distance Fee ({deliveryFeeDetails.distance}km):</span>
                          <span className="text-gray-900 dark:text-white">{formatPrice(deliveryFeeDetails.distanceFee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Weight Fee:</span>
                          <span className="text-gray-900 dark:text-white">{formatPrice(deliveryFeeDetails.weightFee)}</span>
                        </div>
                        {deliveryFeeDetails.fragileFee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Fragile Items:</span>
                            <span className="text-gray-900 dark:text-white">{formatPrice(deliveryFeeDetails.fragileFee)}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span className="text-gray-900 dark:text-white">Total Delivery Fee:</span>
                          <span className="text-gray-900 dark:text-white">{formatPrice(deliveryFeeDetails.totalFee)}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Estimated delivery: {deliveryFeeDetails.estimatedDeliveryTime}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Enter your address to calculate delivery fee
                      </p>
                    )}
                  </div>
                )}
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
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+254700000000"
                      className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                    />
                  </div>
                </div>
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
                <Button 
                  onClick={handleMpesaPayment} 
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? 'Processing...' : `Pay ${formatCheckoutPrice(totalAmount)}`}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedCheckoutModal; 