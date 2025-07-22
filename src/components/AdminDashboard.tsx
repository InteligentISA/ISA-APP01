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
  const { user, loading, signOut } = useAuth();
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

  // SECURITY: Admin role assignment removed - use proper role management system
  // const setAsAdmin functionality has been removed for security
  // Admins must be assigned through database-level role management

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button 
              onClick={async () => {
                try {
                  console.log('Checking database for vendor applications...');
                  
                  // Check current user
                  const { data: { user: currentUser } } = await supabase.auth.getUser();
                  console.log('Current user:', currentUser);
                  
                  // Check current user's profile
                  const { data: currentUserProfile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', currentUser?.id)
                    .single();
                  
                  if (profileError) {
                    console.error('Current user profile error:', profileError);
                  } else {
                    console.log('Current user profile:', currentUserProfile);
                  }
                  
                  // Check all profiles
                  const { data: allProfiles, error: allError } = await supabase
                    .from('profiles')
                    .select('*');
                  
                  if (allError) {
                    console.error('All profiles error:', allError);
                  } else {
                    console.log('All profiles:', allProfiles);
                  }
                  
                  // Check vendor profiles specifically
                  const { data: vendorProfiles, error: vendorError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_type', 'vendor');
                  
                  if (vendorError) {
                    console.error('Vendor profiles error:', vendorError);
                  } else {
                    console.log('Vendor profiles:', vendorProfiles);
                  }
                  
                  // Check pending vendor profiles
                  const { data: pendingVendors, error: pendingError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_type', 'vendor')
                    .eq('status', 'pending');
                  
                  if (pendingError) {
                    console.error('Pending vendors error:', pendingError);
                  } else {
                    console.log('Pending vendors:', pendingVendors);
                  }
                  
                  toast({
                    title: "Database Check Complete",
                    description: `User: ${currentUserProfile?.role || 'unknown'}, All: ${allProfiles?.length || 0}, Vendors: ${vendorProfiles?.length || 0}, Pending: ${pendingVendors?.length || 0}`,
                  });
                } catch (error) {
                  console.error('Error checking database:', error);
                }
              }}
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
            >
              Check DB
            </Button>
            <Button 
              onClick={async () => {
                await signOut();
                navigate('/');
              }}
              variant="outline"
              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
            >
              Log Out
            </Button>
          </div>
        </div>
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