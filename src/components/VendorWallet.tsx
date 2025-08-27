import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VendorWalletProps {
  vendorId: string;
}

interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'commission';
  amount: number;
  description: string;
  created_at: string;
  status: string;
}

const VendorWallet = ({ vendorId }: VendorWalletProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBalance: 0,
    availableBalance: 0,
    totalEarnings: 0,
    totalWithdrawn: 0,
    thisMonthEarnings: 0,
    lastMonthEarnings: 0,
    pendingWithdrawals: 0
  });

  useEffect(() => {
    if (vendorId) {
      fetchWalletData();
    }
  }, [vendorId]);

  const fetchWalletData = async () => {
    if (!vendorId) {
      console.log('Vendor ID not available, skipping fetchWalletData');
      return;
    }
    
    try {
      // Fetch orders to calculate earnings
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products!inner (vendor_id)
          )
        `)
        .eq('order_items.products.vendor_id', vendorId);

      // Fetch profile for withdrawals
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', vendorId)
        .single();

      let preferences = profile?.preferences;
      if (typeof preferences === 'string') {
        try { preferences = JSON.parse(preferences); } catch { preferences = {}; }
      }

      const vendorWithdrawals = preferences?.withdrawals || [];
      const completedWithdrawals = vendorWithdrawals.filter((w: any) => w.status === 'completed');
      const pendingWithdrawals = vendorWithdrawals.filter((w: any) => w.status === 'pending');

      // Calculate earnings
      let totalEarnings = 0;
      let thisMonthEarnings = 0;
      let lastMonthEarnings = 0;
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const allTransactions: Transaction[] = [];

      orders?.forEach(order => {
        const orderDate = new Date(order.created_at);
        const vendorShare = order.total_amount * 0.9; // 90% to vendor, 10% commission
        
        totalEarnings += vendorShare;

        // Check if this month
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          thisMonthEarnings += vendorShare;
        }

        // Check if last month
        if (orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear) {
          lastMonthEarnings += vendorShare;
        }

        // Add earning transaction
        allTransactions.push({
          id: `earning-${order.id}`,
          type: 'earning',
          amount: vendorShare,
          description: `Order ${order.order_number || order.id}`,
          created_at: order.created_at,
          status: order.status === 'delivered' ? 'completed' : 'pending'
        });

        // Add commission transaction
        allTransactions.push({
          id: `commission-${order.id}`,
          type: 'commission',
          amount: -(order.total_amount * 0.1), // Negative for commission
          description: `Commission for Order ${order.order_number || order.id}`,
          created_at: order.created_at,
          status: 'completed'
        });
      });

      // Add withdrawal transactions
      vendorWithdrawals.forEach((withdrawal: any) => {
        allTransactions.push({
          id: `withdrawal-${withdrawal.id}`,
          type: 'withdrawal',
          amount: -withdrawal.amount, // Negative for withdrawals
          description: `Withdrawal to ${withdrawal.payment_method}`,
          created_at: withdrawal.created_at,
          status: withdrawal.status
        });
      });

      // Sort transactions by date (newest first)
      allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const totalWithdrawn = completedWithdrawals.reduce((sum: number, w: any) => sum + w.amount, 0);
      const availableBalance = totalEarnings - totalWithdrawn;

      setTransactions(allTransactions);
      setStats({
        totalBalance: totalEarnings,
        availableBalance,
        totalEarnings,
        totalWithdrawn,
        thisMonthEarnings,
        lastMonthEarnings,
        pendingWithdrawals: pendingWithdrawals.length
      });
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTransactionIcon = (type: string, amount: number) => {
    if (type === 'earning') {
      return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    } else if (type === 'withdrawal') {
      return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    } else if (type === 'commission') {
      return <TrendingDown className="w-4 h-4 text-orange-600" />;
    }
    return <Wallet className="w-4 h-4 text-gray-600" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount)).replace('KSh', 'Ksh');
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading wallet...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Wallet & Earnings</h1>
      
      {/* Balance Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-green-600">{formatCurrency(stats.availableBalance)}</div>
            <p className="text-xs text-gray-600 mt-1">Ready for withdrawal</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-blue-600">{formatCurrency(stats.totalEarnings)}</div>
            <p className="text-xs text-gray-600 mt-1">All time earnings</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-purple-600">{formatCurrency(stats.thisMonthEarnings)}</div>
            <p className="text-xs text-gray-600 mt-1">
              {calculateGrowth(stats.thisMonthEarnings, stats.lastMonthEarnings) > 0 ? '+' : ''}
              {calculateGrowth(stats.thisMonthEarnings, stats.lastMonthEarnings).toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Withdrawn</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-red-600">{formatCurrency(stats.totalWithdrawn)}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.pendingWithdrawals > 0 && `${stats.pendingWithdrawals} pending`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              disabled={stats.availableBalance < 1000}
              onClick={() => {/* Handle withdrawal */}}
            >
              Withdraw Funds
            </Button>
            <Button variant="outline" onClick={() => {/* Handle export */}}>
              Export Statement
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 10).map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.type, transaction.amount)}
                        <span className="capitalize">{transaction.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className={`font-medium ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Earnings Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Earnings Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Gross Sales</span>
                <span className="font-semibold">{formatCurrency(stats.totalEarnings / 0.9)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Platform Commission (10%)</span>
                <span className="font-semibold text-red-600">-{formatCurrency(stats.totalEarnings / 0.9 * 0.1)}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-medium">Net Earnings</span>
                <span className="font-bold text-green-600">{formatCurrency(stats.totalEarnings)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="font-semibold text-green-600">{formatCurrency(stats.thisMonthEarnings)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Month</span>
                <span className="font-semibold">{formatCurrency(stats.lastMonthEarnings)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Growth</span>
                <span className={`font-semibold ${
                  calculateGrowth(stats.thisMonthEarnings, stats.lastMonthEarnings) > 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {calculateGrowth(stats.thisMonthEarnings, stats.lastMonthEarnings) > 0 ? '+' : ''}
                  {calculateGrowth(stats.thisMonthEarnings, stats.lastMonthEarnings).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorWallet; 