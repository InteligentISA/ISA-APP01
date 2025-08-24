import { useEffect, useState } from "react";
import { AlertTriangle, Menu, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import VendorSidebar from "./VendorSidebar";
import VendorHome from "./VendorHome";
import VendorProductManagement from "./VendorProductManagement";
import VendorOrders from "./VendorOrders";
import VendorReviews from "./VendorReviews";
import VendorPayments from "./VendorPayments";
import VendorWallet from "./VendorWallet";
import VendorSettings from "./VendorSettings";
import VendorSubscription from "./VendorSubscription";
import { CommissionService } from "@/services/commissionService";
import { LoyaltyService } from "@/services/loyaltyService";

interface VendorDashboardProps {
  user: any;
  onLogout: () => void;
}

const VendorDashboard = ({ user, onLogout }: VendorDashboardProps) => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("home");
  const [plan, setPlan] = useState('freemium');
  const [planExpiry, setPlanExpiry] = useState<string | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFromBanner, setUpgradeFromBanner] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [subscriptionBenefits, setSubscriptionBenefits] = useState<any>(null);
  const [vendorSubscriptionEnabled, setVendorSubscriptionEnabled] = useState(false);

  const PLAN_LIMITS: Record<string, number> = {
    freemium: 5,
    premium_weekly: 20,
    premium_monthly: 20,
    premium_yearly: 20,
    pro: Infinity
  };

  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  useEffect(() => {
    fetchPlanAndProducts();
    checkVendorSubscriptionStatus();
  }, [user.id]);

  const fetchPlanAndProducts = async () => {
    try {
      // Fetch subscription from vendor_subscriptions table
      const subscription = await CommissionService.getVendorSubscription(user.id);
      
      if (subscription) {
        setPlan((subscription as any).plan_type);
        setPlanExpiry((subscription as any).expires_at);
      } else {
        // Fallback to profiles.preferences if no subscription found
        const { data: profile } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .single();
        
        let preferences = profile?.preferences;
        if (typeof preferences === 'string') {
          try { preferences = JSON.parse(preferences); } catch { preferences = {}; }
        }
        
        const planValue = (preferences && typeof preferences === 'object' && 'plan' in preferences && typeof preferences.plan === 'string')
          ? preferences.plan
          : 'freemium';
        const planExpiryValue = (preferences && typeof preferences === 'object' && 'plan_expiry' in preferences && typeof preferences.plan_expiry === 'string')
          ? preferences.plan_expiry
          : null;
        
        setPlan(planValue);
        setPlanExpiry(planExpiryValue);
      }

      // Fetch product count
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('vendor_id', user.id);
      setProductCount(products?.length || 0);

      // Fetch subscription benefits
      const benefits = await CommissionService.getSubscriptionBenefits(user.id);
      setSubscriptionBenefits(benefits);
    } catch (error) {
      console.error('Error fetching plan and products:', error);
    }
  };

  const checkVendorSubscriptionStatus = async () => {
    try {
      const enabled = await LoyaltyService.isVendorSubscriptionEnabled();
      setVendorSubscriptionEnabled(enabled);
    } catch (error) {
      console.error('Error checking vendor subscription status:', error);
      setVendorSubscriptionEnabled(false);
    }
  };

  const handleUpgradeClick = async () => {
    try {
      // Check if vendor subscriptions are enabled
      const enabled = await LoyaltyService.isVendorSubscriptionEnabled();
      
      if (enabled) {
        setActiveSection('subscription');
        setUpgradeFromBanner(true);
        setSidebarOpen(false); // Close sidebar on mobile
      } else {
        toast({
          title: "Upgrade Feature Coming Soon",
          description: "Subscription upgrades will be available soon. Stay tuned!",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      toast({
        title: "Upgrade Feature Coming Soon",
        description: "Subscription upgrades will be available soon. Stay tuned!",
        variant: "default"
      });
    }
  };

  const handleNavigateToSubscription = () => {
    setActiveSection('subscription');
    setSidebarOpen(false); // Close sidebar on mobile
  };

  // Fetch notifications for this vendor
  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    // TODO: Uncomment when notifications table is available in types
    // const { data, error } = await supabase
    //   .from('notifications')
    //   .select('*')
    //   .eq('vendor_id', user.id)
    //   .order('created_at', { ascending: false })
    //   .limit(20);
    // if (!error) setNotifications(data || []);
    setNotificationsLoading(false);
  };

  // Mark all as read
  const markAllNotificationsRead = async () => {
    // TODO: Uncomment when notifications table is available in types
    // await supabase
    //   .from('notifications')
    //   .update({ read: true })
    //   .eq('vendor_id', user.id)
    //   .eq('read', false);
    fetchNotifications();
  };

  const handleShowNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      fetchNotifications();
      markAllNotificationsRead();
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return <VendorHome vendorId={user.id} plan={plan} planExpiry={planExpiry} productCount={productCount} onUpgrade={handleUpgradeClick} />;
      case "products":
        return (
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">All Approved Products</h1>
            <VendorProductManagement user={user} showAllApprovedProducts onNavigateToSubscription={handleNavigateToSubscription} />
          </div>
        );
      case "orders":
        return <VendorOrders vendorId={user.id} />;
      case "store":
        return (
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">My Store</h1>
            <VendorProductManagement user={user} onNavigateToSubscription={handleNavigateToSubscription} />
          </div>
        );
      case "payments":
        return <VendorPayments vendorId={user.id} />;
      case "reviews":
        return <VendorReviews vendorId={user.id} />;
      case "wallet":
        return <VendorWallet vendorId={user.id} />;
      case "subscription":
        return <VendorSubscription />;
      case "settings":
        return <VendorSettings vendorId={user.id} defaultTab="billing" showUpgradeModal={upgradeFromBanner} onCloseUpgradeModal={() => setUpgradeFromBanner(false)} />;
      default:
        return <VendorHome vendorId={user.id} plan={plan} planExpiry={planExpiry} productCount={productCount} onUpgrade={handleUpgradeClick} />;
    }
  };

  // Orange banner
  const productLimit = PLAN_LIMITS[plan] === Infinity ? 'Unlimited' : PLAN_LIMITS[plan];
  const showBanner = plan === 'freemium' || (productCount >= (productLimit as number) && productLimit !== Infinity);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full bg-white z-50 shadow-lg transform transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 lg:static lg:shadow-none",
        sidebarCollapsed ? "lg:w-16" : "lg:w-64",
        "w-64" // Fixed width for mobile sidebar
      )}>
        <VendorSidebar
          activeSection={activeSection}
          onSectionChange={(section) => {
            setActiveSection(section);
            setSidebarOpen(false); // Close sidebar on mobile when section changes
          }}
          onLogout={onLogout}
          userName={user.name}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          isCollapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      </div>
      
      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-y-auto transition-all duration-300",
        "lg:ml-0", // No margin on mobile
        sidebarCollapsed ? "lg:ml-16" : "lg:ml-64" // 64px when collapsed, 256px when expanded
      )}>
        {/* Mobile Topbar */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 p-3 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="h-10 w-10 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Vendor Portal</h2>
              <p className="text-sm text-gray-600">{user.name}</p>
            </div>
          </div>
          <div className="relative">
            <button onClick={handleShowNotifications} className="h-10 w-10 flex items-center justify-center rounded hover:bg-gray-100 transition-colors relative">
              <Bell className="h-5 w-5" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 z-50 w-80 bg-white border rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">Notifications</span>
                  <button className="text-xs text-gray-500 hover:text-gray-900" onClick={() => setShowNotifications(false)}>Close</button>
                </div>
                {notificationsLoading ? (
                  <div className="text-center text-gray-500 py-8">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No notifications</div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {notifications.map((n) => (
                      <li key={n.id} className={`py-2 px-1 ${!n.read ? 'bg-orange-50' : ''}`}>
                        <div className="flex items-center gap-2">
                          {n.type === 'product_approved' && <span className="bg-green-500 text-white rounded px-2 text-xs">Approved</span>}
                          {n.type === 'product_rejected' && <span className="bg-red-500 text-white rounded px-2 text-xs">Rejected</span>}
                          <span className="font-medium text-gray-900">{n.product_name || ''}</span>
                        </div>
                        <div className="text-xs text-gray-700 mt-1">{n.message}</div>
                        <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile top padding to account for fixed header */}
        <div className="lg:hidden h-16" />
        
        <div className="p-4 md:p-6 lg:p-8">
                     {showBanner && (
             <div className="mb-4 md:mb-6 bg-orange-100 border-l-4 border-orange-500 p-3 md:p-4 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
               <div className="flex items-center gap-2 md:gap-3">
                 <AlertTriangle className="text-orange-500 w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                 {vendorSubscriptionEnabled ? (
                   <span className="font-semibold text-orange-800 text-sm md:text-base">
                     {plan === 'freemium' && `You are on the Freemium Plan: `}
                     {plan.startsWith('premium') && `You are on the Premium Plan: `}
                     {plan === 'pro' && `You are on the Pro Plan: `}
                     {productCount}/{productLimit} products uploaded
                     {subscriptionBenefits && (
                       <span className="ml-2 text-xs text-orange-700">
                         (Commission: {subscriptionBenefits.commission_rate})
                       </span>
                     )}
                     {planExpiry && plan !== 'freemium' && (
                       <span className="ml-2 text-xs text-orange-700">(Expires: {new Date(planExpiry).toLocaleDateString()})</span>
                     )}
                   </span>
                 ) : (
                   <span className="font-semibold text-orange-800 text-sm md:text-base">
                     Stay tuned, premium plans coming soon with more exciting new features!
                   </span>
                 )}
               </div>
               <button
                 className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-3 py-2 md:px-4 md:py-2 rounded shadow text-sm md:text-base whitespace-nowrap"
                 onClick={handleUpgradeClick}
               >
                 {vendorSubscriptionEnabled ? 'Upgrade Now' : 'Upgrade Feature Coming Soon'}
               </button>
             </div>
           )}
          {renderContent()}
          {/* Upgrade Modal Placeholder */}
          {showUpgrade && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
              <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Upgrade Your Plan</h3>
                <p className="mb-4 text-sm md:text-base">To upload more products and enjoy lower commissions, upgrade your plan in the Settings &gt; Billing section.</p>
                <button
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded shadow w-full"
                  onClick={() => setShowUpgrade(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;
