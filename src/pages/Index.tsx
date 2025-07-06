
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Welcome from '@/components/Welcome';
import Dashboard from '@/components/Dashboard';
import AdminDashboard from '@/components/AdminDashboard';
import VendorDashboard from '@/components/VendorDashboard';
import Preloader from '@/components/Preloader';
import { toast } from "sonner";

const Index = () => {
  const { user, loading } = useAuth();
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showPreloader) {
    return <Preloader />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Welcome />;
  }

  // Render different dashboards based on user role
  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard user={user} />;
      case 'vendor':
        return <VendorDashboard user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderDashboard()}
    </div>
  );
};

export default Index;
