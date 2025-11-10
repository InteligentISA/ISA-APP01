import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PesapalPayModal from '@/components/payments/PesapalPayModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, CreditCard, Calendar, AlertCircle, Crown, Zap, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionService, SubscriptionPlan, UserSubscription, PaymentMethod } from '@/services/subscriptionService';
import { useCurrency } from '@/hooks/useCurrency';
import { CurrencyService } from '@/services/currencyService';

interface SubscriptionManagerProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionManager = ({ userId, isOpen, onClose }: SubscriptionManagerProps) => {
  const { currency, formatPrice } = useCurrency();
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('KES');
  const [showIsaPay, setShowIsaPay] = useState(false);
  const [pendingUpgrade, setPendingUpgrade] = useState<{ planId: string; amount: number; currency: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadSubscription();
      setPlans(SubscriptionService.getPlans());
    }
  }, [isOpen, userId]);

  const loadSubscription = async () => {
    try {
      const subscription = await SubscriptionService.getUserSubscription(userId);
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    setShowUpgradeDialog(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    const plan = SubscriptionService.getPlan(selectedPlan);
    if (!plan) return;

    setIsProcessing(true);

    try {
      // Get price in current currency
      const { amount: priceInCurrency } = CurrencyService.getCheckoutAmount(plan.priceKES, currency.code);
      setPendingUpgrade({ planId: selectedPlan, amount: priceInCurrency, currency: currency.code });
      setShowIsaPay(true);
    } catch (error) {
      toast({ title: 'Error', description: 'An error occurred during payment processing', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    try {
      const result = await SubscriptionService.cancelSubscription(userId);
      if (result.success) {
        toast({ title: 'Subscription Cancelled', description: 'Your subscription has been cancelled' });
        loadSubscription();
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to cancel subscription', variant: 'destructive' });
    }
  };

  const getCurrentPlan = () => {
    if (!currentSubscription) return plans.find(p => p.id === 'free');
    return plans.find(p => p.type === currentSubscription.plan_type && p.billingCycle === currentSubscription.billing_cycle);
  };

  const getDaysUntilExpiry = () => {
    if (!currentSubscription) return 0;
    return SubscriptionService.getDaysUntilExpiry(currentSubscription);
  };

  const isExpired = () => {
    if (!currentSubscription) return false;
    return SubscriptionService.isSubscriptionExpired(currentSubscription);
  };

  const formatSubscriptionPrice = (priceInKES: number) => {
    return formatPrice(priceInKES);
  };

  const currentPlan = getCurrentPlan();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-orange-500" />
              Subscription Management
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Plan</span>
                  {currentSubscription && (
                    <Badge variant={isExpired() ? 'destructive' : 'default'}>
                      {isExpired() ? 'Expired' : 'Active'}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentPlan ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{currentPlan.name}</h3>
                        <p className="text-gray-600">{currentPlan.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">
                          {formatSubscriptionPrice(currentPlan.priceKES)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {currentPlan.billingCycle === 'monthly' ? 'per month' : 
                           currentPlan.billingCycle === 'yearly' ? 'per year' : 'per week'}
                        </div>
                      </div>
                    </div>

                    {currentSubscription && !isExpired() && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-700">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">Expires in {getDaysUntilExpiry()} days</span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                          {new Date(currentSubscription.expires_at!).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {isExpired() && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-medium">Subscription expired</span>
                        </div>
                        <p className="text-sm text-red-600 mt-1">
                          Renew your subscription to continue enjoying premium features
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h4 className="font-medium">Features:</h4>
                      <ul className="space-y-1">
                        {currentPlan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No active subscription found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Plans */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  Available Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {plans.filter(plan => plan.id !== 'free').map((plan) => (
                    <Card key={plan.id} className="relative">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                          <div className="text-2xl font-bold text-orange-600 mb-2">
                            {formatSubscriptionPrice(plan.priceKES)}
                          </div>
                          <div className="text-sm text-gray-500 mb-4">
                            {plan.billingCycle === 'monthly' ? 'per month' : 
                             plan.billingCycle === 'yearly' ? 'per year' : 'per week'}
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                          
                          <div className="space-y-2 mb-4">
                            {plan.features.slice(0, 3).map((feature, index) => (
                              <div key={index} className="flex items-center gap-2 text-xs">
                                <Star className="w-3 h-3 text-orange-500" />
                                {feature}
                              </div>
                            ))}
                            {plan.features.length > 3 && (
                              <div className="text-xs text-gray-500">
                                +{plan.features.length - 3} more features
                              </div>
                            )}
                          </div>

                          <Button 
                            onClick={() => handleUpgrade(plan.id)}
                            className="w-full"
                            variant={plan.id === 'premium_monthly' ? 'default' : 'outline'}
                          >
                            {currentSubscription?.plan_type === 'premium' ? 'Change Plan' : 'Upgrade'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subscription Actions */}
            {currentSubscription && (
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    {currentSubscription.auto_renew ? (
                      <Button variant="outline" onClick={handleCancelSubscription}>
                        Cancel Auto-Renewal
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => SubscriptionService.renewSubscription(userId)}>
                        Enable Auto-Renewal
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade Subscription</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedPlan && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800">
                  {SubscriptionService.getPlan(selectedPlan)?.name}
                </h3>
                <p className="text-orange-700">
                  {formatSubscriptionPrice(SubscriptionService.getPlan(selectedPlan)?.priceKES || 0)}
                </p>
              </div>
            )}



            {/* Payment handled via ISA Pay */}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowUpgradeDialog(false)} className="flex-1">
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

      {showIsaPay && pendingUpgrade && (
        <PesapalPayModal
          open={showIsaPay}
          onOpenChange={setShowIsaPay}
          userId={userId}
          amount={pendingUpgrade.amount}
          currency={pendingUpgrade.currency}
          orderId={`sub_${pendingUpgrade.planId}`}
          description={`Upgrade to ${SubscriptionService.getPlan(pendingUpgrade.planId)?.name}`}
          onSuccess={async () => {
            const paymentMethodData: PaymentMethod = { type: 'card', details: {} };
            const res = await SubscriptionService.createSubscription(userId, pendingUpgrade.planId, paymentMethodData);
            if (res.success) {
              toast({ title: 'Success!', description: 'Your subscription has been upgraded successfully!' });
              setShowUpgradeDialog(false);
              setShowIsaPay(false);
              setPendingUpgrade(null);
              loadSubscription();
            } else {
              toast({ title: 'Error', description: res.message, variant: 'destructive' });
            }
          }}
        />
      )}
    </>
  );
};

export default SubscriptionManager;


