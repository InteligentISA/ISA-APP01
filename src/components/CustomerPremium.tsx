import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Crown, 
  Star, 
  Check,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  AlertCircle,
  Calendar,
  Sparkles,
  Gift,
  Truck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionService } from "@/services/subscriptionService";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface CustomerSubscriptionPlan {
  id: string;
  name: string;
  plan_type: 'free' | 'premium';
  price: number;
  billing_cycle: 'weekly' | 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
  description: string;
}

const CustomerPremium = () => {
  const [subscriptionEnabled, setSubscriptionEnabled] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<CustomerSubscriptionPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'airtel' | 'card'>('mpesa');
  const [paymentDetails, setPaymentDetails] = useState({
    phoneNumber: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      loadSubscriptionData();
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      // Check if customer premium is enabled using LoyaltyService
      const { LoyaltyService } = await import("@/services/loyaltyService");
      const enabled = await LoyaltyService.isCustomerPremiumEnabled();
      setSubscriptionEnabled(enabled);

      if (enabled) {
        const subscription = await SubscriptionService.getUserSubscription(user.id);
        setCurrentPlan(subscription);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscriptionPlans: CustomerSubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free Plan',
      plan_type: 'free',
      price: 0,
      billing_cycle: 'monthly',
      features: [
        'Basic product browsing',
        'Limited AI assistance (5 queries/day)',
        'Standard delivery',
        'Basic customer support',
        'Standard checkout process'
      ],
      description: 'Perfect for getting started with ISA'
    },
    {
      id: 'premium_weekly',
      name: 'Premium Weekly',
      plan_type: 'premium',
      price: 199,
      billing_cycle: 'weekly',
      features: [
        'Unlimited AI shopping assistance',
        'Virtual try-on & personal styling',
        'Exclusive early access to drops',
        'Ad-free browsing',
        'Multiple wishlists',
        'Priority customer support',
        'Free delivery on orders over KES 2,000',
        'Exclusive member discounts'
      ],
      description: 'Try premium features for a week'
    },
    {
      id: 'premium_monthly',
      name: 'Premium Monthly',
      plan_type: 'premium',
      price: 699,
      billing_cycle: 'monthly',
      features: [
        'Unlimited AI shopping assistance',
        'Virtual try-on & personal styling',
        'Exclusive early access to drops',
        'Ad-free browsing',
        'Multiple wishlists',
        'Priority customer support',
        'Free delivery on orders over KES 2,000',
        'Monthly style recommendations',
        'Exclusive member discounts',
        'Priority order processing'
      ],
      popular: true,
      description: 'Most popular choice for regular shoppers'
    },
    {
      id: 'premium_yearly',
      name: 'Premium Yearly',
      plan_type: 'premium',
      price: 6999,
      billing_cycle: 'yearly',
      features: [
        'Unlimited AI shopping assistance',
        'Virtual try-on & personal styling',
        'Exclusive early access to drops',
        'Ad-free browsing',
        'Multiple wishlists',
        'Priority customer support',
        'Free delivery on all orders',
        'Monthly style recommendations',
        'Exclusive member discounts',
        'Priority order processing',
        'Exclusive member events',
        '2 months free compared to monthly',
        'VIP customer service'
      ],
      description: 'Best value for long-term users'
    }
  ];

  const getCurrentPlan = () => {
    if (!currentPlan) return subscriptionPlans.find(plan => plan.id === 'free');
    return subscriptionPlans.find(plan => plan.plan_type === currentPlan.plan_type && plan.billing_cycle === currentPlan.billing_cycle);
  };

  const isUpgrade = (planType: string) => {
    if (!currentPlan) return true;
    const planOrder = ['free', 'premium'];
    const currentIndex = planOrder.indexOf(currentPlan.plan_type);
    const newIndex = planOrder.indexOf(planType);
    return newIndex > currentIndex;
  };

  const handlePlanSelect = (plan: CustomerSubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan || !user?.id) return;

    // Validate payment details
    if (paymentMethod === 'mpesa' || paymentMethod === 'airtel') {
      if (!paymentDetails.phoneNumber) {
        toast({
          title: "Missing Information",
          description: "Please enter your phone number",
          variant: "destructive"
        });
        return;
      }
    } else if (paymentMethod === 'card') {
      if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.cardholderName) {
        toast({
          title: "Missing Information",
          description: "Please fill in all card details",
          variant: "destructive"
        });
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Cancel any existing active subscription
      await supabase
        .from('user_subscriptions' as any)
        .update({ status: 'cancelled' } as any)
        .eq('user_id', user.id)
        .eq('status', 'active');

      // Create new subscription
      const { data, error } = await supabase
        .from('user_subscriptions' as any)
        .insert({
          user_id: user.id,
          plan_type: selectedPlan.plan_type,
          billing_cycle: selectedPlan.billing_cycle,
          price_kes: selectedPlan.price,
          status: 'active',
          payment_method: paymentMethod,
          transaction_id: `TXN${Date.now()}`,
          auto_renew: true
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error creating subscription:', error);
        toast({
          title: "Subscription Failed",
          description: "Failed to create subscription. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Update user profile preferences
      await supabase
        .from('profiles')
        .update({
          preferences: {
            plan: selectedPlan.plan_type,
            plan_expiry: (data as any)?.expires_at
          }
        })
        .eq('id', user.id);

      toast({
        title: "Subscription Updated",
        description: `Successfully upgraded to ${selectedPlan.name}!`,
        variant: "default"
      });

      setShowPaymentModal(false);
      setSelectedPlan(null);
      loadSubscriptionData(); // Refresh data
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getDaysUntilExpiry = () => {
    if (!currentPlan?.expires_at) return 0;
    const expiryDate = new Date(currentPlan.expires_at);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isExpired = () => {
    if (!currentPlan?.expires_at) return false;
    return new Date(currentPlan.expires_at) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!subscriptionEnabled) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Crown className="w-6 h-6" />
              <span>Premium Subscriptions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Clock className="w-16 h-16 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-blue-800">Coming Soon!</h2>
              <p className="text-blue-600">
                We're working hard to bring you premium customer subscription plans with amazing benefits.
                Stay tuned for unlimited AI assistance, exclusive discounts, and priority support!
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-500">
                <Clock className="w-4 h-4" />
                <span>Launching soon</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview of upcoming features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-blue-600" />
              <span>What's Coming</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium">Unlimited AI Assistance</div>
                  <div className="text-sm text-gray-600">Get help with all your shopping needs</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Gift className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium">Exclusive Discounts</div>
                  <div className="text-sm text-gray-600">Member-only deals and offers</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Truck className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium">Free Delivery</div>
                  <div className="text-sm text-gray-600">Free shipping on all orders</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium">Priority Support</div>
                  <div className="text-sm text-gray-600">Get help when you need it</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPlanData = getCurrentPlan();

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      {currentPlanData && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Crown className="w-6 h-6" />
              <span>Current Plan</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-800">{currentPlanData.name}</h3>
                <p className="text-green-600">{currentPlanData.description}</p>
                {currentPlan?.expires_at && (
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">
                      Expires: {new Date(currentPlan.expires_at).toLocaleDateString()}
                      {!isExpired() && ` (${getDaysUntilExpiry()} days left)`}
                    </span>
                  </div>
                )}
              </div>
              <Badge variant={isExpired() ? "destructive" : "secondary"} className="bg-green-100 text-green-800">
                {isExpired() ? 'Expired' : 'Active'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-blue-600" />
            <span>Choose Your Plan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subscriptionPlans.filter(plan => plan.id !== 'free').map((plan) => {
              const isCurrent = currentPlanData?.id === plan.id;
              const canUpgrade = isUpgrade(plan.plan_type);
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative ${
                    plan.popular ? 'border-blue-300 bg-blue-50' : 
                    isCurrent ? 'border-green-300 bg-green-50' : 
                    'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-4 bg-blue-600 text-white">
                      Most Popular
                    </Badge>
                  )}
                  {isCurrent && (
                    <Badge className="absolute -top-2 right-4 bg-green-600 text-white">
                      Current
                    </Badge>
                  )}
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {plan.price === 0 ? 'Free' : `Ksh ${plan.price.toLocaleString()}`}
                      </div>
                      <div className="text-sm text-gray-500 mb-4">
                        {plan.billing_cycle === 'monthly' ? 'per month' : 
                         plan.billing_cycle === 'yearly' ? 'per year' : 'per week'}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        {plan.features.slice(0, 4).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            <Check className="w-3 h-3 text-green-600" />
                            {feature}
                          </div>
                        ))}
                        {plan.features.length > 4 && (
                          <div className="text-xs text-gray-500">
                            +{plan.features.length - 4} more features
                          </div>
                        )}
                      </div>

                      <Button 
                        className={`w-full ${
                          isCurrent ? 'bg-green-600 hover:bg-green-700' :
                          plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 
                          'bg-gray-600 hover:bg-gray-700'
                        }`}
                        disabled={isCurrent || !canUpgrade}
                        onClick={() => handlePlanSelect(plan)}
                      >
                        {isCurrent ? 'Current Plan' : 
                         !canUpgrade ? 'Downgrade Not Available' : 'Choose Plan'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent className="max-w-md" aria-describedby="payment-form-description">
            <DialogHeader>
              <DialogTitle>Complete Subscription</DialogTitle>
            </DialogHeader>
            <div id="payment-form-description" className="sr-only">
              Payment form to complete subscription purchase with payment method selection and details.
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">{selectedPlan.name}</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {selectedPlan.price === 0 ? 'Free' : `Ksh ${selectedPlan.price.toLocaleString()}`}
                </p>
                {selectedPlan.billing_cycle !== 'monthly' && (
                  <p className="text-sm text-gray-600">per {selectedPlan.billing_cycle}</p>
                )}
              </div>
              
              {/* Payment Method */}
              <div>
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(value: 'mpesa' | 'airtel' | 'card') => setPaymentMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="airtel">Airtel Money</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Details */}
              {(paymentMethod === 'mpesa' || paymentMethod === 'airtel') && (
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    placeholder="e.g., 254700000000"
                    value={paymentDetails.phoneNumber}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, phoneNumber: e.target.value })}
                  />
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <Label>Card Number</Label>
                    <Input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={paymentDetails.cardNumber}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Expiry Date</Label>
                      <Input
                        type="text"
                        placeholder="MM/YY"
                        value={paymentDetails.expiryDate}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>CVV</Label>
                      <Input
                        type="text"
                        placeholder="123"
                        value={paymentDetails.cvv}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Cardholder Name</Label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={paymentDetails.cardholderName}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, cardholderName: e.target.value })}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : 'Pay Now'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CustomerPremium;
