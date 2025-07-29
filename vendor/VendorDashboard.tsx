
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import VendorSidebar from "./VendorSidebar";
import VendorHome from "./sections/VendorHome";
import VendorProductManagement from "./VendorProductManagement";
import VendorOrders from "./sections/VendorOrders";
import VendorReviews from "./sections/VendorReviews";
import VendorPayments from "./sections/VendorPayments";
import VendorWallet from "./sections/VendorWallet";
import VendorSettings from "./sections/VendorSettings";

interface VendorDashboardProps {
  user: any;
  onLogout: () => void;
}

const VendorDashboard = ({ user, onLogout }: VendorDashboardProps) => {
  const [activeSection, setActiveSection] = useState("home");
  const [plan, setPlan] = useState('free');
  const [planExpiry, setPlanExpiry] = useState<string | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFromBanner, setUpgradeFromBanner] = useState(false);

  const PLAN_LIMITS: Record<string, number> = {
    free: 5,
    premium_weekly: 20,
    premium_monthly: 20,
    premium_yearly: 20,
    pro: Infinity
  };

  useEffect(() => {
    fetchPlanAndProducts();
  }, [user.id]);

  const fetchPlanAndProducts = async () => {
    // Fetch plan from profiles.preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .single();
    let preferences = profile?.preferences;
    if (typeof preferences === 'string') {
      try { preferences = JSON.parse(preferences); } catch { preferences = {}; }
    }
    // Safely extract plan and plan_expiry from preferences if it's an object
    const planValue = (preferences && typeof preferences === 'object' && 'plan' in preferences && typeof preferences.plan === 'string')
      ? preferences.plan
      : 'free';
    const planExpiryValue = (preferences && typeof preferences === 'object' && 'plan_expiry' in preferences && typeof preferences.plan_expiry === 'string')
      ? preferences.plan_expiry
      : null;
    setPlan(planValue);
    setPlanExpiry(planExpiryValue);
    // Fetch product count
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('vendor_id', user.id);
    setProductCount(products?.length || 0);
  };

  const handleUpgradeClick = () => {
    setActiveSection('settings');
    setUpgradeFromBanner(true);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return <VendorHome vendorId={user.id} plan={plan} planExpiry={planExpiry} productCount={productCount} onUpgrade={handleUpgradeClick} />;
      case "products":
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Products</h1>
            <VendorProductManagement user={user} />
          </div>
        );
      case "orders":
        return <VendorOrders vendorId={user.id} />;
      case "store":
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Store</h1>
            <VendorProductManagement user={user} />
          </div>
        );
      case "payments":
        return <VendorPayments vendorId={user.id} />;
      case "reviews":
        return <VendorReviews vendorId={user.id} />;
      case "wallet":
        return <VendorWallet vendorId={user.id} />;
      case "settings":
        return <VendorSettings vendorId={user.id} defaultTab="billing" showUpgradeModal={upgradeFromBanner} onCloseUpgradeModal={() => setUpgradeFromBanner(false)} />;
      default:
        return <VendorHome vendorId={user.id} plan={plan} planExpiry={planExpiry} productCount={productCount} onUpgrade={handleUpgradeClick} />;
    }
  };

  // Orange banner
  const productLimit = PLAN_LIMITS[plan] === Infinity ? 'Unlimited' : PLAN_LIMITS[plan];
  const showBanner = plan === 'free' || plan === 'premium_weekly' || plan === 'premium_monthly' || plan === 'premium_yearly';

  return (
    <div className="flex h-screen bg-gray-50">
      <VendorSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={onLogout}
        userName={user.name}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {showBanner && (
            <div className="mb-6 bg-orange-100 border-l-4 border-orange-500 p-4 rounded flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-orange-500 w-6 h-6" />
                <span className="font-semibold text-orange-800">
                  {plan === 'free' && `You are on the Free Plan: `}
                  {plan.startsWith('premium') && `You are on the Premium Plan: `}
                  {productCount}/{productLimit} products uploaded
                  {planExpiry && plan !== 'free' && (
                    <span className="ml-2 text-xs text-orange-700">(Expires: {new Date(planExpiry).toLocaleDateString()})</span>
                  )}
                </span>
              </div>
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded shadow"
                onClick={handleUpgradeClick}
              >
                Upgrade
              </button>
            </div>
          )}
          {renderContent()}
          {/* Upgrade Modal Placeholder */}
          {showUpgrade && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Upgrade Your Plan</h3>
                <p className="mb-4">To upload more products and enjoy lower commissions, upgrade your plan in the Settings &gt; Billing section.</p>
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
