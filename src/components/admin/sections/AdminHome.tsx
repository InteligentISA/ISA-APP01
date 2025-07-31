import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, ShoppingCart, Package, Star, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminHome = () => {
  const [overview, setOverview] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingPayments: 0
  });
  const [vendorsByPlan, setVendorsByPlan] = useState<any[]>([]);
  const [usersByCounty, setUsersByCounty] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchOverviewData();
    fetchVendorsByPlan();
    fetchUsersByCounty();
  }, []);

  const fetchOverviewData = async () => {
    try {
      // Total users (customers)
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'customer');

      // Total vendors
      const { count: vendorCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'vendor')
        .eq('status', 'approved');

      // Total orders
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Total products
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Total revenue (sum of completed orders)
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'completed');

      const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Pending payments (from withdrawals table)
      const { count: pendingPayments } = await supabase
        .from('withdrawals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setOverview({
        totalUsers: userCount || 0,
        totalVendors: vendorCount || 0,
        totalOrders: orderCount || 0,
        totalProducts: productCount || 0,
        totalRevenue,
        pendingPayments: pendingPayments || 0
      });
    } catch (error) {
      console.error('Error fetching overview data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch overview data",
        variant: "destructive"
      });
    }
  };

  const fetchVendorsByPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('user_type', 'vendor')
        .eq('status', 'approved');

      if (error) throw error;

      const planCounts: Record<string, number> = {
        free: 0,
        premium_weekly: 0,
        premium_monthly: 0,
        premium_yearly: 0,
        pro: 0
      };

      data?.forEach((profile) => {
        let preferences = profile.preferences;
        if (typeof preferences === 'string') {
          try { preferences = JSON.parse(preferences); } catch { preferences = {}; }
        }
        const plan = (preferences && typeof preferences === 'object' && 'plan' in preferences && typeof preferences.plan === 'string') 
          ? preferences.plan 
          : 'free';
        if (planCounts.hasOwnProperty(plan)) {
          planCounts[plan]++;
        } else {
          planCounts.free++;
        }
      });

      const planData = Object.entries(planCounts).map(([plan, count]) => ({
        plan: plan.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count
      }));

      setVendorsByPlan(planData);
    } catch (error) {
      console.error('Error fetching vendors by plan:', error);
    }
  };

  const fetchUsersByCounty = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('location')
        .eq('user_type', 'customer');

      if (error) throw error;

      const countyCounts: Record<string, number> = {};
      data?.forEach((profile) => {
        const county = profile.location || 'Unknown';
        countyCounts[county] = (countyCounts[county] || 0) + 1;
      });

      const countyData = Object.entries(countyCounts)
        .map(([county, count]) => ({ county, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 counties

      setUsersByCounty(countyData);
    } catch (error) {
      console.error('Error fetching users by county:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-600 mt-2">Platform statistics and insights</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{overview.totalUsers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{overview.totalVendors.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{overview.totalOrders.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{overview.totalProducts.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">KSH {overview.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{overview.pendingPayments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendors by Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Vendors by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vendorsByPlan.map((item) => (
                <div key={item.plan} className="flex justify-between items-center">
                  <span className="font-medium text-sm md:text-base">{item.plan}</span>
                  <span className="text-xl md:text-2xl font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Counties by Users */}
        <Card>
          <CardHeader>
            <CardTitle>Top Counties by Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usersByCounty.map((item, index) => (
                <div key={item.county} className="flex justify-between items-center">
                  <span className="font-medium text-sm md:text-base">
                    {index + 1}. {item.county}
                  </span>
                  <span className="text-xl md:text-2xl font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHome; 