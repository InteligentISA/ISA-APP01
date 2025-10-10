import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminSidebar from './admin/AdminSidebar';
import AdminHome from './admin/sections/AdminHome';
import AdminUsers from './admin/sections/AdminUsers';
import AdminVendors from './admin/sections/AdminVendors';
import AdminOrders from './admin/sections/AdminOrders';
import AdminProducts from './admin/sections/AdminProducts';
import AdminPayments from './admin/sections/AdminPayments';
import AdminWallet from './admin/sections/AdminWallet';
import AdminNotifications from './admin/sections/AdminNotifications';
import AdminReturns from './admin/sections/AdminReturns';
import AdminManagement from './admin/sections/AdminManagement';
import AdminPasswordReset from './admin/sections/AdminPasswordReset';
import VendorGuidelines from './admin/sections/VendorGuidelines';
import AdminSuspendedScreen from './admin/AdminSuspendedScreen';

interface AdminDashboardProps {
  user?: any;
  onLogout?: () => void;
  adminRole?: string;
}

const AdminDashboard = ({ user: propUser, onLogout: propOnLogout, adminRole }: AdminDashboardProps) => {
  const { user: authUser, loading, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState("home");
  const [isSuspended, setIsSuspended] = useState(false);
  const [mustResetPassword, setMustResetPassword] = useState(false);
  const navigate = useNavigate();

  // Use prop user if provided, otherwise use auth user
  const user = propUser || authUser;

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('admin_roles')
        .select('is_suspended, must_reset_password')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setIsSuspended(data.is_suspended || false);
        setMustResetPassword(data.must_reset_password || false);
      }
    };

    checkAdminStatus();
  }, [user?.id]);
  
  const handleLogout = async () => {
    if (propOnLogout) {
      propOnLogout();
    } else {
      await signOut();
      navigate('/');
    }
  };

  const renderContent = () => {
    if (mustResetPassword) {
      return <AdminPasswordReset />;
    }

    switch (activeSection) {
      case "home":
        return <AdminHome />;
      case "users":
        return adminRole === 'main_admin' || adminRole === 'customer_service' ? <AdminUsers /> : <div className="p-8 text-center">Access Denied</div>;
      case "vendors":
        return adminRole === 'main_admin' || adminRole === 'vendor_admin' || adminRole === 'customer_service' ? <AdminVendors /> : <div className="p-8 text-center">Access Denied</div>;
      case "orders":
        return adminRole === 'main_admin' || adminRole === 'order_admin' ? <AdminOrders /> : <div className="p-8 text-center">Access Denied</div>;
      case "products":
        return adminRole === 'main_admin' || adminRole === 'vendor_admin' || adminRole === 'order_admin' ? <AdminProducts /> : <div className="p-8 text-center">Access Denied</div>;
      case "returns":
        return <AdminReturns />;
      case "payments":
        return adminRole === 'main_admin' ? <AdminPayments /> : <div className="p-8 text-center">Access Denied - Main Admin Only</div>;
      case "wallet":
        return adminRole === 'main_admin' ? <AdminWallet /> : <div className="p-8 text-center">Access Denied - Main Admin Only</div>;
      case "notifications":
        return <AdminNotifications />;
      case "admin-management":
        return adminRole === 'main_admin' ? <AdminManagement /> : <div className="p-8 text-center">Access Denied - Main Admin Only</div>;
      case "password-reset":
        return <AdminPasswordReset />;
      case "vendor-guidelines":
        return adminRole === 'main_admin' || adminRole === 'vendor_admin' ? <VendorGuidelines /> : <div className="p-8 text-center">Access Denied</div>;
      default:
        return <AdminHome />;
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (isSuspended) {
    return <AdminSuspendedScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
        userName={user.email?.split('@')[0] || 'Admin'}
        adminRole={adminRole}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8 pt-16 lg:pt-4">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 