import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AdminService, PaymentData, PaymentStats } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Search, 
  Filter,
  Download,
  Eye,
  Calendar,
  Phone,
  Mail,
  ShoppingBag
} from 'lucide-react';

const PaymentSection: React.FC = () => {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const [paymentsData, statsData] = await Promise.all([
        AdminService.getSuccessfulPayments(),
        AdminService.getPaymentStats()
      ]);
      setPayments(paymentsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa':
        return '📱';
      case 'airtel_money':
        return '📲';
      default:
        return '💳';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'mpesa':
        return 'M-Pesa';
      case 'airtel_money':
        return 'Airtel Money';
      default:
        return method;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.products?.some(product => 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesMethod = filterMethod === 'all' || payment.payment_method === filterMethod;
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const exportPayments = () => {
    const csvContent = [
      ['Order Number', 'Customer', 'Email', 'Phone', 'Payment Method', 'Amount', 'Status', 'Date', 'Products', 'Vendors'],
      ...filteredPayments.map(payment => [
        payment.order_number || '',
        payment.customer_name || 'Unknown',
        payment.customer_email || '',
        payment.customer_phone || 'N/A',
        getPaymentMethodLabel(payment.payment_method || ''),
        formatPrice(payment.amount),
        payment.status,
        formatDate(payment.created_at),
        payment.products?.map(p => `${p.name} (x${p.quantity})`).join('; ') || '',
        payment.products?.map(p => p.vendor_name || 'Unknown').join('; ') || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Payment data has been exported to CSV",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Management
          </CardTitle>
          <Button onClick={exportPayments} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Payment Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-lg font-bold text-blue-900">{formatPrice(stats.totalAmount || 0)}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Successful Payments</p>
                  <p className="text-lg font-bold text-green-900">{stats.successfulPayments}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">M-Pesa Payments</p>
                  <p className="text-lg font-bold text-purple-900">{stats.mpesaPayments || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Airtel Money Payments</p>
                  <p className="text-lg font-bold text-red-900">{stats.airtelMoneyPayments || 0}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-lg font-bold text-orange-900">{stats.totalPayments}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search orders, customers, products, vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterMethod} onValueChange={setFilterMethod}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="mpesa">M-Pesa</SelectItem>
              <SelectItem value="airtel_money">Airtel Money</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="succeeded">Success</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payments Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Vendors</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="font-medium">{payment.order_number || 'N/A'}</div>
                      <div className="text-sm text-gray-500">
                        {payment.mpesa_phone_number && `📱 ${payment.mpesa_phone_number}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{payment.customer_name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {payment.customer_email || 'N/A'}
                      </div>
                      {payment.customer_phone && (
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {payment.customer_phone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {payment.products?.map((product, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-gray-500">Qty: {product.quantity}</div>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {payment.products?.map((product, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            {product.vendor_name || 'Unknown'}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getPaymentMethodIcon(payment.payment_method || '')}</span>
                        <span className="text-sm">{getPaymentMethodLabel(payment.payment_method || '')}</span>
                      </div>
                      {payment.transaction_id && (
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {payment.transaction_id.slice(0, 8)}...
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold">{formatPrice(payment.amount)}</div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(payment.created_at)}</div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredPayments.length} of {payments.length} payments
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSection; 