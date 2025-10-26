/**
 * Example usage of the SubscriptionTypesManager component
 * 
 * This demonstrates how to integrate the subscription management system
 * into your pages and routes.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SubscriptionTypesManager } from '@/components/SubscriptionTypesManager';
import { Settings } from 'lucide-react';

export function ExampleSubscriptionUsage() {
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);

  return (
    <div>
      {/* Example button to open subscription manager */}
      <Button 
        onClick={() => setShowSubscriptionManager(true)}
        className="gap-2"
      >
        <Settings className="h-4 w-4" />
        Manage Subscriptions
      </Button>

      {/* The subscription manager component */}
      <SubscriptionTypesManager
        isOpen={showSubscriptionManager}
        onClose={() => setShowSubscriptionManager(false)}
      />
    </div>
  );
}

/**
 * Example: Using the subscription types in your code
 * 
 * To check if a user has a specific subscription type active,
 * you can use the SubscriptionTypesService:
 */

import { SubscriptionTypesService } from '@/services/subscriptionTypesService';
import { useAuth } from '@/hooks/useAuth';

export async function ExampleCheckSubscription() {
  const { user } = useAuth();
  
  if (!user) return;

  // Check if user has WhatsApp notifications enabled
  const hasWhatsApp = await SubscriptionTypesService.hasSubscriptionType(
    user.id, 
    'whatsapp'
  );
  
  // Check if user has Email notifications enabled
  const hasEmail = await SubscriptionTypesService.hasSubscriptionType(
    user.id, 
    'email'
  );

  // Send notification based on subscription type
  if (hasWhatsApp) {
    // Send WhatsApp notification
    console.log('Sending WhatsApp notification');
  }
  
  if (hasEmail) {
    // Send Email notification
    console.log('Sending Email notification');
  }
}

/**
 * Example: Get all user's active subscriptions
 */
export async function ExampleGetActiveSubscriptions() {
  const { user } = useAuth();
  
  if (!user) return;

  const activeSubs = await SubscriptionTypesService.getUserActiveSubscriptions(user.id);
  
  console.log('User has these subscription types active:');
  activeSubs.forEach(sub => {
    console.log(`- ${sub.subscription_type?.display_name}: ${sub.is_active}`);
  });
}

/**
 * Example: Toggle a subscription type programmatically
 */
export async function ExampleToggleSubscription() {
  const { user } = useAuth();
  
  if (!user) return;

  // Get all available subscription types
  const types = await SubscriptionTypesService.getSubscriptionTypes();
  
  // Find the Email type
  const emailType = types.find(t => t.name === 'email');
  
  if (emailType) {
    // Toggle Email subscription on
    await SubscriptionTypesService.toggleSubscriptionType(
      user.id,
      emailType.id,
      true
    );
  }
}

/**
 * Example: Get user's current plan
 */
export async function ExampleGetUserPlan() {
  const { user } = useAuth();
  
  if (!user) return null;

  const planSubscription = await SubscriptionTypesService.getUserPlanSubscription(user.id);
  
  if (planSubscription) {
    console.log(`User is on plan: ${planSubscription.plan_id}`);
    console.log(`Billing cycle: ${planSubscription.billing_cycle}`);
    console.log(`Status: ${planSubscription.status}`);
    console.log(`Expires: ${planSubscription.expires_at}`);
  }
  
  return planSubscription;
}

