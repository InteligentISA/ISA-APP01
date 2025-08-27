import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, DollarSign, TrendingUp, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VendorPaymentsProps {
  vendorId: string;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  order_id?: string;
  customer_email?: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  processed_at?: string;
}

const VendorPayments = ({ vendorId }: VendorPaymentsProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingWithdrawals: 0,
    totalWithdrawn: 0,
    thisMonth: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    if (vendorId) {
      fetchPayments();
      fetchWithdrawals();
    }
  }, [vendorId]);

  const fetchPayments = async () => {
    if (!vendorId) {
      console.log('Vendor ID not available, skipping fetchPayments');
      return;
    }
    
    try {
      // Fetch payments from orders
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

      const vendorPayments: Payment[] = [];
      let totalEarnings = 0;
      let thisMonthEarnings = 0;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      orders?.forEach(order => {
        const orderDate = new Date(order.created_at);
        const isThisMonth = orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        
        // Calculate vendor's share (90% of order total)
        const vendorShare = order.total_amount * 0.9;
        totalEarnings += vendorShare;
        if (isThisMonth) {
          thisMonthEarnings += vendorShare;
        }

        vendorPayments.push({
          id: order.id,
          amount: vendorShare,
          status: order.status === 'delivered' ? 'completed' : 'pending',
          payment_method: 'platform',
          created_at: order.created_at,
          order_id: order.order_number,
          customer_email: order.customer_email
        });
      });

      setPayments(vendorPayments);
      setStats(prev => ({
        ...prev,
        totalEarnings,
        thisMonth: thisMonthEarnings
      }));
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchWithdrawals = async () => {
    if (!vendorId) {
      console.log('Vendor ID not available, skipping fetchWithdrawals');
      return;
    }
    
    try {
      // Fetch withdrawals from profiles preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', vendorId)
        .single();

      let preferences = profile?.preferences;
      if (typeof preferences === 'string') {
        try { preferences = JSON.parse(preferences); } catch { preferences = {}; }
      }

      const vendorWithdrawals: Withdrawal[] = preferences?.withdrawals || [];
      const pendingWithdrawals = vendorWithdrawals.filter(w => w.status === 'pending');
      const totalWithdrawn = vendorWithdrawals
        .filter(w => w.status === 'completed')
        .reduce((sum, w) => sum + w.amount, 0);

      setWithdrawals(vendorWithdrawals);
      setStats(prev => ({
        ...prev,
        pendingWithdrawals: pendingWithdrawals.length,
        totalWithdrawn
      }));
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestWithdrawal = async (amount: number) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', vendorId)
        .single();

      let preferences = profile?.preferences;
      if (typeof preferences === 'string') {
        try { preferences = JSON.parse(preferences); } catch { preferences = {}; }
      }

      const newWithdrawal: Withdrawal = {
        id: Date.now().toString(),
        amount,
        status: 'pending',
        payment_method: 'mpesa', // Default to mpesa
        created_at: new Date().toISOString()
      };

      const updatedWithdrawals = [...(preferences?.withdrawals || []), newWithdrawal];
      preferences = { ...preferences, withdrawals: updatedWithdrawals };

      await supabase
        .from('profiles')
        .update({ preferences })
        .eq('id', vendorId);

      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted for processing.",
      });

      fetchWithdrawals();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request withdrawal. Please try again.",
        variant: "destructive"
      });
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('KSh', 'Ksh');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading payments...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payments & Withdrawals</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-green-600">{formatCurrency(stats.totalEarnings)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-blue-600">{formatCurrency(stats.thisMonth)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Pending Withdrawals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-yellow-600">{stats.pendingWithdrawals}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Withdrawn</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-purple-600">{formatCurrency(stats.totalWithdrawn)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Section */}
      <Card>
        <CardHeader>
          <CardTitle>Request Withdrawal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">Available for withdrawal: {formatCurrency(stats.totalEarnings - stats.totalWithdrawn)}</p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => requestWithdrawal(1000)}
                  disabled={stats.totalEarnings - stats.totalWithdrawn < 1000}
                  size="sm"
                >
                  Withdraw Ksh 1,000
                </Button>
                <Button 
                  onClick={() => requestWithdrawal(5000)}
                  disabled={stats.totalEarnings - stats.totalWithdrawn < 5000}
                  size="sm"
                >
                  Withdraw Ksh 5,000
                </Button>
                <Button 
                  onClick={() => requestWithdrawal(stats.totalEarnings - stats.totalWithdrawn)}
                  disabled={stats.totalEarnings - stats.totalWithdrawn <= 0}
                  size="sm"
                  variant="outline"
                >
                  Withdraw All
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No withdrawal requests yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processed Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>
                      {new Date(withdrawal.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(withdrawal.amount)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {withdrawal.payment_method}
                    </TableCell>
                    <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                    <TableCell>
                      {withdrawal.processed_at 
                        ? new Date(withdrawal.processed_at).toLocaleDateString()
                        : '-'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No payments received yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.slice(0, 10).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {payment.order_id || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {payment.customer_email || 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorPayments; 