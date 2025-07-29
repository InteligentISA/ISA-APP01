import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  order: {
    order_number: string;
    customer_email: string;
    profiles: {
      first_name: string;
      last_name: string;
    };
  };
}

interface VendorPaymentsProps {
  vendorId: string;
}

const VendorPayments = ({ vendorId }: VendorPaymentsProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalTransactions: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, [vendorId]);

  const fetchPayments = async () => {
    // Verify vendor authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== vendorId) {
      toast({
        title: "Access Denied",
        description: "Unauthorized access to payment data.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      // Fetch payments for orders containing vendor's products
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          orders!inner (
            order_number,
            customer_email,
            profiles (
              first_name,
              last_name
            ),
            order_items!inner (
              products!inner (
                vendor_id
              )
            )
          )
        `)
        .eq('orders.order_items.products.vendor_id', vendorId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        return;
      }

      // Transform the data to match Payment interface
      const transformedPayments = (data || []).map((payment: any) => ({
        id: payment.id,
        amount: payment.amount,
        payment_method: payment.payment_method,
        status: payment.status,
        created_at: new Date().toISOString(), // Use current timestamp as fallback
        order: {
          order_number: payment.orders?.order_number || 'N/A',
          customer_email: payment.orders?.customer_email || 'N/A',
          profiles: payment.orders?.profiles || { first_name: '', last_name: '' }
        }
      }));

      setPayments(transformedPayments);
      calculateStats(transformedPayments);
    } catch (error) {
      console.error('Exception fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentsData: Payment[]) => {
    const totalRevenue = paymentsData.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const totalTransactions = paymentsData.length;
    
    // Calculate monthly revenue (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = paymentsData
      .filter(payment => {
        const paymentDate = new Date(payment.created_at);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      })
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    setStats({ totalRevenue, monthlyRevenue, totalTransactions });
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'mpesa':
        return <Badge className="bg-green-100 text-green-800">M-Pesa</Badge>;
      case 'airtel_money':
        return <Badge className="bg-red-100 text-red-800">Airtel Money</Badge>;
      case 'card':
        return <Badge className="bg-blue-100 text-blue-800">Card</Badge>;
      default:
        return <Badge variant="secondary">{method || 'Unknown'}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading payments...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Customer Payments</h1>
      
      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {stats.monthlyRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
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
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.order.order_number}
                    </TableCell>
                    <TableCell>
                      {payment.order.profiles?.first_name} {payment.order.profiles?.last_name}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">KES {Number(payment.amount).toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      {getPaymentMethodBadge(payment.payment_method)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
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