import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminWallet = () => {
  const [walletData, setWalletData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'vendor')
        .eq('status', 'approved');

      if (error) throw error;
      setWalletData(data || []);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch wallet data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(first_name, last_name, email),
          products(name, vendor_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      currencyDisplay: 'symbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price).replace('KSh', 'Ksh');
  };

  const calculateVendorEarnings = (vendorId: string) => {
    const vendorOrders = transactions.filter(t => 
      t.products?.vendor_id === vendorId && t.payment_status === 'completed'
    );
    return vendorOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  };

  const calculatePlatformRevenue = () => {
    const completedOrders = transactions.filter(t => t.payment_status === 'completed');
    return completedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  };

  const calculatePlatformCommission = () => {
    // Assuming 10% platform commission
    return calculatePlatformRevenue() * 0.1;
  };

  const filteredTransactions = selectedPeriod === "all" 
    ? transactions 
    : transactions.filter(transaction => {
        const transactionDate = new Date(transaction.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - transactionDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (selectedPeriod) {
          case "today":
            return diffDays === 0;
          case "week":
            return diffDays <= 7;
          case "month":
            return diffDays <= 30;
          default:
            return true;
        }
      });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading wallet data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Platform Wallet</h1>
        <p className="text-gray-600 mt-2">Financial overview and vendor earnings</p>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(calculatePlatformRevenue())}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(calculatePlatformCommission())}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendor Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(calculatePlatformRevenue() - calculatePlatformCommission())}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {walletData.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Earnings */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {walletData.map((vendor) => {
                const earnings = calculateVendorEarnings(vendor.id);
                const commissionRate = 0.1; // 10% platform commission
                const vendorEarnings = earnings * (1 - commissionRate);
                
                return (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">
                      {vendor.first_name && vendor.last_name 
                        ? `${vendor.first_name} ${vendor.last_name}`
                        : vendor.email?.split('@')[0] || 'N/A'
                      }
                    </TableCell>
                    <TableCell>{vendor.business_name || 'N/A'}</TableCell>
                    <TableCell>{formatPrice(earnings)}</TableCell>
                    <TableCell>
                      <span className="text-green-600 font-semibold">
                        {formatPrice(vendorEarnings)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{(commissionRate * 100).toFixed(0)}%</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={vendor.status === 'approved' ? 'default' : 'secondary'}>
                        {vendor.status || 'approved'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {walletData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No vendor data found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.slice(0, 20).map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    #{transaction.id.slice(-8)}
                  </TableCell>
                  <TableCell>
                    {transaction.profiles?.first_name && transaction.profiles?.last_name 
                      ? `${transaction.profiles.first_name} ${transaction.profiles.last_name}`
                      : transaction.profiles?.email?.split('@')[0] || 'N/A'
                    }
                  </TableCell>
                  <TableCell>{transaction.products?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {formatPrice(transaction.total_amount || 0)}
                  </TableCell>
                  <TableCell>
                    {walletData.find(v => v.id === transaction.products?.vendor_id)?.business_name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        transaction.payment_status === 'completed' ? 'default' : 
                        transaction.payment_status === 'pending' ? 'secondary' : 
                        transaction.payment_status === 'failed' ? 'destructive' : 'outline'
                      }
                    >
                      {transaction.payment_status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {transaction.created_at 
                      ? new Date(transaction.created_at).toLocaleDateString() 
                      : 'N/A'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {selectedPeriod === "all" 
                ? "No transactions found" 
                : `No transactions in the selected period`
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWallet; 