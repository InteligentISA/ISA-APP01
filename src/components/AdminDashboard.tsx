import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import VendorApplicationsSection from './VendorApplicationsSection';
import PaymentSection from './PaymentSection';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [settingAdmin, setSettingAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user) {
      fetchUserRole();
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading && user && role && role !== 'admin') {
      navigate('/');
    }
  }, [user, loading, role, navigate]);

  const fetchUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        // If the role column doesn't exist, we'll handle it gracefully
        if (error.message.includes("column 'role' does not exist")) {
          toast({
            title: "Database Setup Required",
            description: "The admin system needs to be set up. Please run the database migrations.",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }
      
      if (data) {
        setRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user role. Please try again.",
        variant: "destructive"
      });
    }
  };

  const setAsAdmin = async () => {
    if (!user) return;
    
    setSettingAdmin(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "You are now an admin!"
      });

      setRole('admin');
    } catch (error) {
      console.error('Error setting admin role:', error);
      toast({
        title: "Error",
        description: "Failed to set admin role",
        variant: "destructive"
      });
    } finally {
      setSettingAdmin(false);
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Remove the set as admin UI and logic. Only allow access if role is 'admin'.
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You do not have admin privileges.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have admin privileges.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vendor Applications */}
          <VendorApplicationsSection />

          {/* Sales Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {/* TODO: Show total sales, filter by product/country */}
              <div>Sales analytics section</div>
            </CardContent>
          </Card>

          {/* Best Sellers */}
          <Card>
            <CardHeader>
              <CardTitle>Best Sellers by Country</CardTitle>
            </CardHeader>
            <CardContent>
              {/* TODO: Filter by country, show best selling products */}
              <div>Best sellers section</div>
            </CardContent>
          </Card>

          {/* Vendor Sales & Commissions */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Sales & Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              {/* TODO: List vendors, show sales, commissions */}
              <div>Vendor sales and commissions section</div>
            </CardContent>
          </Card>

          {/* Payment Management */}
          <PaymentSection />

          {/* Add Product */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Add Product</CardTitle>
            </CardHeader>
            <CardContent>
              {/* TODO: Admin add product form */}
              <div>Add product section</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 