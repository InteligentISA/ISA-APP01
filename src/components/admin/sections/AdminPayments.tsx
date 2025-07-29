import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
    fetchWithdrawals();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select(`
          *,
          profiles!withdrawals_user_id_fkey(first_name, last_name, email, business_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

  const handleWithdrawalStatus = async (withdrawalId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({ status: newStatus })
        .eq('id', withdrawalId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Withdrawal ${newStatus}`,
      });

      fetchWithdrawals();
    } catch (error) {
      console.error('Error updating withdrawal status:', error);
      toast({
        title: "Error",
        description: "Failed to update withdrawal status",
        variant: "destructive"
      });
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

  const filteredPayments = selectedStatus === "all" 
    ? payments 
    : payments.filter(payment => payment.payment_status === selectedStatus);

  const filteredWithdrawals = selectedStatus === "all" 
    ? withdrawals 
    : withdrawals.filter(withdrawal => withdrawal.status === selectedStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
        <p className="text-gray-600 mt-2">Manage payment transactions and vendor withdrawals</p>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(payments.filter(p => p.payment_status === 'completed').reduce((sum, p) => sum + (p.total_amount || 0), 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {payments.filter(p => p.payment_status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {withdrawals.filter(w => w.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(withdrawals.filter(w => w.status === 'completed').reduce((sum, w) => sum + (w.amount || 0), 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Withdrawals */}
      {withdrawals.filter(w => w.status === 'pending').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Pending Withdrawals ({withdrawals.filter(w => w.status === 'pending').length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Requested Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.filter(w => w.status === 'pending').map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell className="font-medium">
                      {withdrawal.profiles?.business_name || 
                       `${withdrawal.profiles?.first_name || ''} ${withdrawal.profiles?.last_name || ''}`.trim() || 
                       'N/A'}
                    </TableCell>
                    <TableCell>
                      {formatPrice(withdrawal.amount || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{withdrawal.payment_method}</Badge>
                    </TableCell>
                    <TableCell>{withdrawal.account_number || 'N/A'}</TableCell>
                    <TableCell>
                      {withdrawal.created_at 
                        ? new Date(withdrawal.created_at).toLocaleDateString() 
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleWithdrawalStatus(withdrawal.id, 'completed')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleWithdrawalStatus(withdrawal.id, 'rejected')}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payment Transactions</CardTitle>
          <div className="flex items-center gap-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
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
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    #{payment.id.slice(-8)}
                  </TableCell>
                  <TableCell>
                    {payment.profiles?.first_name && payment.profiles?.last_name 
                      ? `${payment.profiles.first_name} ${payment.profiles.last_name}`
                      : payment.profiles?.email?.split('@')[0] || 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    {formatPrice(payment.total_amount || 0)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{payment.payment_method || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        payment.payment_status === 'completed' ? 'default' : 
                        payment.payment_status === 'pending' ? 'secondary' : 
                        payment.payment_status === 'failed' ? 'destructive' : 'outline'
                      }
                    >
                      {payment.payment_status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {payment.created_at 
                      ? new Date(payment.created_at).toLocaleDateString() 
                      : 'N/A'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredPayments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {selectedStatus === "all" 
                ? "No payments found" 
                : `No payments with status: ${selectedStatus}`
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPayments; 