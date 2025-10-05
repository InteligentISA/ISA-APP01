import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Package, ShoppingCart, TrendingUp, Star, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VendorHomeProps {
  vendorId: string;
  plan?: string;
  planExpiry?: string | null;
  productCount?: number;
  onUpgrade?: () => void;
}

type TimeFilter = 'today' | 'week' | 'month' | 'all';

const VendorHome = ({ vendorId }: VendorHomeProps) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingOrders: 0,
    productsSold: 0,
    productClicks: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [vendorId, timeFilter]);

  const getDateFilter = () => {
    const now = new Date();
    switch (timeFilter) {
      case 'today':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return today.toISOString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return weekAgo.toISOString();
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return monthAgo.toISOString();
      default:
        return null;
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const dateFilter = getDateFilter();

      // Fetch vendor products
      const { data: products } = await supabase
        .from('products')
        .select('id, rating, review_count')
        .eq('vendor_id', vendorId);

      // Build orders query with date filter
      let ordersQuery = supabase
        .from('order_items')
        .select(`
          quantity,
          total_price,
          product_id,
          order_id,
          orders!inner (
            id,
            status,
            created_at,
            total_amount
          )
        `)
        .eq('vendor_id', vendorId);

      if (dateFilter) {
        ordersQuery = ordersQuery.gte('orders.created_at', dateFilter);
      }

      const { data: orderItems } = await ordersQuery;

      // Calculate total sales
      const totalSales = orderItems?.reduce((sum, item) => {
        return sum + (Number(item.total_price) || 0);
      }, 0) || 0;

      // Count pending orders
      const uniqueOrders = new Map();
      orderItems?.forEach(item => {
        const order = item.orders as any;
        if (!uniqueOrders.has(order.id)) {
          uniqueOrders.set(order.id, order);
        }
      });
      const pendingOrders = Array.from(uniqueOrders.values()).filter(
        (order: any) => order.status === 'pending'
      ).length;

      // Count products sold
      const productsSold = orderItems?.reduce((sum, item) => {
        return sum + (item.quantity || 0);
      }, 0) || 0;

      // Calculate average rating
      const productsWithRatings = products?.filter(p => p.rating && p.rating > 0) || [];
      const avgRating = productsWithRatings.length > 0
        ? productsWithRatings.reduce((sum, p) => sum + (p.rating || 0), 0) / productsWithRatings.length
        : 0;

      // Product clicks (mock data - would need tracking table in real app)
      const productClicks = products?.length ? products.length * 150 : 0;

      setStats({
        totalSales,
        pendingOrders,
        productsSold,
        productClicks,
        avgRating,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('KSh', 'Ksh');
  };

  const statCards = [
    {
      title: "Total Sales",
      value: formatCurrency(stats.totalSales),
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      iconColor: "text-green-600 dark:text-green-400"
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders.toString(),
      icon: ShoppingCart,
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      iconColor: "text-orange-600 dark:text-orange-400"
    },
    {
      title: "Products Sold",
      value: stats.productsSold.toString(),
      icon: Package,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Product Clicks",
      value: stats.productClicks.toLocaleString(),
      icon: Eye,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    {
      title: "Average Rating",
      value: stats.avgRating.toFixed(1),
      icon: Star,
      color: "from-yellow-500 to-amber-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
      iconColor: "text-yellow-600 dark:text-yellow-400"
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Track your business performance</p>
        </div>

        <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
          <TabsList className="grid w-full sm:w-auto grid-cols-4 gap-1">
            <TabsTrigger value="today" className="text-xs sm:text-sm">Today</TabsTrigger>
            <TabsTrigger value="week" className="text-xs sm:text-sm">Week</TabsTrigger>
            <TabsTrigger value="month" className="text-xs sm:text-sm">Month</TabsTrigger>
            <TabsTrigger value="all" className="text-xs sm:text-sm">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">
                      {stat.title}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground truncate">
                      {loading ? '...' : stat.value}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className={`mt-3 h-1 bg-gradient-to-r ${stat.color} rounded-full`} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Sales Trend</span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +15.3%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Order Fulfillment</span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">94.8%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Customer Rating</span>
                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                  {stats.avgRating.toFixed(1)}/5.0
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  Add new products to increase sales
                </p>
              </div>
              <div className={`p-3 ${stats.pendingOrders > 0 ? 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800' : 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'} border rounded-lg`}>
                <p className={`text-sm ${stats.pendingOrders > 0 ? 'text-orange-900 dark:text-orange-100' : 'text-green-900 dark:text-green-100'}`}>
                  {stats.pendingOrders > 0
                    ? `${stats.pendingOrders} pending order${stats.pendingOrders > 1 ? 's' : ''} to process`
                    : "All orders are up to date!"
                  }
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
                <p className="text-sm text-purple-900 dark:text-purple-100">
                  Check your wallet for available payouts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorHome;
