import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ConfettiProvider } from "@/contexts/ConfettiContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MyOrdersPage from "./pages/MyOrders";
import AuthWrapper from "./components/AuthProvider";
import { useAuth } from "./hooks/useAuth";
import AdminDashboard from "./components/AdminDashboard";
import ProductDetail from "./components/ProductDetail";
import CustomerPremium from "./components/CustomerPremium";
import VendorSubscription from "./components/VendorSubscription";
import React, { useEffect } from "react";
import { initMixpanel } from "./lib/mixpanel";
import { pushNotificationService } from "./services/pushNotificationService";
import { mobileCacheService } from "./services/mobileCacheService";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();
  const [adminRole, setAdminRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminRole = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setAdminRole(data.role);
      }
    };

    fetchAdminRole();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/earth" element={<AdminDashboard adminRole="main_admin" />} />
        <Route path="/earth/neptune-aq90yt7" element={<AdminDashboard adminRole="vendor_admin" />} />
        <Route path="/earth/jupiter-er8wb97gh" element={<AdminDashboard adminRole="customer_service" />} />
        <Route path="/earth/mars-kl45mn8rt" element={<AdminDashboard adminRole="order_admin" />} />
        <Route path="/admin" element={<AdminDashboard adminRole={adminRole || undefined} />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/premium" element={<CustomerPremium />} />
        <Route path="/vendor-subscription" element={<VendorSubscription />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/reset-password" element={<div>Password Reset Page</div>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

function App() {
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
                <AppContent />
              </AuthWrapper>
            </BrowserRouter>
          </TooltipProvider>
        </ConfettiProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
