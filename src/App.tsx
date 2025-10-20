import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ConfettiProvider } from "@/contexts/ConfettiContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MyOrdersPage from "./pages/MyOrders";
import AuthWrapper from "./components/AuthProvider";
import { useAuth } from "./hooks/useAuth";
import ProductDetail from "./components/ProductDetail";
import CustomerPremium from "./components/CustomerPremium";
import VendorSubscription from "./components/VendorSubscription";
import AdminBlockedScreen from "./components/AdminBlockedScreen";
import SupportCenter from "./components/SupportCenter";
import SplashScreen from "./components/SplashScreen";
import React, { useEffect } from "react";
import { initMixpanel } from "./lib/mixpanel";
import { pushNotificationService } from "./services/pushNotificationService";
import { mobileCacheService } from "./services/mobileCacheService";
import { supabase } from "@/integrations/supabase/client";
import LogoPreloader from "./components/LogoPreloader";
import SharedContent from "./pages/SharedContent";

const queryClient = new QueryClient();

interface AppContentProps {
  splashDestination?: 'walkthrough' | 'dashboard' | null;
}

const AppContent = ({ splashDestination }: AppContentProps) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkIfAdmin = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }
      
      try {
        // Check if user is admin type in profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type, role')
          .eq('id', user.id)
          .maybeSingle();
        
        // Check if user has admin role in user_roles
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        const hasAdminProfile = profile?.user_type === 'admin' || profile?.role === 'admin';
        const hasAdminRole = !!userRole;
        
        setIsAdmin(hasAdminProfile || hasAdminRole);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkIfAdmin();
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      // Initialize push notifications when user is authenticated
      pushNotificationService.initialize(user.id);
    } else {
      // Remove token when user logs out
      pushNotificationService.removeToken();
    }
  }, [user?.id]);

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-orange-500 flex items-center justify-center p-4">
        <LogoPreloader message="MyPlug is loading..." size="lg" />
      </div>
    );
  }

  // Block admin access - show error screen
  if (isAdmin) {
    return <AdminBlockedScreen />;
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Routes>
        <Route path="/" element={<Index splashDestination={splashDestination} />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/premium" element={<CustomerPremium />} />
        <Route path="/vendor-subscription" element={<VendorSubscription />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/support" element={<SupportCenter />} />
        <Route path="/shared/:shareCode" element={<SharedContent />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashDestination, setSplashDestination] = useState<'walkthrough' | 'dashboard' | null>(null);

  useEffect(() => {
    initMixpanel();
    
    // Initialize mobile cache service
    const initializeCache = async () => {
      try {
        await mobileCacheService.initialize({
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          maxSize: 50 * 1024 * 1024 // 50MB
        });
        console.log('Mobile cache service initialized');
      } catch (error) {
        console.error('Failed to initialize mobile cache:', error);
      }
    };
    
    initializeCache();
  }, []);

  const handleSplashComplete = (destination: 'walkthrough' | 'dashboard') => {
    setSplashDestination(destination);
    setShowSplash(false);
  };

  if (showSplash) {
    // Get user name from localStorage if available
    const userName = localStorage.getItem('user_name') || localStorage.getItem('user_email') || 'there';
    return <SplashScreen onComplete={handleSplashComplete} userName={userName} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        <ConfettiProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <AuthWrapper>
                <AppContent splashDestination={splashDestination} />
              </AuthWrapper>
            </BrowserRouter>
          </TooltipProvider>
        </ConfettiProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
