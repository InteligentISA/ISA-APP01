import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './admin/AdminSidebar';
import AdminHome from './admin/sections/AdminHome';
import AdminUsers from './admin/sections/AdminUsers';
import AdminVendors from './admin/sections/AdminVendors';
import AdminOrders from './admin/sections/AdminOrders';
import AdminProducts from './admin/sections/AdminProducts';
import AdminPayments from './admin/sections/AdminPayments';
import AdminWallet from './admin/sections/AdminWallet';

interface AdminDashboardProps {
  user?: any;
  onLogout?: () => void;
}

const AdminDashboard = ({ user: propUser, onLogout: propOnLogout }: AdminDashboardProps) => {
  const { user: authUser, loading, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();

  // Use prop user if provided, otherwise use auth user
  const user = propUser || authUser;
  
  const handleLogout = async () => {
    if (propOnLogout) {
      propOnLogout();
    } else {
      await signOut();
      navigate('/');
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return <AdminHome />;
      case "users":
        return <AdminUsers />;
      case "vendors":
        return <AdminVendors />;
      case "orders":
        return <AdminOrders />;
      case "products":
        return <AdminProducts />;
      case "payments":
        return <AdminPayments />;
      case "wallet":
        return <AdminWallet />;
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

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
        userName={user.email?.split('@')[0] || 'Admin'}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 