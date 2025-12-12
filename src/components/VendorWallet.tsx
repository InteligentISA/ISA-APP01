import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
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
  const [stats, setStats] = useState({ totalBalance: 0, availableBalance: 0, totalEarnings: 0, totalWithdrawn: 0, thisMonthEarnings: 0, lastMonthEarnings: 0, pendingWithdrawals: 0 });

  useEffect(() => { if (vendorId) fetchWalletData(); }, [vendorId]);

  const fetchWalletData = async () => {
    if (!vendorId) return;
    try {
      const { data: orders } = await supabase.from('orders').select(`*, order_items (*, products!inner (vendor_id))`).eq('order_items.products.vendor_id', vendorId);
      const { data: profile } = await supabase.from('profiles').select('preferences').eq('id', vendorId).single();

      let preferences: any = profile?.preferences || {};
      if (typeof preferences === 'string') { try { preferences = JSON.parse(preferences); } catch { preferences = {}; } }

      const vendorWithdrawals = Array.isArray(preferences?.withdrawals) ? preferences.withdrawals : [];
      const completedWithdrawals = vendorWithdrawals.filter((w: any) => w.status === 'completed');
      const pendingWithdrawals = vendorWithdrawals.filter((w: any) => w.status === 'pending');

      let totalEarnings = 0, thisMonthEarnings = 0, lastMonthEarnings = 0;
      const currentDate = new Date(), currentMonth = currentDate.getMonth(), currentYear = currentDate.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const allTransactions: Transaction[] = [];

      orders?.forEach(order => {
        const orderDate = new Date(order.created_at || '');
        const vendorShare = order.total_amount * 0.9;
        totalEarnings += vendorShare;
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) thisMonthEarnings += vendorShare;
        if (orderDate.getMonth() === lastMonth) lastMonthEarnings += vendorShare;

        allTransactions.push({ id: `earning-${order.id}`, type: 'earning', amount: vendorShare, description: `Order ${order.order_number || order.id}`, created_at: order.created_at || '', status: order.status === 'delivered' ? 'completed' : 'pending' });
      });

      vendorWithdrawals.forEach((withdrawal: any) => {
        allTransactions.push({ id: `withdrawal-${withdrawal.id}`, type: 'withdrawal', amount: -withdrawal.amount, description: `Withdrawal to ${withdrawal.payment_method}`, created_at: withdrawal.created_at, status: withdrawal.status });
      });

      allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const totalWithdrawn = completedWithdrawals.reduce((sum: number, w: any) => sum + w.amount, 0);

      setTransactions(allTransactions);
      setStats({ totalBalance: totalEarnings, availableBalance: totalEarnings - totalWithdrawn, totalEarnings, totalWithdrawn, thisMonthEarnings, lastMonthEarnings, pendingWithdrawals: pendingWithdrawals.length });
    } catch (error) { console.error('Error fetching wallet data:', error); } finally { setLoading(false); }
  };

  const formatCurrency = (amount: number) => `Ksh ${Math.abs(amount).toLocaleString()}`;

  if (loading) return <div className="flex justify-center items-center h-64">Loading wallet...</div>;

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Wallet & Earnings</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs md:text-sm font-medium">Available Balance</CardTitle><Wallet className="h-4 w-4 text-green-600" /></CardHeader><CardContent><div className="text-lg md:text-2xl font-bold text-green-600">{formatCurrency(stats.availableBalance)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs md:text-sm font-medium">Total Earnings</CardTitle><DollarSign className="h-4 w-4 text-blue-600" /></CardHeader><CardContent><div className="text-lg md:text-2xl font-bold text-blue-600">{formatCurrency(stats.totalEarnings)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs md:text-sm font-medium">This Month</CardTitle><TrendingUp className="h-4 w-4 text-purple-600" /></CardHeader><CardContent><div className="text-lg md:text-2xl font-bold text-purple-600">{formatCurrency(stats.thisMonthEarnings)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs md:text-sm font-medium">Total Withdrawn</CardTitle><ArrowDownRight className="h-4 w-4 text-red-600" /></CardHeader><CardContent><div className="text-lg md:text-2xl font-bold text-red-600">{formatCurrency(stats.totalWithdrawn)}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          {transactions.length === 0 ? <div className="text-center py-8 text-gray-500">No transactions yet.</div> : (
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {transactions.slice(0, 10).map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                    <TableCell><div className="flex items-center gap-2">{transaction.type === 'earning' ? <ArrowUpRight className="w-4 h-4 text-green-600" /> : <ArrowDownRight className="w-4 h-4 text-red-600" />}<span className="capitalize">{transaction.type}</span></div></TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>{transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell><Badge className={transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{transaction.status}</Badge></TableCell>
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

export default VendorWallet;