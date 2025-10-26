import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, 
  X, 
  MessageCircle, 
  Mail, 
  Smartphone, 
  Bell, 
  Crown,
  CreditCard,
  Calendar,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  SubscriptionTypesService, 
  SubscriptionType, 
  SubscriptionPlan,
  UserActiveSubscription,
  UserPlanSubscription
} from '@/services/subscriptionTypesService';

interface SubscriptionTypesManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<string, any> = {
  'message-circle': MessageCircle,
  'mail': Mail,
  'smartphone': Smartphone,
  'bell': Bell,
};

export const SubscriptionTypesManager = ({ isOpen, onClose }: SubscriptionTypesManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptionTypes, setSubscriptionTypes] = useState<SubscriptionType[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<UserActiveSubscription[]>([]);
  const [currentPlan, setCurrentPlan] = useState<UserPlanSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('types');

  useEffect(() => {
    if (isOpen && user) {
      loadData();
    }
  }, [isOpen, user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [types, plansData] = await Promise.all([
        SubscriptionTypesService.getSubscriptionTypes(),
        SubscriptionTypesService.getSubscriptionPlans(),
        SubscriptionTypesService.getUserActiveSubscriptions(user.id),
        SubscriptionTypesService.getUserPlanSubscription(user.id),
      ]);

      setSubscriptionTypes(types);
      setPlans(plansData);
      
      // Load user-specific data
      const [activeSubs, userPlan] = await Promise.all([
        SubscriptionTypesService.getUserActiveSubscriptions(user.id),
        SubscriptionTypesService.getUserPlanSubscription(user.id),
      ]);
      
      setActiveSubscriptions(activeSubs);
      setCurrentPlan(userPlan);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (typeId: string, isActive: boolean) => {
    if (!user) return;

    setToggling(prev => ({ ...prev, [typeId]: true }));
    
    try {
      await SubscriptionTypesService.toggleSubscriptionType(user.id, typeId, isActive);
      
      // Update local state
      setActiveSubscriptions(prev => {
        if (isActive) {
          // Add subscription if it doesn't exist
          if (!prev.find(s => s.type_id === typeId)) {
            const type = subscriptionTypes.find(t => t.id === typeId);
            if (type) {
              return [...prev, {
                id: Math.random().toString(),
                user_id: user.id,
                type_id: typeId,
                is_active: true,
                activated_at: new Date().toISOString(),
                deactivated_at: null,
                subscription_type: type,
              }];
            }
          }
        } else {
          // Remove subscription
          return prev.map(s => 
            s.type_id === typeId ? { ...s, is_active: false } : s
          );
        }
        return prev;
      });

      toast({
        title: isActive ? 'Subscribed' : 'Unsubscribed',
        description: `Successfully ${isActive ? 'subscribed' : 'unsubscribed'} from this feature.`,
      });
    } catch (error) {
      console.error('Error toggling subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to update subscription',
        variant: 'destructive',
      });
    } finally {
      setToggling(prev => ({ ...prev, [typeId]: false }));
    }
  };

  const isSubscriptionActive = (typeId: string): boolean => {
    return activeSubscriptions.some(s => s.type_id === typeId && s.is_active);
  };

  const getIcon = (iconName: string | null) => {
    if (!iconName) return Bell;
    return iconMap[iconName] || Bell;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-6 w-6" />
            Subscription Management
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="types">My Subscriptions</TabsTrigger>
                <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
              </TabsList>

              <TabsContent value="types" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Active Subscriptions</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Toggle individual features on or off
                    </p>
                  </div>

                  {currentPlan && (
                    <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Current Plan</p>
                          <p className="text-sm text-muted-foreground">
                            {plans.find(p => p.id === currentPlan.plan_id)?.display_name || 'Unknown Plan'}
                            {' • '}
                            {currentPlan.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly'}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {currentPlan.status}
                        </Badge>
                      </div>
                      {currentPlan.expires_at && (
                        <p className="text-sm mt-2 text-muted-foreground">
                          Expires: {new Date(currentPlan.expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid gap-4">
                    {subscriptionTypes.map((type) => {
                      const Icon = getIcon(type.icon_name);
                      const isActive = isSubscriptionActive(type.id);
                      const isLoading = toggling[type.id];

                      return (
                        <Card key={type.id} className="relative">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold">{type.display_name}</h4>
                                    {isActive && (
                                      <Badge variant="default" className="gap-1">
                                        <Check className="h-3 w-3" />
                                        Active
                                      </Badge>
                                    )}
                                  </div>
                                  {type.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {type.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={isActive}
                                  onCheckedChange={(checked) => handleToggle(type.id, checked)}
                                  disabled={isLoading || !currentPlan}
                                />
                                {isLoading && (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {!currentPlan && (
                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm">
                        <strong>No active plan.</strong> Subscribe to a plan to enable features.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="plans" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Available Plans</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose a plan that fits your needs
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {plans.map((plan) => {
                    const isCurrentPlan = currentPlan?.plan_id === plan.id;
                    
                    return (
                      <Card key={plan.id} className="relative">
                        {isCurrentPlan && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="default">
                              <Check className="h-3 w-3 mr-1" />
                              Current
                            </Badge>
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            {plan.display_name}
                            <Crown className="h-5 w-5 text-primary" />
                          </CardTitle>
                          {plan.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {plan.description}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold">
                                ${plan.price_monthly}
                              </span>
                              <span className="text-muted-foreground">/month</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              or ${plan.price_yearly}/year
                            </p>
                          </div>

                          <div className="border-t pt-4">
                            <h4 className="font-semibold mb-2 text-sm">Includes:</h4>
                            <ul className="space-y-2">
                              {subscriptionTypes.map((type) => (
                                <li key={type.id} className="flex items-center gap-2 text-sm">
                                  <Check className="h-4 w-4 text-primary" />
                                  {type.display_name}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <Button 
                            className="w-full" 
                            variant={isCurrentPlan ? 'secondary' : 'default'}
                            disabled={isCurrentPlan}
                          >
                            {isCurrentPlan ? 'Current Plan' : 'Subscribe'}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

